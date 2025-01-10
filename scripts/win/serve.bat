@REM START /b launch-plantuml-server
cd /d %~dp0..\..\
@REM yarn serve --port 8585
"C:\Program Files\Anaconda3\python.exe" -m http.server -b 127.0.0.1 8585 -d D:\Programs\docusaurus\build\