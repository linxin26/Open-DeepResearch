import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'; // 确保端口与 FastAPI 匹配

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/research', '');
  const destinationUrl = `${BACKEND_URL}${path}${request.nextUrl.search}`;
  console.log("Proxying GET request to:", destinationUrl);

  try {
    const backendResponse = await fetch(destinationUrl, {
      method: 'GET',
      headers: request.headers,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch from backend: ${backendResponse.statusText}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error(`[API/research Proxy Error]`, error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/research', '');
  const destinationUrl = `${BACKEND_URL}${path}${request.nextUrl.search}`;
  const requestBody = await request.text(); // 只读取一次请求体
  const contentType = request.headers.get('content-type'); // 获取 Content-Type 头
  const acceptHeader = request.headers.get('accept'); // 获取 Accept 头

  console.log(`[Proxy] Path: ${path}, Destination: ${destinationUrl}, Content-Type: ${contentType}, Accept: ${acceptHeader}, Body: "${requestBody.substring(0, 100)}..."`); // 限制日志长度

  const isSSE = acceptHeader?.includes('text/event-stream');

  try {
    const backendResponse = await fetch(destinationUrl, {
      method: 'POST',
      headers: request.headers,
      body: requestBody, // 使用已读取的请求体
      // 对于 SSE 请求，我们不希望 Next.js 尝试解析 JSON，而是直接获取流
      // @ts-expect-error Next.js fetch type does not include 'duplex'
      duplex: 'half', // 允许在请求体发送后立即读取响应
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to post to backend: ${backendResponse.statusText}` },
        { status: backendResponse.status }
      );
    }

    if (isSSE) {
      // 如果是 SSE 请求，直接返回后端响应的 ReadableStream
      return new NextResponse(backendResponse.body, {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          ...backendResponse.headers, // 转发后端的所有头信息
        },
      });
    } else {
      // 普通 POST 请求，解析 JSON 并返回
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    }

  } catch (error) {
    console.error(`[API/research Proxy Error]`, error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service.' },
      { status: 500 }
    );
  }
}
