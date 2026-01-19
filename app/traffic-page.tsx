"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { IconButton } from "./components/button";
import { Select } from "./components/ui-lib";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

// 生成模拟流量数据
const generateTrafficData = (month: number, year: number) => {
  // 获取当月天数
  const daysInMonth = new Date(year, month, 0).getDate();

  // 生成随机数据点
  const data = [];
  let currentValue = Math.random() * 100 + 50; // 初始值在50-150之间

  for (let day = 1; day <= daysInMonth; day++) {
    // 添加一些随机波动
    const change = (Math.random() - 0.5) * 20;
    currentValue = Math.max(0, currentValue + change);
    data.push(currentValue);
  }

  return data;
};

const TrafficPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  ); // 当前月份
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  ); // 当前年份
  const [trafficData, setTrafficData] = useState<number[]>([]);

  // 月份名称映射
  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];

  // 年份范围（过去5年）
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 4 + i,
  );

  useEffect(() => {
    // 每次月份或年份变化时重新生成数据
    const data = generateTrafficData(selectedMonth, selectedYear);
    setTrafficData(data);
  }, [selectedMonth, selectedYear]);

  // 准备图表数据
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`);

  const chartData = {
    labels,
    datasets: [
      {
        label: "流量使用量",
        data: trafficData,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${selectedYear}年${selectedMonth}月流量使用情况`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex flex-col h-full w-full max-w-screen-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">流量统计</h1>
        <IconButton
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          }
          text="返回首页"
          onClick={() => (window.location.hash = "#/")}
          bordered
        />
      </div>

      <div className="flex space-x-4 mb-6">
        <Select
          value={String(selectedYear)}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}年
            </option>
          ))}
        </Select>

        <Select
          value={String(selectedMonth)}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {monthNames.map((name, index) => (
            <option key={index + 1} value={index + 1}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex-grow">
        {trafficData.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p>正在加载数据...</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">月度总计</h3>
          <p className="text-2xl">
            {trafficData.reduce((sum, val) => sum + val, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">日均流量</h3>
          <p className="text-2xl">
            {trafficData.length > 0
              ? (
                  trafficData.reduce((sum, val) => sum + val, 0) /
                  trafficData.length
                ).toFixed(2)
              : "0.00"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">峰值流量</h3>
          <p className="text-2xl">
            {trafficData.length > 0
              ? Math.max(...trafficData).toFixed(2)
              : "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafficPage;
