import os

from dotenv import load_dotenv
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.pregel import RetryPolicy

from agent.configuration import Configuration
from agent.nodes.generate_query import generate_query
from agent.nodes.web_research import web_research
from agent.nodes.reflection import reflection
from agent.nodes.finalize_answer import finalize_answer
from agent.common.prompts import (
    get_current_date,
)
from agent.common.state import (
    OverallState,
    QueryGenerationState,
    ReflectionState,
)
from langchain_core.runnables import RunnableConfig # This is needed for evaluate_research
import logging

logger = logging.getLogger("graph")

load_dotenv()

os.environ['TAVILY_API_KEY'] = os.getenv('TAVILY_API_KEY', '')


class ResearchAgentGraph:
    def __init__(self):
        self.graph = self._build_graph()

    def _continue_to_web_research(self, state: QueryGenerationState):
        """LangGraph 边，用于将搜索查询发送给网络研究节点。
            会启动 n 个网络研究节点，每个查询对应一个。
            “map-reduce”工作流：图会并行多次调用同一节点，每次传入不同的状态，最后再将结果汇总回主图的状态中。
            进入下一个节点
        """
        return [
            Send("web_research", {"search_query": search_query, "id": int(idx)})
            for idx, search_query in enumerate(state["query_list"])
        ]

    def _evaluate_research(
        self,
        state: ReflectionState,
        config: RunnableConfig,
    ) -> OverallState:
        """LangGraph 路由函数，用于在研究流程中决定下一步操作。
           该函数通过判断是否继续收集信息或直接完成摘要，来控制研究循环。判断依据为当前研究循环次数与配置的最大研究循环次数。

        Args:
            state: 当前图状态，包含研究循环次数
            config: 可运行实例的配置，包括 max_research_loops 设置

        Returns:
            字符串，指示下一个要访问的节点（"web_research" 或 "finalize_summary"）
        """
        configurable = Configuration.from_runnable_config(config)
        max_research_loops = (
            state.get("max_research_loops")
            if state.get("max_research_loops") is not None
            else configurable.max_research_loops
        )
        logger.info(f"is_sufficient: %s,research_loop_count: %s",
                    state["is_sufficient"],
                    state["research_loop_count"])
        if state["is_sufficient"] or state["research_loop_count"] >= max_research_loops:
            return "finalize_answer"
        else:
            return [
                Send(
                    "web_research",
                    {
                        "search_query": follow_up_query,
                        "id": state["number_of_ran_queries"] + int(idx),
                    },
                )
                for idx, follow_up_query in enumerate(state["follow_up_queries"])
            ]

    def _build_graph(self):
        # 创建 Agent Graph
        builder = StateGraph(OverallState, config_schema=Configuration)

        from tavily import InvalidAPIKeyError
        # 定义将在循环中使用的节点
        builder.add_node("generate_query", generate_query)
        builder.add_node("web_research", web_research,
        retry=RetryPolicy(max_attempts=3))
        builder.add_node("reflection", reflection)
        builder.add_node("finalize_answer", finalize_answer)

        # 将 generate_query 设置为入口点 即该节点为首个被调用的节点
        builder.add_edge(START, "generate_query")
        # 添加条件边，在并行分支中继续执行搜索查询
        builder.add_conditional_edges(
            "generate_query", self._continue_to_web_research, ["web_research"]
        )
        # 连接网络搜索节点到反思节点
        builder.add_edge("web_research", "reflection")
        # 评估研究结果
        builder.add_conditional_edges(
            "reflection", self._evaluate_research, ["web_research", "finalize_answer"]
        )
        # 最终确定答案
        builder.add_edge("finalize_answer", END)
        return builder.compile(name="research-agent")

graph_instance = ResearchAgentGraph()
graph = graph_instance.graph
