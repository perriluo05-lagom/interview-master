@echo off
chcp 65001 >nul
title Agent Interviewer

set "SCRIPT_DIR=%~dp0"
set "PYTHON_SCRIPT=%SCRIPT_DIR%start.py"

python "%PYTHON_SCRIPT%"
