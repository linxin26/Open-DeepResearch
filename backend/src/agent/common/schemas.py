from typing import List
from pydantic import BaseModel, Field


class SearchQueryList(BaseModel):
    """
    定义了用于网络研究的搜索查询列表及其理由。
    """
    query: List[str] = Field(
        description="用于网络研究的搜索查询列表." 
    )
    rationale: str = Field(
        description="简要解释这些查询与研究主题的相关性."
    )


class Reflection(BaseModel):
    """
    定义了反思过程的输出，包括信息是否充足、知识空白和后续查询。
    """
    is_sufficient: bool = Field(
        description="提供的摘要是否足以回答用户问题." 
    )
    knowledge_gap: str = Field(
        description="描述缺失或需要澄清的信息."
    )
    follow_up_queries: List[str] = Field(
        description="用于解决知识空白的后续查询列表."
    )
