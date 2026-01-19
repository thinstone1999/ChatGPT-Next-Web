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
    date: new Date().toISOString().split("T")[0], // 默认今天日期
  });

  // 新类别输入状态
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

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
    if (!formData.category || !formData.amount || !formData.date) {
      showToast("请填写完整信息");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast("请输入有效的数量");
      return;
    }

    const newTraffic: TrafficData = {
      id: Date.now().toString(), // 使用时间戳作为唯一ID
      category: formData.category,
      amount: amount,
      date: formData.date,
    };

    setTrafficData((prev) => [...prev, newTraffic]);

    // 重置表单
    setFormData({
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
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
    setFormData({
      category: record.category,
      amount: String(record.amount),
      date: record.date,
    });
  };

  const handleUpdateTraffic = () => {
    if (!formData.category || !formData.amount || !formData.date) {
      showToast("请填写完整信息");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast("请输入有效的数量");
      return;
    }

    setTrafficData((prev) =>
      prev.map((item) =>
        item.id === editingRecord?.id
          ? {
              ...item,
              category: formData.category,
              amount,
              date: formData.date,
            }
          : item,
      ),
    );

    setEditingRecord(null);
    setFormData({
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    showToast("流量数据已更新");
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setFormData({
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
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
        <h1 className="text-2xl font-bold">流量管理</h1>
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

      {/* 添加流量数据表单 */}
      <div className="bg-white dark:bg-[var(--white)] rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">添加流量数据</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">流量类别</label>
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
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="px-3 py-2 bg-gray-200 dark:bg-[var(--gray)] rounded hover:bg-gray-300 dark:hover:bg-[var(--gray-light)] text-sm"
              >
                +
              </button>
            </div>

            {showAddCategory && (
              <div className="mt-2 flex gap-2">
                <Input
                  type="text"
                  placeholder="输入新类别"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-grow"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  添加
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-3 py-2 bg-gray-200 dark:bg-[var(--gray)] rounded hover:bg-gray-300 dark:hover:bg-[var(--gray-light)] text-sm"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">数量</label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="请输入数量"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">时间</label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-end space-x-2">
            {editingRecord ? (
              <>
                <button
                  onClick={handleUpdateTraffic}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  更新数据
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={handleAddTraffic}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                添加数据
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 流量数据列表 */}
      <div className="bg-white dark:bg-[var(--white)] rounded-lg shadow p-4 flex-grow">
        <h2 className="text-lg font-semibold mb-4">流量数据列表</h2>

        {trafficData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p>暂无流量数据，请添加数据</p>
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
                  return <span>{category}</span>;
                },
              },
              {
                key: "amount",
                title: "数量",
                dataIndex: "amount",
                render: (value: number) => <span>{value.toFixed(2)}</span>,
              },
              {
                key: "date",
                title: "时间",
                dataIndex: "date",
              },
            ]}
            dataSource={trafficData}
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
      </div>
    </div>
  );
};

export default TrafficManagementPage;
