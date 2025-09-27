from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI

from agent.configuration import Configuration
from agent.common.prompts import get_current_date, query_writer_instructions
from agent.common.state import OverallState, QueryGenerationState
from agent.common.schemas import SearchQueryList
from agent.common.utils import get_research_topic
import logging

logger = logging.getLogger("generate_query")

def generate_query(state: OverallState, config: RunnableConfig) -> QueryGenerationState:
    """LangGraph 节点，根据用户问题生成搜索查询。
    该节点利用配置的 LLM，基于用户问题为网络研究生成经过优化的搜索查询。

    Args:
        state: 当前图状态，包含用户问题
        config: 可运行实例的配置，包括 LLM 提供商设置

    Returns:
        包含状态更新的字典，其中 search_query 键为生成的查询
    """
    configurable = Configuration.from_runnable_config(config)
    # check for custom initial search query count
    if state.get("initial_search_query_count") is None:
        state["initial_search_query_count"] = configurable.number_of_initial_queries
    logger.info(f"initial_search_query_count: {state.get("initial_search_query_count")}")
    llm = ChatOpenAI(
        model=configurable.model,
        temperature=1.0,
        max_retries=2,
        base_url=configurable.openai_api_base,
        api_key=configurable.openai_api_key,
    )
    structured_llm = llm.with_structured_output(SearchQueryList)

    #Prompt
    current_date = get_current_date()
    formatted_prompt = query_writer_instructions.format(
        current_date=current_date,
        research_topic=get_research_topic(state["messages"]),
        number_queries=state["initial_search_query_count"],
    )
    # 生成搜索查询
    result = structured_llm.invoke(formatted_prompt)
    logger.info("generate_query :%s",result)
    state["querys"]=result
    #没更新到 OverallState 中的Key不会触发updates事件
    return {"query_list": result.query}
