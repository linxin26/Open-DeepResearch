import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:2024'; // 确保端口与 FastAPI 匹配

export async function GET(request: NextRequest) {
  const destinationUrl = `${BACKEND_URL}/`; // Assuming backend has a /courses endpoint
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
        { error: `Failed to fetch courses from backend: ${backendResponse.statusText}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error(`[API/courses Proxy Error]`, error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const destinationUrl = `${BACKEND_URL}/`; // Assuming backend has a /course/ endpoint for POST
  console.log("Proxying POST request to:", destinationUrl);

  try {
    const backendResponse = await fetch(destinationUrl, {
      method: 'POST',
      headers: request.headers,
      body: await request.text(), // Forward the raw body
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to post to backend: ${backendResponse.statusText}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error(`[API/courses Proxy Error]`, error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service.' },
      { status: 500 }
    );
  }
}
