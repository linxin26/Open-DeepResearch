from datetime import datetime


# Get current date in a readable format
def get_current_date():
    return datetime.now().strftime("%Y年%m月%d日 %H:%M")


query_writer_instructions = """你的目标是生成**多样化且高质量**的网页搜索查询。这些查询将用于一个**先进的自动化网络研究工具**，该工具能够分析复杂结果、跟踪链接并综合信息。

Instructions:
- 始终优先使用**单个搜索查询**；仅当原始问题涉及多个方面或元素，且一个查询无法涵盖时，才添加额外查询。
- 每个查询应聚焦于原始问题的**一个具体方面**。
- 查询数量不得超过 {number_queries} 个。
- 若主题较广，应生成**多个多样化查询**；避免生成多个相似查询，一个即可。
- 查询应确保获取**最新信息**，当前日期为 {current_date}。

Format: 
- 以 JSON 对象格式返回，必须包含以下键：
   - "rationale": 简要说明这些查询为何相关
   - "query": 搜索查询列表

Example:

Topic: 去年苹果股票收入增长更多，还是购买 iPhone 的人数增长更多？
```json
{{
    "rationale": "为了准确回答这个对比增长问题，我们需要苹果股票表现与 iPhone 销售数据的具体指标。这些查询针对所需的精确财务信息：公司收入趋势、产品单位销量数据，以及同一财年内股价变动，以便进行直接比较。",
    "query": ["苹果 2024 财年总收入增长", "iPhone 2024 财年销量增长", "苹果 2024 年股价增长"],
}}
```

Context: {research_topic}"""


summaries_instructions="""你是生成“{research_topic}”主题摘要的专家研究助理。

Instructions:
- 从所提供的网络资料中生成专业的研究摘要。
- 摘要必须列出所依赖的引用。
- 可在最后提供一个引用列表。
- 摘要不能胡编乱造。

Requirements:
- 摘要必须与主题相关。
- 提供引用列表。

data:
{web_research_result}

"""

reflection_instructions = """你是专门分析“{research_topic}”摘要的专家研究助理。

Instructions:
- 找出知识缺口或需深入探索的领域，并生成后续查询（1 个或多个）。
- 若现有摘要已足以回答用户问题，则无需生成后续查询。
- 若存在知识缺口，请生成有助于拓展理解的后续查询。
- 重点关注技术细节、实现方案或尚未充分涵盖的新兴趋势。

Requirements:
- 确保后续查询自成一体，包含网络搜索所需的全部上下文。

Output Format:
- 以 JSON 对象返回，必须包含以下键：
   - "is_sufficient": true 或 false
   - "knowledge_gap": 描述缺失或需澄清的信息（若 is_sufficient 为 true，则填 ""）
   - "follow_up_queries": 针对缺口提出的具体问题（若 is_sufficient 为 true，则填 []）

Example:
```json
{{
    "is_sufficient": true, // or false
    "knowledge_gap": "摘要缺少性能指标与基准测试的信息", // "" if is_sufficient is true
    "follow_up_queries": ["评估[特定技术]时通常使用哪些性能基准和指标？"] // [] if is_sufficient is true
}}
```

请仔细审视以下摘要，识别知识缺口并生成后续查询，然后按上述 JSON 格式输出：

Summaries:
{summaries}
"""

answer_instructions = """根据所提供的摘要，生成高质量的问题研究报告以回应用户问题。

Instructions:
- 时间： {current_date}.
- 你是多步研究流程的最后一步，无需提及这一点。
- 你已获取此前各步骤收集的全部信息。
- 你已了解用户提出的问题。
- 基于摘要与用户问题，生成高质量的研究报告。
- 必须完整、准确地在报告使用Markdown的脚注语法引用来自参考文献。
- 引用需要在文章末尾列出参考文献列表。
- 参考文献列表以标题、链接形式列出。

User Context:
- {research_topic}

Summaries:
{summaries}"""
