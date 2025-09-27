import { NextRequest, NextResponse } from 'next/server';

// 1. 从环境变量获取后端服务地址，提供默认值
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * 核心代理处理函数
 * @param request 原始的 NextRequest 对象
 */
async function handleProxyRequest(request: NextRequest) {
  // 2. 获取请求路径，并检查是否为特定的 SSE 流式请求
  const pathname = request.nextUrl.pathname;
  const isStreamingPost = 
    request.method === 'POST' && 
    (pathname.endsWith('/run_sse') || pathname.endsWith('/sse'));

  // 3. 构造将要请求的后端 URL
  //    移除路径中的 '/api/proxy' 前缀
  const destinationPath = pathname.replace('/api', '');
  const destinationUrl = `${BACKEND_URL}${destinationPath}${request.nextUrl.search}`;

  try {
    // 4. 使用 fetch API 将请求转发到后端服务
    //    这个配置会透传原始请求的几乎所有信息
    const backendResponse = await fetch(destinationUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual',
    });

    // 5. 根据条件决定如何返回响应
    if (isStreamingPost) {
      // --- 流式响应 (Streaming Response) ---
      // 直接返回后端的响应体流，并设置正确的 SSE 头部
      // 这可以确保连接保持打开，数据可以分块发送
      return new Response(backendResponse.body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            // 关键：强制禁用内容压缩，防止 Vercel 等平台破坏流
            'Content-Encoding': 'none',
        },
      });
    } else {
      // --- 常规缓冲响应 (Buffered Response) ---
      // 等待后端响应完全结束后，再将其作为 JSON 或文本返回
      // 这是最常见、最安全的常规代理方式
      const contentType = backendResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await backendResponse.json();
        return NextResponse.json(data, { status: backendResponse.status });
      } else {
        const text = await backendResponse.text();
        return new Response(text, { status: backendResponse.status, headers: backendResponse.headers });
      }
    }
  } catch (error) {
    console.error(`[API Proxy Error]`, error);
    return NextResponse.json(
      { error: 'Proxy request failed.' },
      { status: 500 }
    );
  }
}

// 6. 为所有需要代理的 HTTP 方法导出处理器
//    它们都调用同一个核心函数
export async function GET(request: NextRequest) {
  return handleProxyRequest(request);
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request);
}
