from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI

from agent.configuration import Configuration
from agent.common.prompts import reflection_instructions, get_current_date
from agent.common.state import OverallState, ReflectionState
from agent.common.schemas import Reflection
from agent.common.utils import get_research_topic
import logging

logger = logging.getLogger("reflection")

def reflection(state: OverallState, config: RunnableConfig) -> ReflectionState:
    """LangGraph 节点，沉思，用于识别知识差距并生成潜在的后续查询。
      分析当前摘要以确定需要进一步研究的领域并生成 潜在的后续查询。使用结构化输出提取 JSON 格式的后续查询。

      web_research_result包含多个web_research节点生成的数据。
    Args:
        state: 当前图状态，包含运行中的摘要和研究主题
        config: 可运行实例的配置，包括 LLM 提供商设置

    Returns:
        包含状态更新的字典，其中 search_query 键为生成的后续查询
    """
    configurable = Configuration.from_runnable_config(config)
    # 递增研究循环计数
    state["research_loop_count"] = state.get("research_loop_count", 0) + 1    
    # Format the prompt
    current_date = get_current_date()
    formatted_prompt = reflection_instructions.format(
        current_date=current_date,
        research_topic=get_research_topic(state["messages"]),
        summaries="\n\n---\n\n".join(state["web_research_result"]),
    )
    llm = ChatOpenAI(
        model=configurable.model,
        temperature=1.0,
        max_retries=2,
        base_url=configurable.openai_api_base,
        api_key=configurable.openai_api_key,
    )
    result = llm.with_structured_output(Reflection).invoke(formatted_prompt)

    logger.info("search_query: %s",state["search_query"])
    return {
        "is_sufficient": result.is_sufficient,
        "knowledge_gap": result.knowledge_gap,
        "follow_up_queries": result.follow_up_queries,
        "research_loop_count": state["research_loop_count"],
        "number_of_ran_queries": len(state["search_query"]),
    }
