import json
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent.graph import graph_instance
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("graph")

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

class Search(BaseModel):
    name: str

def sse_format(payload):
    return f"data: {json.dumps(payload)}\n\n"

# appGraph = create_workflow()

@app.post("/stream")
async def stream(search: Search):
    logger.info(f"Received request for topic: {search}")
    initial_state = {"messages": [{
                        "role": "user",
                        "content": "你好"
                    }], "step_count": 0, "result": ""}
    async def stream_generator():
        for output in graph_instance.graph.stream(initial_state, stream_mode="updates"):
            for node_name, updates in output.items():
                logger.info(f"{node_name} 更新了: {updates}")
                yield sse_format(
                    {"content": updates, "type": "poem", "thinking": False}
                )

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

from langgraph.pregel.io import AddableUpdatesDict
@app.post("/streams")
async def stream(search: Search):
    logger.info(f"Received request for topic: {search}")

    async def stream_generator():   
        async for msg in graph_instance.graph.astream(
            {
                    "messages": [{
                        "role": "user",
                        "content": search.name
                    }]
            },
            stream_mode="updates" #"updates,"#"messages",
        ):
            logger.info("%s,%s",msg.keys(),type(msg))
            if isinstance(msg, AddableUpdatesDict):
                if 'finalize_answer' in msg:
                    logger.info(msg['finalize_answer'])
                    msg={'finalize_answer':{
                        'messages':[{'content':msg['finalize_answer']['messages'][0].content}]
                    }}#msg['finalize_answer']['messages'][0].content
                else:
                    msg=msg
            yield f"event:updates\ndata:{json.dumps(msg,ensure_ascii=False)}\n\n"
            # yield sse_format(
            #             {"content": msg, "type": "joke", "thinking": False}
            #         )

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
