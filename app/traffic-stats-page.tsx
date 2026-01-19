"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { IconButton } from "./components/button";
import { Select } from "./components/ui-lib";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement, // 用于饼图
  Title,
  Tooltip,
  Legend,
);

// 定义流量数据类型
interface TrafficData {
  id: string;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD format
}

const TrafficPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  ); // 当前月份
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  ); // 当前年份
  const [viewMode, setViewMode] = useState<"month" | "year">("month"); // 视图模式：月度或年度
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [dailyAmounts, setDailyAmounts] = useState<number[]>([]); // 每日汇总数据
  const [categoryTotals, setCategoryTotals] = useState<{
    [key: string]: number;
  }>({}); // 按类别汇总数据
  const [categoryDailyData, setCategoryDailyData] = useState<{
    [key: string]: number[];
  }>({}); // 每个类别每日的数据

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

  // 从 localStorage 加载流量数据
  useEffect(() => {
    const savedData = localStorage.getItem("trafficData");
    if (savedData) {
      try {
        const data: TrafficData[] = JSON.parse(savedData);
        setTrafficData(data);
      } catch (e) {
        console.error("解析流量数据失败:", e);
      }
    }
  }, []);

  // 根据选择的年月过滤和聚合数据
  useEffect(() => {
    if (viewMode === "month") {
      // 月度视图：过滤指定年月的数据
      const filteredData = trafficData.filter((item) => {
        const [year, month] = item.date.split("-").map(Number);
        return year === selectedYear && month === selectedMonth;
      });

      // 由于现在数据是按月存储的，我们只需要计算总量
      const monthlyTotal = filteredData.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      // 初始化月度数据数组（这里我们只有一个数据点，代表整个月的总量）
      const monthlyData = [monthlyTotal];

      // 按类别聚合数据
      const categoryData: { [key: string]: number } = {};

      // 初始化每个类别的月度数据数组
      const categoryMonthlyData: { [key: string]: number[] } = {};

      // 按类别聚合数据
      filteredData.forEach((item) => {
        // 累加对应类别的月度流量
        if (!categoryMonthlyData[item.category]) {
          categoryMonthlyData[item.category] = [0]; // 每个类别只包含一个月的数据
        }
        categoryMonthlyData[item.category][0] += item.amount;

        // 按类别累加
        if (categoryData[item.category]) {
          categoryData[item.category] += item.amount;
        } else {
          categoryData[item.category] = item.amount;
        }
      });

      setDailyAmounts(monthlyData); // 重用状态变量，但现在存储的是月度数据
      setCategoryTotals(categoryData);
      setCategoryDailyData(categoryMonthlyData); // 重用状态变量，但现在存储的是月度数据
    } else if (viewMode === "year") {
      // 年度视图：聚合整个年度的数据，按月显示
      const monthlyData: number[] = Array(12).fill(0); // 一年12个月
      const categoryMonthlyData: { [key: string]: number[] } = {}; // 每个类别按月的数据

      // 按类别聚合数据
      const categoryData: { [key: string]: number } = {};

      // 遍历当年的所有数据
      trafficData.forEach((item) => {
        const [year, monthStr] = item.date.split("-");
        const yearNum = Number(year);
        const monthNum = Number(monthStr);

        // 只处理选定年份的数据
        if (yearNum === selectedYear) {
          const monthIndex = monthNum - 1; // 月份索引从0开始

          // 累加到对应月份
          monthlyData[monthIndex] += item.amount;

          // 初始化类别月度数据数组
          if (!categoryMonthlyData[item.category]) {
            categoryMonthlyData[item.category] = Array(12).fill(0);
          }

          // 累加对应类别的月度流量
          categoryMonthlyData[item.category][monthIndex] += item.amount;

          // 按类别累加
          if (categoryData[item.category]) {
            categoryData[item.category] += item.amount;
          } else {
            categoryData[item.category] = item.amount;
          }
        }
      });

      setDailyAmounts(monthlyData); // 重用状态变量，存储年度各月数据
      setCategoryTotals(categoryData);
      setCategoryDailyData(categoryMonthlyData); // 存储年度各月数据
    }
  }, [trafficData, selectedMonth, selectedYear, viewMode]);

  // 从 localStorage 获取类别信息
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    const savedCategories = localStorage.getItem("trafficCategories");
    if (savedCategories) {
      try {
        const cats: { id: string; name: string }[] =
          JSON.parse(savedCategories);
        setCategories(cats);
      } catch (e) {
        console.error("解析流量类别失败:", e);
      }
    }
  }, []);

  // 辅助函数：为每条线分配不同颜色
  const getLineColor = (index: number) => {
    const colors = [
      "rgb(255, 99, 132)", // 红色
      "rgb(54, 162, 235)", // 蓝色
      "rgb(255, 205, 86)", // 黄色
      "rgb(75, 192, 192)", // 青色
      "rgb(153, 102, 255)", // 紫色
      "rgb(255, 159, 64)", // 橙色
      "rgb(199, 199, 199)", // 灰色
      "rgb(83, 102, 255)", // 深蓝色
    ];
    return colors[index % colors.length];
  };

  // 辅助函数：为每个区域分配背景色
  const getBackgroundColor = (index: number) => {
    const colors = [
      "rgba(255, 99, 132, 0.2)", // 红色
      "rgba(54, 162, 235, 0.2)", // 蓝色
      "rgba(255, 205, 86, 0.2)", // 黄色
      "rgba(75, 192, 192, 0.2)", // 青色
      "rgba(153, 102, 255, 0.2)", // 紫色
      "rgba(255, 159, 64, 0.2)", // 橙色
      "rgba(199, 199, 199, 0.2)", // 灰色
      "rgba(83, 102, 255, 0.2)", // 深蓝色
    ];
    return colors[index % colors.length];
  };

  // 准备图表数据
  let labels: string[];
  if (viewMode === "month") {
    labels = [`${selectedYear}年${selectedMonth}月`]; // 单个月份标签
  } else {
    // 年度视图：显示12个月的标签
    labels = [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ];
  }

  // 为每个类别和总量准备数据集
  const datasets = [];

  // 添加每个类别的折线
  Object.keys(categoryDailyData).forEach((categoryId, index) => {
    const category = categories.find((c) => c.id === categoryId);
    const categoryName = category ? category.name : "未知类别";

    datasets.push({
      label: categoryName,
      data: categoryDailyData[categoryId],
      borderColor: getLineColor(index), // 使用辅助函数获取不同颜色
      backgroundColor: getBackgroundColor(index),
      tension: 0.1,
    });
  });

  // 添加总量折线（如果有多于一个类别）
  if (Object.keys(categoryDailyData).length > 0) {
    datasets.push({
      label: "总量",
      data: dailyAmounts,
      borderColor: "rgb(54, 162, 235)", // 蓝色
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderDash: [5, 5], // 虚线表示总量
      tension: 0.1,
    });
  }

  const chartData = {
    labels,
    datasets,
  };

  // 准备按类别统计的饼图数据
  const categoryLabels = Object.keys(categoryTotals).map((catId) => {
    const category = categories.find((c) => c.id === catId);
    return category ? category.name : "未知类别";
  });

  const categoryData = Object.values(categoryTotals);

  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "各类别流量占比",
        data: categoryData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
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

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "各类别流量占比",
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

      <div className="flex flex-wrap gap-4 mb-6">
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

        {viewMode === "month" && (
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
        )}

        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              viewMode === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setViewMode("month")}
          >
            月度视图
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              viewMode === "year"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setViewMode("year")}
          >
            年度视图
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 按日期的折线图 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">
            {viewMode === "month"
              ? "各类别月度流量对比"
              : "各类别年度月度流量趋势"}
          </h2>
          {Object.keys(categoryDailyData).length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p>暂无数据，请在流量管理页面添加数据</p>
            </div>
          )}
        </div>

        {/* 按类别的饼图 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">各类别流量占比</h2>
          {Object.keys(categoryTotals).length > 0 ? (
            <Pie data={categoryChartData} options={pieOptions} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p>暂无分类数据，请在流量管理页面添加数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficPage;
