import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI工作台",
  description: "选择一个智能体开始您的任务",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}