import os
from typing import Any, Optional

from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field


class Configuration(BaseModel):
    """代理的配置。"""
    query_generator_model: str = Field(
        default="gemini-2.0-flash",
        metadata={
            "description": "用于代理查询生成的语言模型的名称。" 
        },
    )

    reflection_model: str = Field(
        default="gemini-2.0-flash",
        metadata={
            "description": "用于代理反思的语言模型的名称。"
        },
    )

    answer_model: str = Field(
        default="gemini-2.0-flash",
        metadata={
            "description": "用于代理答案的语言模型的名称。"
        },
    )

    number_of_initial_queries: int = Field(
        default=3,
        metadata={"description": "要生成的初始搜索查询的数量。"},
    )

    max_research_loops: int = Field(
        default=1,
        metadata={"description": "执行研究循环的最大次数。"},
    )

    openai_api_base: str = Field(
        default="http://localhost:8090/v1",
        metadata={"description": "OpenAI API 的基础 URL。"},
    )

    openai_api_key: str = Field(
        default="xxx",
        metadata={"description": "OpenAI API 的 API 密钥。"},
    )

    model: str = Field(
        default="xxx",
        metadata={"description": "要使用的语言模型的名称。"},
    )

    search_result_max:str=Field(
        default="3",
        metadata={"description": "搜索返回最大结果数。"},
    )

    tavily_api_key:str=Field(
        default="xxx",
        metadata={"description": "tavily apiKey。"},
    )

    @classmethod
    def from_runnable_config(
        cls, config: Optional[RunnableConfig] = None
    ) -> "Configuration":
        """从 RunnableConfig 创建一个 Configuration 实例。"""
        configurable = (
            config["configurable"] if config and "configurable" in config else {}
        )

        # 从环境变量或配置中获取原始值
        raw_values: dict[str, Any] = {
            name: os.environ.get(name.upper(), configurable.get(name))
            for name in cls.model_fields.keys()
        }

        # 过滤掉 None 值
        values = {k: v for k, v in raw_values.items() if v is not None}

        return cls(**values)
