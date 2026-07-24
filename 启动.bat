@echo off
chcp 65001 >nul
title Agent Interviewer

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "DIST_DIR=%SCRIPT_DIR%dist"

echo.
echo ╔═══════════════════════════════════════════════╗
echo ║          Agent Interviewer - AI面试助手       ║
echo ╚═══════════════════════════════════════════════╝
echo.

rem 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Python，请先安装 Python 3.8+
    echo.
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

rem 检查前端构建产物
if not exist "%DIST_DIR%" (
    echo ⚠️  检测到前端未构建，正在自动构建...
    cd /d "%SCRIPT_DIR%"
    npm run build >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ 前端构建失败，请确保已安装 Node.js 和 npm
        pause
        exit /b 1
    )
    echo ✅ 前端构建完成
)

rem 检查后端依赖
echo 正在检查后端依赖...
cd /d "%BACKEND_DIR%"
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  正在安装后端依赖，请稍候...
    pip install fastapi uvicorn openai python-dotenv python-multipart -q
)
echo ✅ 依赖检查完成
echo.

rem 启动后端服务（后台运行）
echo 🚀 正在启动服务...
cd /d "%BACKEND_DIR%"
start /b python run.py

rem 等待后端启动
echo ⏳ 等待服务启动...
timeout /t 3 /nobreak >nul

rem 尝试检查服务是否启动
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ 服务启动中，请稍候...
    timeout /t 2 /nobreak >nul
)

rem 打开浏览器
echo 🖥️  正在打开浏览器...
start http://localhost:8000

echo.
echo ╔═══════════════════════════════════════════════╗
echo ║              🎉 启动成功！                    ║
echo ║                                              ║
echo ║  浏览器已打开 http://localhost:8000          ║
echo ║                                              ║
echo ║  关闭此窗口将停止服务。                       ║
echo ║  如需停止服务，也可按 Ctrl+C                  ║
echo ╚═══════════════════════════════════════════════╝
echo.
pause >nul
