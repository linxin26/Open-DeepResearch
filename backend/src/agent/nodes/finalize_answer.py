from langchain_core.messages import AIMessage
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig

from agent.configuration import Configuration
from agent.common.prompts import answer_instructions, get_current_date
from agent.common.state import OverallState
from agent.common.utils import get_research_topic
import logging

logger = logging.getLogger("finalize_answer")

def finalize_answer(state: OverallState, config: RunnableConfig):
    """LangGraph 节点，用于完成研究摘要。
      该节点通过去重和格式化来源，将其与正在进行的摘要结合，生成结构清晰、引用规范的研究报告。

    Args:
        state: 当前图状态，包含正在撰写的摘要和已收集的来源

    Returns:
        包含状态更新的字典，其中 sources_gathered 键包含原始引用
    """
    configurable = Configuration.from_runnable_config(config)

    # Format the prompt
    current_date = get_current_date()
    logger.info("current_date: %s",current_date)
    formatted_prompt = answer_instructions.format(
        current_date=current_date,
        research_topic=get_research_topic(state["messages"]),
        summaries="\n---\n\n".join(state["web_research_result"]),
    )

    llm = ChatOpenAI(
        model=configurable.model,
        temperature=0,
        max_retries=2,
        base_url=configurable.openai_api_base,
        api_key=configurable.openai_api_key,
    )
    result = llm.invoke(formatted_prompt)

    return {
        "messages": [AIMessage(content=result.content)],
        "sources_gathered": state["sources_gathered"],
    }
