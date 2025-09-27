"use client"
import { useState, useEffect, useRef } from "react"; // Added useRef
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Search, FileText, Copy } from "lucide-react"; // Import icons
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { H2, H3 } from "@/components/ui/typography"; // 导入自定义的 H2 和 H3 组件
import { useToast } from "@/components/ui/use-toast"; // 导入 useToast

export default function NewTaskPage() {
  const [isResearching, setIsResearching] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0); // New state for animated progress
  const [status, setStatus] = useState("等待开始...");
  const [currentTaskDetails, setCurrentTaskDetails] = useState("暂无任务进行中。");
  const [researchResult, setResearchResult] = useState("");
  const [cardTitleContent, setCardTitleContent] = useState("开始新任务");
  const [copied, setCopied] = useState(false); // Added for copy functionality
  const [stages, setStages] = useState([
    { name: "数据收集", status: "pending", success: false, description: "正在从互联网、数据库和现有文档中收集相关数据和信息。", icon: Search },
    { name: "信息分析", status: "pending", success: false, description: "对收集到的数据进行清洗、整理和深入分析，提取关键洞察。", icon: Brain },
    { name: "报告生成", status: "pending", success: false, description: "根据分析结果撰写研究报告，包括结论、建议和可视化内容。", icon: FileText },
  ]);

  const { toast } = useToast(); // Initialize toast

  // Use useRef to hold the reader, as it doesn't trigger re-renders and can be managed in useEffect
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // Cleanup effect for the stream reader
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        console.log("Closing stream reader on unmount.");
        readerRef.current.cancel(); // Cancel the stream if component unmounts
        readerRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount and once on unmount

  // Effect to animate the progress bar
  useEffect(() => {
    if (progress > displayedProgress) {
      const timer = setInterval(() => {
        setDisplayedProgress((prev) => {
          const newProgress = prev + 1;
          if (newProgress >= progress) {
            clearInterval(timer);
            return progress;
          }
          return newProgress;
        });
      }, 20); // Adjust animation speed here
      return () => clearInterval(timer);
    } else if (progress < displayedProgress) {
      setDisplayedProgress(progress); // Instantly set if progress decreases (e.g., reset)
    }
  }, [progress, displayedProgress]);

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      // Reset states for a new research
      setIsResearching(true);
      setProgress(0);
      setDisplayedProgress(0); // Reset displayed progress as well
      setStatus("数据收集进行中...");
      setCurrentTaskDetails("正在从互联网、数据库和现有文档中收集相关数据和信息。");
      setResearchResult("");
      const truncatedTitle = taskInput.length > 30 ? taskInput.substring(0, 30) + "..." : taskInput;
      setCardTitleContent(truncatedTitle);
      setStages([
        { name: "数据收集", status: "in-progress", success: false, description: "正在从互联网、数据库和现有文档中收集相关数据和信息。", icon: Search },
        { name: "信息分析", status: "pending", success: false, description: "对收集到的数据进行清洗、整理和深入分析，提取关键洞察。", icon: Brain },
        { name: "报告生成", status: "pending", success: false, description: "根据分析结果撰写研究报告，包括结论、建议和可视化内容。", icon: FileText },
      ]);
      console.log("开始研究任务:", taskInput);

      // Cancel any existing stream before starting a new one
      if (readerRef.current) {
        readerRef.current.cancel();
        readerRef.current = null;
      }

      try {
        // const createThreadResponse = await fetch('/api/research/threads', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({}),
        // });
        // if (!createThreadResponse.ok) {
        //   throw new Error('创建线程失败');
        // }
        // const threadData = await createThreadResponse.json();
        // const threadId = threadData.thread_id;

        const data = {
          "name":  taskInput.trim()
        }
        setProgress(2);
        const runStreamResponse = await fetch('/api/research/streams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream' // This header might be useful for the backend
          },
          body: JSON.stringify(data),
        });

        if (!runStreamResponse.ok || !runStreamResponse.body) {
          throw new Error('启动研究失败或响应体不可读');
        }
        setProgress(5);
        const reader = runStreamResponse.body.getReader();
        readerRef.current = reader; // Store the reader in ref
        const decoder = new TextDecoder();
        let buffer = ''; // Buffer to accumulate partial SSE messages

        // Function to process each chunk
        const processStream = async () => {
          try {
            console.log("processStream");
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log("Stream finished.");
                setStages(prevStages => prevStages.map(stage => ({ ...stage, status: "completed", success: true })));
                setProgress(100); // Set progress to 100%
                setStatus("研究完成！");
                setCurrentTaskDetails("研究已完成，请查看下方成果。");
                setIsResearching(false);
                break;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep the last (potentially incomplete) message
              
               let event = null;
               let data = "";
               for (const line of lines) {
                  if (line.startsWith("event:")) {
                    event = line.slice(6).trim();
                  } else if (line.startsWith("data:")) {
                    data += line.slice(5).trim();
                  } else if (line.trim() === "") {
                    // 空行表示消息结束
                    if (event && data) {
                      try {
                        const parsed = JSON.parse(data);
                        if(event==="updates"){
                          console.log(`Received SSE event [${event}]:`, parsed);
                          
                          const hasWebResearch = !!parsed?.web_research;
                          const hasReflection = !!parsed?.reflection;
                          const hasFinalize_answer = !!parsed?.finalize_answer;
                          if(hasWebResearch){
                              console.log("数据收集中")
                              setStatus("数据收集进行中...");
                              setProgress(10);
                              setCurrentTaskDetails(parsed.web_research.web_research_result);
                              setStages(prevStages => {
                              const newStages = [...prevStages];
                              const stageIndex = newStages.findIndex(s => s.name === '数据收集');
                              if (stageIndex !== -1) {
                                // Update status and currentTaskDetails if this stage is now in-progress
                              }
                              return newStages;
                            });
                          }else if(hasReflection){
                              setStatus("信息分析进行中...");
                              setProgress(50);
                              setCurrentTaskDetails(JSON.stringify(parsed.reflection));
                              setStages(prevStages => {
                                const newStages = [...prevStages];
                                const stageIndex = newStages.findIndex(s => s.name === '数据收集');
                                newStages[stageIndex].status = "completed";
                                newStages[stageIndex].success = true;
                                return newStages;
                              });
                              setStages(prevStages => {
                                const newStages = [...prevStages];
                                const stageIndex = newStages.findIndex(s => s.name === '信息分析');
                                newStages[stageIndex].status = "in-progress";
                                return newStages;
                              });
                          }else if(hasFinalize_answer){
                              setStatus("报告生成");
                              setProgress(90);
                              // setCurrentTaskDetails(JSON.stringify(parsed.finalize_answer));
                              setStages(prevStages => {
                                const newStages = [...prevStages];
                                const stageIndex = newStages.findIndex(s => s.name === '报告生成');
                                newStages[stageIndex].status = "in-progress";
                                return newStages;
                              });
                              setStages(prevStages => {
                                const newStages = [...prevStages];
                                const stageIndex = newStages.findIndex(s => s.name === '信息分析');
                                newStages[stageIndex].status = "completed";
                                newStages[stageIndex].success = true;
                                return newStages;
                              });
                              setResearchResult(parsed.finalize_answer.messages[0].content);
                          }
                        }
                      } catch (e) {
                        console.warn("Failed to parse JSON:", data,e);
                      }
                    }
                    // 重置
                    event = null;
                    data = "";
                  }
                }
            }
            // After stream finishes naturally
            // setStatus("研究完成！");
            // setCurrentTaskDetails("研究已完成，请查看下方成果。");
            // setIsResearching(false);
            readerRef.current = null; // Clear ref
          } catch (streamError) {
            console.error("Stream processing error:", streamError);
            setStatus("研究失败！");
            setCurrentTaskDetails(`研究过程中发生错误: ${(streamError as Error).message}`);
            setIsResearching(false);
            if (readerRef.current) readerRef.current.cancel();
            readerRef.current = null;
          }
        };

        processStream();

      } catch (error: unknown) { // Changed to 'unknown' for stricter type checking
        console.error("启动研究失败:", error);
        setStatus("启动研究失败！");
        // Safely access error message by checking if it's an Error instance
        setCurrentTaskDetails(`启动研究失败: ${error instanceof Error ? error.message : String(error)}`);
        setIsResearching(false);
        if (readerRef.current) readerRef.current.cancel();
        readerRef.current = null;
      }
    }
    
  };

  const handleCopyResult = async () => {
    if (researchResult) {
      try {
        await navigator.clipboard.writeText(researchResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
        toast({
          title: "复制成功",
          description: "研究成果已复制到剪贴板。",
        });
      } catch (err) {
        console.error("Failed to copy research result: ", err);
        toast({
          title: "复制失败",
          description: "无法复制研究成果到剪贴板，请检查浏览器权限或手动复制。",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "复制失败",
        description: "没有内容可以复制。",
        variant: "destructive",
      });
    }
  };

  return (
        <div className="flex-1 flex flex-col p-1 md:p-2 overflow-hidden bg-slate-50">

            <Card className="flex-1 flex flex-col min-h-0 shadow-xl border border-slate-200 bg-white">

        <CardHeader className="pb-4 text-slate-800 border-b border-slate-200">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            {cardTitleContent}
          </CardTitle>
          <div className="mt-4 w-full h-4 flex items-center justify-center">
            {isResearching && (
              <div className="w-full flex items-center">
                <p className="text-sm text-slate-600 font-medium w-46">当前状态: <span className="text-blue-600 font-semibold">{status}</span></p>
                <div className="flex items-center space-x-3 flex-1 ml-4">
                  <Progress value={displayedProgress} className="flex-1 h-2 bg-slate-100" />
                  <span className="font-bold text-slate-600 text-lg">{displayedProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col md:flex-row gap-6 p-2 pt-0 min-h-0">
        
          <div className="flex-1 flex flex-col space-y-4 min-h-0 min-w-0">
            {isResearching && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  当前正在执行:
                </h3>
                <p className="text-sm leading-relaxed">{currentTaskDetails}</p>
              </div>
            )}

            {!isResearching && (
              <ScrollArea
               className="w-full rounded-xl border border-slate-200 bg-white shadow-inner" style={{ height: '55vh', maxWidth: '100%' }}
  >
                <div className="p-4">
                  <h3 className="font-semibold text-xl mb-4 flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      研究成果
                    </div>
                    {researchResult && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyResult}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? "已复制!" : "复制原文"}
                      </Button>
                    )}
                  </h3>
                  {researchResult ? (
                    <div className="prose max-w-none prose-slate">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                      >
                        {researchResult}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                      <FileText className="w-16 h-16 mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">暂无研究成果</p>
                      <p className="text-sm text-center max-w-md">
                        请在下方输入任务描述，然后点击“开始研究”按钮。
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            <footer className="mt-auto">
              <form onSubmit={handleStartResearch} className="sticky bottom-2.5 z-10 bg-white rounded-2xl shadow-xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-slate-300/50">
                <div className="flex items-center gap-4">
                  {/* 输入框占满剩余宽度 */}
                  <div className="flex-1 relative">
                    <Textarea
                      rows={4}
                      placeholder="在此输入新任务..."
                      className="w-full resize-none border border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl p-4 text-base transition-all duration-300 bg-slate-50 shadow-sm hover:shadow-md"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleStartResearch(e);
                        }
                      }}
                      disabled={isResearching}
                    />
                    {taskInput && (
                      <div className="absolute -top-2 -right-2 bg-slate-600 text-white text-xs px-2 py-1 rounded-full">
                        {taskInput.length}
                      </div>
                    )}
                  </div>

                  {/* 按钮靠在右侧 */}
                  <Button
                    type="submit"
                    disabled={isResearching}
                    className="shrink-0 px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center gap-2">
                      {isResearching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          研究进行中...
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          开始研究
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </form>
            </footer>
          </div>

          <div className="w-full md:w-1/4 flex flex-col space-y-2 border-t md:border-t-0 border-slate-200 pt-6 md:pl-0 md:pt-0">
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              研究进度概览
            </h2>
            <ScrollArea className="flex-1 w-full p-0">
              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const Icon = stage.icon;
                  const isInProgress = stage.status === "in-progress";
                  const isCompleted = stage.status === "completed";
                  const statusClass = isCompleted
                    ? "bg-green-100 text-green-800 border-green-300"
                    : isInProgress
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-slate-100 text-slate-600 border-slate-300";

                  return (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300 ease-in-out hover:shadow-md ${
                        isInProgress ? "bg-blue-50 border-blue-300 shadow-sm" : isCompleted ? "bg-green-50 border-green-300" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {Icon && (
                        <div className={`flex-shrink-0 p-2 rounded-full ${isInProgress ? "bg-blue-200 text-blue-700" : isCompleted ? "bg-green-200 text-green-700" : "bg-slate-200 text-slate-500"} transition-colors duration-300`}>
                          <Icon size={24} />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-slate-800">{stage.name}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClass} transition-all duration-300`}>
                            {isCompleted && stage.success ? "成功" : isCompleted && !stage.success ? "失败" : isInProgress ? "进行中" : "等待"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
