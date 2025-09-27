import { FileTextIcon, SearchIcon, BarChart3Icon } from "lucide-react";

export const agents = [
  {
    id: "writer",
    name: "文章撰写",
    desc: "根据您提供的主题，快速生成结构完整、内容丰富的专业文章。",
    icon: <FileTextIcon className="w-10 h-10 text-blue-600" />,
  },
  {
    id: "research",
    name: "深度研究",
    desc: "对特定领域或问题进行深入的文献回顾、数据搜集和综合分析。",
    icon: <SearchIcon className="w-10 h-10 text-blue-600" />,
  },
  {
    id: "data",
    name: "数据分析",
    desc: "上传您的数据文件（如CSV），自动进行数据清洗、分析和可视化。",
    icon: <BarChart3Icon className="w-10 h-10 text-blue-600" />,
  },
  {
    id: "report",
    name: "报告生产",
    desc: "生成专业可视化报告。",
    icon: <BarChart3Icon className="w-10 h-10 text-blue-600" />,
  },
  {
    id: "courses",
    name: "课程中心",
    desc: "网课学习。",
    icon: <BarChart3Icon className="w-10 h-10 text-blue-600" />,
  },
];