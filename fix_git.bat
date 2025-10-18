@echo off
chcp 65001
echo 修复Git配置问题...

echo 1. 配置Git用户信息
git config --global user.name "ceran-creator"
git config --global user.email "ceran-creator@users.noreply.github.com"

echo 2. 重新创建提交
git commit -m "Initial commit: N8N财务管理系统"

echo 3. 推送到GitHub
git push -u origin main

echo 完成！请检查GitHub仓库：https://github.com/ceran-creator/N8N-Finbase
pause
