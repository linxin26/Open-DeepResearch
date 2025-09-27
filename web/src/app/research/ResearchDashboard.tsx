import React from 'react';

function ResearchDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">研究任务概览</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Task Card A */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">任务名称 A</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">阶段: 数据收集</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-md text-gray-500 dark:text-gray-400 mt-2 text-right">进度: 45%</p>
        </div>

        {/* Task Card B */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">任务名称 B</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">阶段: 分析中</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <p className="text-md text-gray-500 dark:text-gray-400 mt-2 text-right">进度: 70%</p>
        </div>

        {/* Task Card C */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">任务名称 C</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">阶段: 报告撰写</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '90%' }}></div>
          </div>
          <p className="text-md text-gray-500 dark:text-gray-400 mt-2 text-right">进度: 90%</p>
        </div>
      </div>
    </div>
  );
}

export default ResearchDashboard;
