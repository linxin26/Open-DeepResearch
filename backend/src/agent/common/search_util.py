from typing import Tuple
from urllib.parse import urlparse

import markdownify
import readabilipy.simple_json
from bs4 import ResultSet
from tavily import TavilyClient
import asyncio
from dotenv import load_dotenv
import logging

logger = logging.getLogger("search")

load_dotenv()

DEFAULT_USER_AGENT_AUTONOMOUS = "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11"


def extract_content_from_html(html: str) -> str:
    """Extract and convert HTML content to Markdown format.

    Args:
        html: Raw HTML content to process

    Returns:
        Simplified markdown version of the content
    """
    ret = readabilipy.simple_json.simple_json_from_html_string(
        html, use_readability=True
    )
    if not ret["content"]:
        return "<error>Page failed to be simplified from HTML</error>"
    content = markdownify.markdownify(
        ret["content"],
        heading_style=markdownify.ATX,
    )
    return content


async def fetch_url(
    url: str, user_agent: str, force_raw: bool = False, proxy_url: str | None = None
) -> Tuple[str, str]:
    """
    获取URL并返回适合LLM使用的内容形式，以及一个包含状态信息的字符串。
    """
    from httpx import AsyncClient, HTTPError

    async with AsyncClient() as client:
        try:
            BASE_HEADERS = {
                # 必需 - 增强头部以避免403错误
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/115.0.0.0 Safari/537.36"
                ),
                "Accept": (
                    "text/html,application/xhtml+xml,application/xml;q=0.9,"
                    "image/avif,image/webp,image/apng,*/*;q=0.8,"
                    "application/signed-exchange;v=b3;q=0.7"
                ),
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "DNT": "1",
                "Upgrade-Insecure-Requests": "1",
                # 添加现代浏览器安全头部
                "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": '"Windows"',
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
            }

            # 设置动态Referer
            parsed_url = urlparse(url)
            referer = f"https://{parsed_url.netloc}/"
            BASE_HEADERS["Referer"] = referer

            response = await client.get(
                url,
                follow_redirects=True,
                headers=BASE_HEADERS,
                timeout=20,
            )
        except HTTPError as e:
            raise Exception(f"Failed to fetch {url}: {e!r}")
        if response.status_code >= 400:
            raise Exception(
                f"Failed to fetch {url} - status code {response.status_code}"
            )

        page_raw = response.text

    content_type = response.headers.get("content-type", "")
    is_page_html = (
        "<html" in page_raw[:100] or "text/html" in content_type or not content_type
    )

    if is_page_html and not force_raw:
        return extract_content_from_html(page_raw), ""

    return (
        page_raw,
        f"Content type {content_type} cannot be simplified to markdown, but here is the raw content:\n",
    )


async def load_pages(
    url_list: list, start_index=0, max_length=300
) -> list[dict[str, str]]:
    results = await asyncio.gather(
        *(load_page(url, start_index, max_length) for url in url_list),
        return_exceptions=True,
    )
    data_list = []
    for d in results:
        if not isinstance(d, Exception):
            data_list.append(d)
        else:
            logger.error(d)

    return data_list


async def load_page(url, start_index=0, max_length=300) -> dict[str, str]:
    logger.info("url: %s,start_index: %s",url, start_index)
    url = str(url)
    if not url:
        raise Exception("URL is required")
    content, prefix = await fetch_url(url, DEFAULT_USER_AGENT_AUTONOMOUS)
    original_length = len(content)
    if start_index >= original_length:
        content = "<error>No more content available.</error>"
    else:
        truncated_content = content[start_index : start_index + max_length]
        if not truncated_content:
            content = "<error>No more content available.</error>"
        else:
            content = truncated_content
    result = {"url": url, "content": content}
    return result

def search_web(query: str,api_key:str,result_max:int):
    """用于浏览网络进行搜索。"""
    
    tavily_client = TavilyClient(api_key=api_key)
    response = tavily_client.search(query, max_results=result_max)
    # {'title': 'Hainan - Wikipedia', 'url': 'https://en.wikipedia.org/wiki/Hainan', 'content': 'Hainan is', 'score': 0.8437023}]
    return response["results"]


async def search_data(query: str,api_key:str,result_max:int):
    pages=[]
    try:
        # 搜索数据
        pages = search_web(query,api_key,result_max)
        logger.info(f"search_data:{len(pages)}")
        urls = [page["url"] for page in pages]
        # 访问网页
        loaded_contents = await load_pages(urls)
        # 将加载的内容映射回pages
        url_to_content = {item["url"]: item["content"] for item in loaded_contents}
        for page in pages:
            page["full_content"] = url_to_content.get(
                page["url"], "<error>Failed to load full content</error>"
            )
        return pages
    except Exception as e:
        logger.error(e,stack_info=True)
        return pages


async def run():
    # 测试数据
    pages = [
        {
            "title": "Hainan - Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Hainan",
            "content": "Hainan is",
            "score": 0.8437023,
        },
        {
            "title": "title",
            "url": "https://baike.baidu.com/item/%E6%B5%B7%E5%8D%97%E7%9C%81/533000",
            "score": "0",
            "content": "content",
        },
    ]
    # 并发加载所有页面内容，提高性能
    urls = [page["url"] for page in pages]
    loaded_contents = await load_pages(urls)
    # 将加载的内容映射回pages
    url_to_content = {item["url"]: item["content"] for item in loaded_contents}
    for page in pages:
        page["full_content"] = url_to_content.get(
            page["url"], "<error>Failed to load content</error>"
        )
    # 格式化输出结果
    for page in pages:
        print(f"Title: {page['title']}")
        print(f"URL: {page['url']}")
        print(f"Score: {page['score']}")
        print(f"Content Preview: {page['content'][:100]}...")
        print(f"Full Content: {page['full_content']}")
        print("-" * 50)

# if __name__ == "__main__":
#     import asyncio

#     asyncio.run(run())
#     # asyncio.run(search_data("海南"))
