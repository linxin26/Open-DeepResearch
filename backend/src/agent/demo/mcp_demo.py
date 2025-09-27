import asyncio
from fastmcp import Client, FastMCP
import requests
from langchain_community.tools.tavily_search import TavilySearchResults
import os
from dotenv import load_dotenv
# In-memory server (ideal for testing)
# server = FastMCP("TestServer")
# client = Client(server)

# HTTP server


# Local Python script
# client = Client("my_mcp_server.py")

load_dotenv()

async def load_page():
    fetch= "http://127.0.0.1:8000/fetch"
    urls=[]
    urls.append("https://www.qq.com")
    dataList=[]
    for u in urls:
        response=requests.post(
            url=fetch,
            json={
                "url":u
            })
        response.raise_for_status()
        dataList.append(response.json())
    print(dataList)

async def main():
    client = Client("http://192.168.6.4:3000/mcp")
    async with client:
        # Basic server interaction
        await client.ping()
        
        # List available operations
        tools = await client.list_tools()
        # resources = await client.list_resources()
        # prompts = await client.list_prompts()
        
        # Execute operations
        result = await client.call_tool("search", {"query": "海南"})
        print(result)

# asyncio.run(load_page())

os.environ['TAVILY_API_KEY'] = os.getenv('TAVILY_API_KEY', '')

def search_tool(query: str):
    """用于浏览网络进行搜索。"""
    search_tool = TavilySearchResults(max_results=1)
    # {'title': 'Hainan - Wikipedia', 'url': 'https://en.wikipedia.org/wiki/Hainan', 'content': 'Hainan is', 'score': 0.8437023}]
    return search_tool.invoke(query)
print(search_tool("海南"))