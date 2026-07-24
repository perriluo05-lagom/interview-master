' Agent Interviewer - 静默启动脚本
' 双击此文件即可启动服务并打开浏览器

Dim objShell, objFSO
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

Dim strScriptPath, strScriptDir, strPythonPath
strScriptPath = WScript.ScriptFullName
strScriptDir = objFSO.GetParentFolderName(strScriptPath)
strPythonPath = strScriptDir & "\start.py"

' 使用隐藏窗口启动 Python 脚本
objShell.Run "python """ & strPythonPath & """", 0, False
