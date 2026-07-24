#!/usr/bin/env python3
"""Agent Interviewer - 一键启动脚本"""
import os
import sys
import subprocess
import time
import webbrowser

def main():
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(script_dir, 'backend')
    dist_dir = os.path.join(script_dir, 'dist')
    
    print("=" * 40)
    print("    Agent Interviewer")
    print("=" * 40)
    print()
    
    # 检查 Python
    try:
        subprocess.run(['python', '--version'], check=True, capture_output=True)
        python_cmd = 'python'
    except:
        try:
            subprocess.run(['python3', '--version'], check=True, capture_output=True)
            python_cmd = 'python3'
        except:
            print("ERROR: Python not found. Please install Python 3.8+")
            print("Download: https://www.python.org/downloads/")
            input("\nPress Enter to exit...")
            return
    
    # 检查前端构建
    if not os.path.exists(dist_dir):
        print("WARNING: Frontend not built, building...")
        try:
            subprocess.run(['npm', 'run', 'build'], cwd=script_dir, check=True, capture_output=True)
            print("OK: Frontend built")
        except:
            print("ERROR: Frontend build failed. Install Node.js first.")
            input("\nPress Enter to exit...")
            return
    
    # 检查后端依赖
    print("Checking dependencies...")
    try:
        subprocess.run([python_cmd, '-c', 'import fastapi'], check=True, capture_output=True)
    except:
        print("Installing dependencies...")
        subprocess.run([python_cmd, '-m', 'pip', 'install', 'fastapi', 'uvicorn', 'openai', 'python-dotenv', 'python-multipart', '-q'], check=True)
    print("OK: Dependencies ready")
    print()
    
    # 启动后端服务
    print("Starting service...")
    subprocess.Popen([python_cmd, 'run.py'], cwd=backend_dir)
    
    # 等待启动
    print("Waiting for service...")
    time.sleep(3)
    
    # 打开浏览器
    print("Opening browser...")
    webbrowser.open('http://localhost:8000')
    
    print()
    print("=" * 40)
    print("    Started successfully!")
    print("    http://localhost:8000")
    print("    Close this window to stop.")
    print("=" * 40)
    print()
    input("Press Enter to exit...")

if __name__ == '__main__':
    main()
