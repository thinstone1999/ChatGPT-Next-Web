"use client";

import React, { useState } from "react";
import { IconButton } from "./components/button";
import { PasswordInput } from "./components/ui-lib";
import styles from "./components/home.module.scss";

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 从环境变量获取密码，如果没有设置则默认为 "admin"
    const correctPassword = process.env.CODE || "since1999";

    if (password === correctPassword) {
      // 登录成功，设置认证状态并跳转到首页
      sessionStorage.setItem("authenticated", "true");
      window.location.hash = "#/";
      window.location.reload(); // 强制刷新页面以确保状态更新
    } else {
      // 登录失败，显示错误信息
      setError("密码错误，请重试");
      setPassword("");
    }
  };

  return (
    <div
      className={
        styles["login-body"] +
        " flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
      }
    >
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            流量管理系统
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            请输入访问密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <IconButton
              text="登录"
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            />
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          <p>请输入管理员密码以访问系统</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
