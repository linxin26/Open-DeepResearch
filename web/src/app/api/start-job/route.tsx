import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { topic } = await req.json();
  // 这里用随机 id 模拟任务，实际可换成真实队列
  const job_id = Math.random().toString(36).slice(2, 10);
  return NextResponse.json({ job_id, topic });
}