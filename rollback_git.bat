@echo off
chcp 65001
echo 回滚Git操作...

echo 1. 删除Git仓库
if exist .git (
    rmdir /s /q .git
    echo Git仓库已删除
) else (
    echo Git仓库不存在
)

echo 2. 删除Git相关文件
if exist .gitignore del .gitignore
if exist git_setup.bat del git_setup.bat
if exist fix_git.bat del fix_git.bat

echo 3. 清理完成
echo 项目已恢复到Git初始化前的状态
pause
