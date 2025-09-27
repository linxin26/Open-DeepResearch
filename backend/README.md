# DeepResearch-Agent 后端

这是一个基于 LangGraph 的深度研究Agent后端项目。它利用大型语言模型（LLM）进行多步骤研究，包括查询生成、网络搜索、结果反思和最终答案的总结。项目通过 FastAPI 提供 API 接口，并支持灵活的配置。

## 项目结构

```
backend/
├── .env                # 环境变量配置文件
├── .env.example        # 环境变量示例文件
├── .gitignore          # Git 忽略文件
└── src/
    └── agent/
        ├── __init__.py
        ├── app.py              # FastAPI 应用入口，包含前端服务挂载
        ├── configuration.py    # 代理配置，定义了模型、查询数量、研究循环等参数
        ├── graph.py            # LangGraph 图的定义，包括节点和边
        ├── graph_server.py     # FastAPI 服务器，提供 LangGraph 流式 API 接口
        ├── common/             # 常用工具和定义
        │   ├── prompts.py      # 提示词定义
        │   ├── schemas.py      # 数据模型定义
        │   ├── search_util.py  # 搜索工具
        │   ├── state.py        # LangGraph 状态定义
        │   └── utils.py        # 常用工具函数
        ├── demo/               # 演示脚本
        │   ├── .env
        │   ├── cli_research.py
        │   ├── crawl4ai_test.py
        │   └── mcp_demo.py
        └── nodes/              # LangGraph 节点实现
            ├── finalize_answer.py  # 最终答案生成节点
            ├── generate_query.py   # 查询生成节点
            ├── reflection.py       # 反思节点
            └── web_research.py     # 网络研究节点
```

## 功能特性

*   **多步骤研究代理**: 利用 LangGraph 构建，实现复杂的查询生成、网络搜索、结果反思和答案总结流程。
*   **FastAPI 服务**: 提供 RESTful API 接口，支持流式响应。
*   **可配置性**: 通过 `.env` 文件和 `configuration.py` 灵活配置 LLM 模型、API 密钥、初始查询数量和最大研究循环次数。
*   **前端集成**: `app.py` 中集成了前端服务（如果存在），方便部署。
*   **模块化设计**: 节点、状态、配置等模块化，易于扩展和维护。

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/linxin26/DeepResearch-Agent.git
cd DeepResearch-Agent/backend
```

### 2. 设置环境变量

复制 `.env.example` 文件并重命名为 `.env`，然后根据您的需求填写 API 密钥和模型配置。

```bash
cp .env.example .env
```

编辑 `.env` 文件，例如：

```ini
OPENAI_API_BASE=https://generativelanguage.googleapis.com/v1beta/openai/
OPENAI_API_KEY=YOUR_GOOGLE_API_KEY
LANGSMITH_API_KEY=YOUR_LANGSMITH_API_KEY
GOOGLE_SEARCH_API_KEY=YOUR_GOOGLE_SEARCH_API_KEY
GOOGLE_SEARCH_CX=YOUR_GOOGLE_SEARCH_ENGINE_ID
MODEL=gemini-2.0-flash
TAVILY_API_KEY=YOUR_TAVILY_API_KEY
```

**注意**: 您可以根据需要选择不同的 LLM 提供商，例如 OpenAI、Moonshot、OpenRouter 等，并相应地配置 `OPENAI_API_BASE` 和 `OPENAI_API_KEY`。`MODEL` 变量用于指定要使用的具体模型。

### 3. 安装依赖

建议使用 `uv` 或 `pip` 创建虚拟环境并安装依赖。

```bash
# 使用 uv (推荐)
uv venv
source .venv/bin/activate # Linux/macOS
.venv\Scripts\activate    # Windows
uv pip install -r requirements.txt

# 或者使用 pip
python -m venv .venv
source .venv/bin/activate # Linux/macOS
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

### 4. 运行后端服务

```bash
uvicorn agent.graph_server:app --reload --host 0.0.0.0 --port 8000
```

服务将在 `http://localhost:8000` 上运行。

### 5. 使用 API

您可以通过 `/streams` 接口与研究代理进行交互。例如，使用 `curl`：

```bash
curl -X POST "http://localhost:8000/streams" \
     -H "Content-Type: application/json" \
     -d '{"name": "介绍一下 LangGraph"}'
```

或者通过前端界面进行交互（如果前端已部署并挂载）。

## 配置

`backend/src/agent/configuration.py` 文件定义了代理的各种配置参数：

*   `query_generator_model`: 用于查询生成的 LLM 模型。
*   `reflection_model`: 用于反思的 LLM 模型。
*   `answer_model`: 用于答案总结的 LLM 模型。
*   `number_of_initial_queries`: 初始生成的搜索查询数量。
*   `max_research_loops`: 最大研究循环次数。
*   `openai_api_base`: OpenAI 兼容 API 的基础 URL。
*   `openai_api_key`: OpenAI 兼容 API 的密钥。
*   `model`: 要使用的具体 LLM 模型名称。
*   `search_result_max`：搜索返回最大结果数。
*   `tavily_api_key`: tavily apiKey。

这些参数可以通过 `.env` 文件或在代码中进行修改。

## 贡献

欢迎贡献！如果您有任何建议或发现 Bug，请提交 Issue 或 Pull Request。

## 许可证

本项目采用 MIT 许可证。
