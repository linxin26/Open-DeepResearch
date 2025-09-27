export default function HistoryPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">历史任务</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">任务ID</th>
              <th className="py-2 px-4 border-b text-left">任务内容</th>
              <th className="py-2 px-4 border-b text-left">状态</th>
              <th className="py-2 px-4 border-b text-left">创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b">1</td>
              <td className="py-2 px-4 border-b">研究报告草稿</td>
              <td className="py-2 px-4 border-b">完成</td>
              <td className="py-2 px-4 border-b">2025-09-19</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">2</td>
              <td className="py-2 px-4 border-b">数据分析</td>
              <td className="py-2 px-4 border-b">进行中</td>
              <td className="py-2 px-4 border-b">2025-09-18</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">3</td>
              <td className="py-2 px-4 border-b">市场调研</td>
              <td className="py-2 px-4 border-b">待开始</td>
              <td className="py-2 px-4 border-b">2025-09-17</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
