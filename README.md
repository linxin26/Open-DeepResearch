# DeepResearch-Agent 后端

这是一个基于 LangGraph 的深度研究Agent项目。它利用大型语言模型（LLM）进行多步骤研究，包括查询生成、网络搜索、结果反思和最终答案的总结。项目通过 FastAPI 提供 API 接口，并支持灵活的配置。

## 项目结构

```
/
├── web                 # 前端
├── backend             # 后端Agent
```


## 后端Agent程序
```
cd backend
uvicorn agent.graph_server:app --reload --host 0.0.0.0 --port 8000

```

## 前端
```
cd web

npm install --legacy-peer-deps

npm run dev 
```