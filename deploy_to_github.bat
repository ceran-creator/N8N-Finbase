@echo off
chcp 65001
echo 开始部署项目到GitHub...

echo 1. 初始化Git仓库
git init

echo 2. 配置Git用户信息
git config --global user.name "ceran-creator"
git config --global user.email "ceran-creator@users.noreply.github.com"

echo 3. 创建.gitignore文件
echo # 操作系统生成的文件 > .gitignore
echo .DS_Store >> .gitignore
echo .DS_Store? >> .gitignore
echo ._* >> .gitignore
echo .Spotlight-V100 >> .gitignore
echo .Trashes >> .gitignore
echo ehthumbs.db >> .gitignore
echo Thumbs.db >> .gitignore
echo. >> .gitignore
echo # 临时文件 >> .gitignore
echo *.tmp >> .gitignore
echo *.temp >> .gitignore
echo *~ >> .gitignore
echo. >> .gitignore
echo # 日志文件 >> .gitignore
echo *.log >> .gitignore
echo. >> .gitignore
echo # 依赖目录 >> .gitignore
echo node_modules/ >> .gitignore
echo npm-debug.log* >> .gitignore
echo yarn-debug.log* >> .gitignore
echo yarn-error.log* >> .gitignore
echo. >> .gitignore
echo # 环境变量文件 >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo .env.development.local >> .gitignore
echo .env.test.local >> .gitignore
echo .env.production.local >> .gitignore
echo. >> .gitignore
echo # IDE和编辑器文件 >> .gitignore
echo .vscode/ >> .gitignore
echo .idea/ >> .gitignore
echo *.swp >> .gitignore
echo *.swo >> .gitignore
echo *~ >> .gitignore
echo. >> .gitignore
echo # 构建输出 >> .gitignore
echo dist/ >> .gitignore
echo build/ >> .gitignore
echo out/ >> .gitignore
echo. >> .gitignore
echo # 缓存文件 >> .gitignore
echo .cache/ >> .gitignore
echo .parcel-cache/ >> .gitignore
echo. >> .gitignore
echo # 测试覆盖率报告 >> .gitignore
echo coverage/ >> .gitignore
echo. >> .gitignore
echo # 其他 >> .gitignore
echo *.pid >> .gitignore
echo *.seed >> .gitignore
echo *.pid.lock >> .gitignore

echo 4. 添加所有文件到Git
git add .

echo 5. 创建初始提交
git commit -m "Initial commit: N8N财务管理系统 - 基于n8n的财务自动化解决方案"

echo 6. 添加GitHub远程仓库
git remote add origin git@github.com:ceran-creator/N8N-Finbase.git

echo 7. 设置主分支
git branch -M main

echo 8. 推送到GitHub
git push -u origin main

echo.
echo ✅ 部署完成！
echo 📍 您的GitHub仓库地址：https://github.com/ceran-creator/N8N-Finbase
echo.
pause
