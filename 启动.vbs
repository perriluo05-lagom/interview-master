' Agent Interviewer - 静默启动脚本
' 双击此文件即可启动服务并打开浏览器，无需任何命令行操作

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录
strScriptPath = WScript.ScriptFullName
strScriptDir = objFSO.GetParentFolderName(strScriptPath)

' 路径配置
strBackendDir = strScriptDir & "\backend"
strDistDir = strScriptDir & "\dist"
strPython = "python"

' 检查 Python 是否安装
On Error Resume Next
objShell.Run strPython & " --version", 0, True
If Err.Number <> 0 Then
    MsgBox "❌ 未检测到 Python，请先安装 Python 3.8+" & vbCrLf & vbCrLf & "下载地址：https://www.python.org/downloads/", vbExclamation, "Agent Interviewer"
    WScript.Quit 1
End If
On Error GoTo 0

' 检查前端构建产物
If Not objFSO.FolderExists(strDistDir) Then
    ' 尝试构建前端
    objShell.Run "cmd /c cd """ & strScriptDir & """ && npm run build", 0, True
    If Not objFSO.FolderExists(strDistDir) Then
        MsgBox "❌ 前端构建失败，请确保已安装 Node.js 和 npm", vbExclamation, "Agent Interviewer"
        WScript.Quit 1
    End If
End If

' 检查后端依赖
objShell.Run strPython & " -c ""import fastapi""", 0, True
If Err.Number <> 0 Or objShell.Run(strPython & " -c ""import fastapi""", 0, True) <> 0 Then
    objShell.Run strPython & " -m pip install fastapi uvicorn openai python-dotenv python-multipart -q", 0, True
End If

' 启动后端服务（完全静默，无窗口）
objShell.Run strPython & " """ & strBackendDir & "\run.py""", 0, False

' 等待后端启动
WScript.Sleep 3000

' 打开浏览器
objShell.Run "http://localhost:8000", 1, False

' 提示启动成功（可选）
' MsgBox "🎉 Agent Interviewer 已启动！", vbInformation, "Agent Interviewer"
