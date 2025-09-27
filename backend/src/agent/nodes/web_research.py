from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI

from agent.configuration import Configuration
from agent.common.prompts import summaries_instructions, get_current_date
from agent.common.state import OverallState, WebSearchState
from agent.common.utils import get_research_topic
from agent.common.search_util import search_data
import logging

logger = logging.getLogger("web_research")

async def web_research(state: WebSearchState, config: RunnableConfig) -> OverallState:
    """LangGraph 节点，使用 网络搜索工具 获取数据。

    该节点通过 网络搜索 API 执行网络搜索，并将结果格式化以便后续处理。


    Args:
        state: 当前图状态，包含搜索查询和研究循环计数
        config: 可运行实例的配置，包括搜索 API 设置

    Returns:
        包含状态更新的字典，其中包含 sources_gathered、research_loop_count 和 web_research_results
    """
    # Configure
    logger.info("web_research")
    configurable = Configuration.from_runnable_config(config)
    query = state["search_query"]
    sources_gathered = []
    
    
    dataList=await search_data(query=query,
                               api_key=configurable.tavily_api_key,
                               result_max=configurable.search_result_max)
    # dataList=[query]
    # Format the prompt
    current_date = get_current_date()
    logger.info(f"dataList:{len(dataList)}")
    formatted_prompt = summaries_instructions.format(
        research_topic=get_research_topic(state["search_query"]),
        web_research_result="\n\n---\n\n".join(str(dataList)),
    )
    llm = ChatOpenAI(
        model=configurable.model,
        temperature=1.0,
        max_retries=2,
        base_url=configurable.openai_api_base,
        api_key=configurable.openai_api_key,
    )
    result = await llm.ainvoke(formatted_prompt)
    data={
        "sources_gathered": sources_gathered,
        "search_query": [query],
        "web_research_result": [result.content],
    }
    return data
