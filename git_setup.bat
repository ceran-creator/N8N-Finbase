@echo off
chcp 65001
echo 开始初始化Git仓库...

echo 1. 初始化Git仓库
git init

echo 2. 添加所有文件到Git
git add .

echo 3. 创建初始提交
git commit -m "Initial commit: N8N财务管理系统"

echo 4. 添加GitHub远程仓库
git remote add origin git@github.com:ceran-creator/N8N-Finbase.git

echo 5. 设置主分支
git branch -M main

echo 6. 推送到GitHub
git push -u origin main

echo 完成！请检查GitHub仓库：https://github.com/ceran-creator/N8N-Finbase
pause
