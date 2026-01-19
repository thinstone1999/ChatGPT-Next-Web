"use client";

import React, { useState, useEffect } from "react";
import { IconButton } from "./components/button";
import { Input, Select, showModal } from "./components/ui-lib";
import Locale from "./locales";
import { showToast } from "./components/ui-lib";
import styles from "./components/home.module.scss";
import { Table } from "./components/table";

// 定义流量数据类型
interface TrafficData {
  id: string;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD format
}

// 定义流量类别类型
interface TrafficCategory {
  id: string;
  name: string;
}

const TrafficManagementPage: React.FC = () => {
  // 流量数据状态
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);

  // 流量类别状态
  const [categories, setCategories] = useState<TrafficCategory[]>([
    { id: "1", name: "工作" },
    { id: "2", name: "生活" },
    { id: "3", name: "娱乐" },
    { id: "4", name: "学习" },
  ]);

  // 表单状态
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    year: String(new Date().getFullYear()), // 年份
    month: String(new Date().getMonth() + 1), // 月份
  });

  // 新类别输入状态
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // 分页和筛选状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 每页显示10条
  const [filterMonth, setFilterMonth] = useState(""); // 按月份筛选

  // 筛选和排序数据
  const filteredAndSortedData = trafficData
    .filter((item) => {
      if (filterMonth) {
        const [, month] = item.date.split("-");
        return month === filterMonth;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // 按日期降序排列

  // 计算分页数据
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  // 导入导出功能
  const exportData = () => {
    const dataToExport = {
      trafficData,
      categories,
      timestamp: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traffic-data-backup-${new Date()
      .toISOString()
      .slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("数据导出成功");
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (
          importedData.trafficData &&
          Array.isArray(importedData.trafficData)
        ) {
          setTrafficData(importedData.trafficData);
          if (
            importedData.categories &&
            Array.isArray(importedData.categories)
          ) {
            setCategories(importedData.categories);
          }
          showToast("数据导入成功");
        } else {
          showToast("无效的数据格式");
        }
      } catch (error) {
        console.error("导入数据失败:", error);
        showToast("导入数据失败，请检查文件格式");
      }
    };
    reader.readAsText(file);
    // 重置input，允许重复导入同一文件
    event.target.value = "";
  };

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedData = localStorage.getItem("trafficData");
    const savedCategories = localStorage.getItem("trafficCategories");

    if (savedData) {
      try {
        setTrafficData(JSON.parse(savedData));
      } catch (e) {
        console.error("解析流量数据失败:", e);
      }
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error("解析流量类别失败:", e);
      }
    }
  }, []);

  // 保存数据到 localStorage
  useEffect(() => {
    localStorage.setItem("trafficData", JSON.stringify(trafficData));
  }, [trafficData]);

  useEffect(() => {
    localStorage.setItem("trafficCategories", JSON.stringify(categories));
  }, [categories]);

  // 处理表单输入变化
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 添加新流量数据
  const handleAddTraffic = () => {
    if (
      !formData.category ||
      !formData.amount ||
      !formData.year ||
      !formData.month
    ) {
      showToast("请填写完整信息");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast("请输入有效的数量");
      return;
    }

    // 创建月份标识符，格式为 YYYY-MM
    const monthIdentifier = `${formData.year}-${formData.month.padStart(
      2,
      "0",
    )}`;

    const newTraffic: TrafficData = {
      id: Date.now().toString(), // 使用时间戳作为唯一ID
      category: formData.category,
      amount: amount,
      date: monthIdentifier, // 使用月份标识符而不是具体日期
    };

    setTrafficData((prev) => [...prev, newTraffic]);

    // 重置表单
    setFormData({
      category: "",
      amount: "",
      year: String(new Date().getFullYear()),
      month: String(new Date().getMonth() + 1),
    });

    showToast("流量数据已添加");
  };

  // 删除流量数据
  const handleDeleteTraffic = (id: string) => {
    setTrafficData((prev) => prev.filter((item) => item.id !== id));
    showToast("流量数据已删除");
  };

  // 编辑流量数据
  const [editingRecord, setEditingRecord] = useState<TrafficData | null>(null);

  const handleEditTraffic = (record: TrafficData) => {
    setEditingRecord(record);
    // 解析月份标识符
    const [year, month] = record.date.split("-");
    setFormData({
      category: record.category,
      amount: String(record.amount),
      year,
      month,
    });
  };

  const handleUpdateTraffic = () => {
    if (
      !formData.category ||
      !formData.amount ||
      !formData.year ||
      !formData.month
    ) {
      showToast("请填写完整信息");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast("请输入有效的数量");
      return;
    }

    // 创建月份标识符，格式为 YYYY-MM
    const monthIdentifier = `${formData.year}-${formData.month.padStart(
      2,
      "0",
    )}`;

    setTrafficData((prev) =>
      prev.map((item) =>
        item.id === editingRecord?.id
          ? {
              ...item,
              category: formData.category,
              amount,
              date: monthIdentifier,
            }
          : item,
      ),
    );

    setEditingRecord(null);
    setFormData({
      category: "",
      amount: "",
      year: String(new Date().getFullYear()),
      month: String(new Date().getMonth() + 1),
    });
    showToast("流量数据已更新");
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setFormData({
      category: "",
      amount: "",
      year: String(new Date().getFullYear()),
      month: String(new Date().getMonth() + 1),
    });
  };

  // 删除类别
  const handleDeleteCategory = (categoryId: string) => {
    // 检查是否有流量数据正在使用该类别
    const hasData = trafficData.some((item) => item.category === categoryId);
    if (hasData) {
      showToast("该类别下有数据，无法删除");
      return;
    }

    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    // 如果删除的是当前选中的类别，则清空选择
    if (formData.category === categoryId) {
      setFormData((prev) => ({ ...prev, category: "" }));
    }
    showToast("类别已删除");
  };

  // 添加新类别
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      showToast("请输入类别名称");
      return;
    }

    // 检查是否已存在相同名称的类别
    const exists = categories.some((cat) => cat.name === newCategory.trim());
    if (exists) {
      showToast("该类别已存在");
      return;
    }

    const newCat: TrafficCategory = {
      id: Date.now().toString(),
      name: newCategory.trim(),
    };

    setCategories((prev) => [...prev, newCat]);
    setFormData((prev) => ({ ...prev, category: newCat.id }));
    setNewCategory("");
    setShowAddCategory(false);
    showToast("类别已添加");
  };

  return (
    <div
      className={
        styles["chat-body"] +
        " " +
        "flex flex-col h-full w-full max-w-screen-xl mx-auto p-4"
      }
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          流量管理
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
          >
            导出数据
          </button>
          <label className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm cursor-pointer">
            导入数据
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
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
      </div>

      {/* 添加流量数据表单 */}
      <div className="bg-white dark:bg-[var(--white)] rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          添加流量数据
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                流量类别
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                管理
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Select
                  value={formData.category}
                  onChange={handleInputChange}
                  name="category"
                  className="flex-grow"
                >
                  <option value="">请选择类别</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* 显示类别列表及删除按钮 */}
              {showCategoryManager && (
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
                    类别管理:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1 text-sm"
                      >
                        <span className="text-blue-700 dark:text-blue-300">
                          {category.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {showAddCategory ? (
                    <div className="mt-2 flex gap-2">
                      <Input
                        type="text"
                        placeholder="输入新类别"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors duration-200"
                      >
                        添加
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm transition-colors duration-200"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      + 添加新类别
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
              数量
            </label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="请输入数量"
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
                年份
              </label>
              <Select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  );
                })}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
                月份
              </label>
              <Select
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                className="w-full"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  return (
                    <option key={month} value={month}>
                      {month}月
                    </option>
                  );
                })}
              </Select>
            </div>
          </div>

          <div className="flex items-end space-x-2">
            {editingRecord ? (
              <>
                <button
                  onClick={handleUpdateTraffic}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  更新数据
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={handleAddTraffic}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                添加数据
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 流量数据列表 */}
      <div className="bg-white dark:bg-[var(--white)] rounded-xl shadow-lg p-6 flex-grow border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            流量数据列表
          </h2>
          <div className="flex space-x-2">
            <Select
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setCurrentPage(1); // 重置到第一页
              }}
              className="w-40"
            >
              <option value="">全部月份</option>
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString().padStart(2, "0");
                return (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                );
              })}
            </Select>
          </div>
        </div>

        {trafficData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              暂无流量数据，请添加数据
            </p>
          </div>
        ) : (
          <>
            {/* 筛选和排序后的数据 */}
            {filteredAndSortedData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">
                  没有符合条件的数据
                </p>
              </div>
            ) : (
              <Table
                columns={[
                  {
                    key: "category",
                    title: "类别",
                    dataIndex: "category",
                    render: (value: string) => {
                      const category =
                        categories.find((cat) => cat.id === value)?.name ||
                        "未知类别";
                      return <span className="font-medium">{category}</span>;
                    },
                  },
                  {
                    key: "amount",
                    title: "数量",
                    dataIndex: "amount",
                    render: (value: number) => (
                      <span className="font-mono">{value.toFixed(2)}</span>
                    ),
                  },
                  {
                    key: "date",
                    title: "时间",
                    dataIndex: "date",
                  },
                ]}
                dataSource={currentData}
                onDelete={(record) => {
                  setTrafficData((prev) =>
                    prev.filter((item) => item.id !== record.id),
                  );
                  showToast("流量数据已删除");
                }}
                onEdit={handleEditTraffic}
                className="mt-2"
              />
            )}

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  显示 {startIndex + 1}-
                  {Math.min(endIndex, filteredAndSortedData.length)} 条，共{" "}
                  {filteredAndSortedData.length} 条
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    上一页
                  </button>

                  <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrafficManagementPage;
