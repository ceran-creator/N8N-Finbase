@echo off
chcp 65001
echo 修复Vercel部署问题...

echo 1. 创建新的项目结构
if not exist "public" mkdir public

echo 2. 复制前端文件到public目录
xcopy "n8n财务\n8n 前端\*" "public\" /E /I /Y

echo 3. 创建新的vercel.json配置
echo { > vercel.json
echo   "version": 2, >> vercel.json
echo   "builds": [ >> vercel.json
echo     { >> vercel.json
echo       "src": "public/**", >> vercel.json
echo       "use": "@vercel/static" >> vercel.json
echo     } >> vercel.json
echo   ], >> vercel.json
echo   "routes": [ >> vercel.json
echo     { >> vercel.json
echo       "src": "/(.*)", >> vercel.json
echo       "dest": "/public/$1" >> vercel.json
echo     }, >> vercel.json
echo     { >> vercel.json
echo       "src": "/", >> vercel.json
echo       "dest": "/public/index.html" >> vercel.json
echo     } >> vercel.json
echo   ] >> vercel.json
echo } >> vercel.json

echo 4. 更新package.json
echo { > package.json
echo   "name": "n8n-finbase", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "N8N财务管理系统 - 基于n8n的财务自动化解决方案", >> package.json
echo   "main": "public/index.html", >> package.json
echo   "scripts": { >> package.json
echo     "build": "echo 'Static site - no build needed'", >> package.json
echo     "start": "echo 'Static site - no start needed'" >> package.json
echo   }, >> package.json
echo   "keywords": [ >> package.json
echo     "n8n", >> package.json
echo     "finance", >> package.json
echo     "automation", >> package.json
echo     "financial-management" >> package.json
echo   ], >> package.json
echo   "author": "ceran-creator", >> package.json
echo   "license": "MIT" >> package.json
echo } >> package.json

echo 5. 提交更改到Git
git add .
git commit -m "Fix Vercel deployment: restructure project for static hosting"

echo 6. 推送到GitHub
git push origin main

echo.
echo ✅ 修复完成！
echo 📍 现在可以重新部署到Vercel了
echo.
pause
