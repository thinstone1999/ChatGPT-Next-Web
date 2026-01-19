"use client";

import React, { useState, useEffect } from "react";
import { Home } from "./components/home";
import LoginPage from "./login-page";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null 表示正在检查

  // 检查认证状态的函数
  const checkAuthStatus = () => {
    const authStatus = sessionStorage.getItem("authenticated");
    return authStatus === "true";
  };

  useEffect(() => {
    // 初始化认证状态
    setIsAuthenticated(checkAuthStatus());

    // 监听 storage 事件，以便在其他标签页中登录时更新状态
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authenticated") {
        setIsAuthenticated(checkAuthStatus());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // 监听 hash 变化事件
    const handleHashChange = () => {
      if (window.location.hash === "#/login") {
        setIsAuthenticated(false);
      } else if (window.location.hash === "#/") {
        // 如果是首页，检查是否已认证
        const authStatus = checkAuthStatus();
        if (!authStatus) {
          setIsAuthenticated(false);
          window.location.hash = "#/login";
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // 每秒检查一次认证状态，以防其他地方修改了sessionStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const currentAuthStatus = checkAuthStatus();
      if (currentAuthStatus !== isAuthenticated) {
        setIsAuthenticated(currentAuthStatus);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    // 正在检查认证状态时显示加载指示器
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  // 如果未认证且不在登录页面，则显示登录页面
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 如果已认证，显示主应用
  return <Home />;
};

export default App;
