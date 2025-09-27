from __future__ import annotations

from dataclasses import dataclass, field
from typing import TypedDict

from langgraph.graph import add_messages
from typing_extensions import Annotated


import operator
from dataclasses import dataclass, field
from typing_extensions import Annotated


class OverallState(TypedDict):
    """
    定义了整个研究代理的整体状态。
    """
    messages: Annotated[list, add_messages]  # 消息列表，用于跟踪对话历史
    search_query: Annotated[list, operator.add]  # 搜索查询列表，用于累积搜索请求
    web_research_result: Annotated[list, operator.add]  # 网络研究结果列表，用于累积研究发现
    sources_gathered: Annotated[list, operator.add]  # 收集到的来源列表
    initial_search_query_count: int  # 初始搜索查询的数量
    max_research_loops: int  # 最大研究循环次数
    research_loop_count: int  # 当前研究循环计数
    reasoning_model: str  # 用于推理的模型名称


class ReflectionState(TypedDict):
    """
    定义了反思步骤的状态。
    """
    is_sufficient: bool  # 标记当前信息是否足以回答用户问题
    knowledge_gap: str  # 描述存在的知识空白或需要澄清的信息
    follow_up_queries: Annotated[list, operator.add]  # 后续查询列表，用于弥补知识空白
    research_loop_count: int  # 当前研究循环计数
    number_of_ran_queries: int  # 已运行的查询数量


class Query(TypedDict):
    """
    定义了单个查询的结构。
    """
    query: str  # 查询字符串
    rationale: str  # 查询的基本原理或理由


class QueryGenerationState(TypedDict):
    """
    定义了查询生成步骤的状态。
    """
    query_list: list[Query]  # 生成的查询列表


class WebSearchState(TypedDict):
    """
    定义了网络搜索步骤的状态。
    """
    search_query: str  # 当前正在执行的网络搜索查询
    id: str  # 搜索的唯一标识符


@dataclass(kw_only=True)
class SearchStateOutput:
    """
    定义了搜索状态的输出，主要用于最终报告。
    """
    running_summary: str = field(default=None)  # 最终报告或运行中的摘要
