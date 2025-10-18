// Library页面交互脚本

class LibraryManager {
    constructor() {
        this.selectedFiles = new Set();
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeSidebar();
        this.loadLibraryData();
        this.bindTitleActions();
    }

    // 绑定事件监听器
    bindEvents() {
        // 滑动箭头事件
        this.initializeScrollButtons();
        
        // Public Files外侧滑动箭头事件
        this.bindPublicOuterArrows();

        // 文件卡片事件
        document.querySelectorAll('.file-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.handleFileClick(e.currentTarget, e);
            });
        });

        // 文件操作按钮事件
        document.querySelectorAll('.file-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleFileAction(e.currentTarget);
            });
        });

        // 搜索功能
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // 拖拽上传
        this.initializeDragAndDrop();
    }

    // 绑定标题上方操作按钮
    bindTitleActions() {
        const uploadBtn = document.getElementById('titleUploadBtn');
        const deleteBtn = document.getElementById('titleDeleteBtn');
        const searchBtn = document.getElementById('searchBtn');
        
        if (uploadBtn) uploadBtn.addEventListener('click', () => this.handleUpload());
        if (deleteBtn) deleteBtn.addEventListener('click', () => this.handleDelete());
        if (searchBtn) searchBtn.addEventListener('click', () => this.handleSearch());
    }

    // 绑定Public Files外侧滑动箭头事件
    bindPublicOuterArrows() {
        const publicOuterScrollLeft = document.getElementById('publicOuterScrollLeft');
        const publicOuterScrollRight = document.getElementById('publicOuterScrollRight');
        const publicScrollContainer = document.getElementById('publicFilesScroll');

        if (publicOuterScrollLeft && publicOuterScrollRight && publicScrollContainer) {
            publicOuterScrollLeft.addEventListener('click', () => {
                this.scrollLeft(publicScrollContainer);
            });
            publicOuterScrollRight.addEventListener('click', () => {
                this.scrollRight(publicScrollContainer);
            });
        }
    }

    // 初始化滑动箭头
    initializeScrollButtons() {
        // Recent Files滑动箭头
        const recentScrollLeft = document.getElementById('recentScrollLeft');
        const recentScrollRight = document.getElementById('recentScrollRight');
        const recentScrollContainer = document.getElementById('recentFilesScroll');

        if (recentScrollLeft && recentScrollRight && recentScrollContainer) {
            recentScrollLeft.addEventListener('click', () => {
                this.scrollLeft(recentScrollContainer);
            });

            recentScrollRight.addEventListener('click', () => {
                this.scrollRight(recentScrollContainer);
            });
        }

        // Public Files滑动箭头
        const publicScrollLeft = document.getElementById('publicScrollLeft');
        const publicScrollRight = document.getElementById('publicScrollRight');
        const publicScrollContainer = document.getElementById('publicFilesScroll');

        if (publicScrollLeft && publicScrollRight && publicScrollContainer) {
            publicScrollLeft.addEventListener('click', () => {
                this.scrollLeft(publicScrollContainer);
            });

            publicScrollRight.addEventListener('click', () => {
                this.scrollRight(publicScrollContainer);
            });
        }
    }

    // 向左滚动
    scrollLeft(container) {
        const scrollAmount = 300; // 每次滚动的距离
        container.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    }

    // 向右滚动
    scrollRight(container) {
        const scrollAmount = 300; // 每次滚动的距离
        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    // 处理文件点击
    handleFileClick(card, event) {
        // 如果点击的是操作按钮，不处理文件选择
        if (event.target.closest('.file-action-btn')) {
            return;
        }

        const fileId = card.dataset.fileId;
        
        if (this.selectedFiles.has(fileId)) {
            this.selectedFiles.delete(fileId);
            card.classList.remove('selected');
        } else {
            this.selectedFiles.add(fileId);
            card.classList.add('selected');
        }

        this.updateDeleteButtonState();
    }

    // 处理文件操作
    handleFileAction(btn) {
        const title = btn.getAttribute('title');
        const fileCard = btn.closest('.file-card');
        const fileId = fileCard.dataset.fileId;
        
        switch(title) {
            case '预览':
                this.previewFile(fileId);
                break;
            case '下载':
                this.downloadFile(fileId);
                break;
            case '更多':
                this.showFileMenu(fileId, btn);
                break;
        }
    }

    // 处理上传
    handleUpload() {
        this.showModal('上传文件', `
            <div class="upload-area">
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <p>拖拽文件到此处或点击选择文件</p>
                <input type="file" id="fileInput" multiple accept=".pdf,.docx,.xlsx,.txt">
                <div class="upload-tips">
                    <p>支持格式：PDF, DOCX, XLSX, TXT</p>
                    <p>最大文件大小：10MB</p>
                </div>
            </div>
        `);

        // 绑定文件选择事件
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }
    }

    // 处理文件上传
    handleFileUpload(files) {
        if (files.length === 0) return;

        // 模拟上传进度
        this.showNotification(`开始上传 ${files.length} 个文件...`, 'info');
        
        Array.from(files).forEach((file, index) => {
            setTimeout(() => {
                this.addNewFile(file);
                if (index === files.length - 1) {
                    this.showNotification('所有文件上传完成！', 'success');
                }
            }, (index + 1) * 1000);
        });
    }

    // 添加新文件
    addNewFile(file) {
        const fileId = Date.now().toString();
        const fileCard = this.createFileCard(fileId, file);
        
        // 添加到Recent Files区域
        const recentGrid = document.querySelector('.recent-files-grid');
        if (recentGrid) {
            recentGrid.insertBefore(fileCard, recentGrid.firstChild);
        }
    }

    // 创建文件卡片
    createFileCard(fileId, file) {
        const fileType = this.getFileType(file.name);
        const fileSize = this.formatFileSize(file.size);
        
        return document.createElement('div');
        // 这里可以创建完整的文件卡片HTML
    }

    // 获取文件类型
    getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': { icon: 'fas fa-file-pdf', class: '' },
            'docx': { icon: 'fas fa-file-word', class: 'word' },
            'xlsx': { icon: 'fas fa-file-excel', class: 'excel' },
            'txt': { icon: 'fas fa-file-alt', class: '' }
        };
        return typeMap[extension] || { icon: 'fas fa-file', class: '' };
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 处理删除
    handleDelete() {
        if (this.selectedFiles.size === 0) {
            this.showNotification('请先选择要删除的文件', 'warning');
            return;
        }

        this.showModal('确认删除', `
            <p>确定要删除选中的 ${this.selectedFiles.size} 个文件吗？</p>
            <p class="text-sm text-gray-500">此操作无法撤销</p>
        `, () => {
            this.deleteSelectedFiles();
        });
    }

    // 处理搜索操作
    handleSearch() {
        this.showNotification('搜索功能已激活', 'info');
        // 这里可以添加搜索逻辑，比如显示搜索框或打开搜索面板
    }

    // 删除选中的文件
    deleteSelectedFiles() {
        this.selectedFiles.forEach(fileId => {
            const fileCard = document.querySelector(`[data-file-id="${fileId}"]`);
            if (fileCard) {
                fileCard.style.transform = 'scale(0.8)';
                fileCard.style.opacity = '0';
                setTimeout(() => {
                    fileCard.remove();
                }, 300);
            }
        });
        
        this.selectedFiles.clear();
        this.updateDeleteButtonState();
        this.showNotification('文件删除成功', 'success');
    }

    // 更新删除按钮状态
    updateDeleteButtonState() {
        const deleteBtn = document.querySelector('.delete-btn');
        if (deleteBtn) {
            if (this.selectedFiles.size > 0) {
                deleteBtn.style.opacity = '1';
                deleteBtn.style.pointerEvents = 'auto';
                deleteBtn.querySelector('span').textContent = `删除 (${this.selectedFiles.size})`;
            } else {
                deleteBtn.style.opacity = '0.5';
                deleteBtn.style.pointerEvents = 'none';
                deleteBtn.querySelector('span').textContent = '删除';
            }
        }
    }

    // 处理日期筛选
    handleDateFilter() {
        this.showModal('选择日期范围', `
            <div class="form-group">
                <label>开始日期</label>
                <input type="date" id="startDate" value="${this.getCurrentDate()}">
            </div>
            <div class="form-group">
                <label>结束日期</label>
                <input type="date" id="endDate" value="${this.getCurrentDate()}">
            </div>
        `, () => {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            this.filterFilesByDate(startDate, endDate);
        });
    }

    // 按日期筛选文件
    filterFilesByDate(startDate, endDate) {
        const fileCards = document.querySelectorAll('.file-card');
        let visibleCount = 0;

        fileCards.forEach(card => {
            const fileDate = this.extractFileDate(card);
            const isVisible = fileDate >= startDate && fileDate <= endDate;
            
            card.style.display = isVisible ? 'flex' : 'none';
            if (isVisible) visibleCount++;
        });

        this.showNotification(`筛选完成，显示 ${visibleCount} 个文件`, 'success');
    }

    // 提取文件日期
    extractFileDate(card) {
        const metaText = card.querySelector('.file-meta').textContent;
        // 这里需要根据实际的文件元数据格式来解析日期
        return this.getCurrentDate(); // 临时返回当前日期
    }

    // 处理搜索
    handleSearch(query) {
        const fileCards = document.querySelectorAll('.file-card');
        let visibleCount = 0;

        fileCards.forEach(card => {
            const fileName = card.querySelector('.file-name').textContent.toLowerCase();
            const isVisible = fileName.includes(query.toLowerCase());
            
            card.style.display = isVisible ? 'flex' : 'none';
            if (isVisible) visibleCount++;
        });

        // 更新文件计数
        this.updateFileCounts();
    }

    // 更新文件计数
    updateFileCounts() {
        const recentCount = document.querySelectorAll('.recent-file:not([style*="display: none"])').length;
        const publicCount = document.querySelectorAll('.public-file:not([style*="display: none"])').length;
        
        const recentCountEl = document.querySelector('.recent-files-section .file-count');
        const publicCountEl = document.querySelector('.public-files-section .file-count');
        
        if (recentCountEl) recentCountEl.textContent = `${recentCount} files`;
        if (publicCountEl) publicCountEl.textContent = `${publicCount} files`;
    }

    // 预览文件
    previewFile(fileId) {
        this.showNotification('文件预览功能开发中...', 'info');
    }

    // 下载文件
    downloadFile(fileId) {
        this.showNotification('文件下载功能开发中...', 'info');
    }

    // 显示文件菜单
    showFileMenu(fileId, button) {
        this.showNotification('文件菜单功能开发中...', 'info');
    }

    // 初始化拖拽上传
    initializeDragAndDrop() {
        const libraryContainer = document.querySelector('.library-container');
        
        if (libraryContainer) {
            libraryContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                libraryContainer.classList.add('drag-over');
            });

            libraryContainer.addEventListener('dragleave', (e) => {
                e.preventDefault();
                libraryContainer.classList.remove('drag-over');
            });

            libraryContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                libraryContainer.classList.remove('drag-over');
                this.handleFileUpload(e.dataTransfer.files);
            });
        }
    }

    // 初始化侧边栏
    initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');
        
        if (toggleBtn) {
            // 移除之前可能存在的监听器
            const newToggleBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
            
            newToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                sidebar.classList.toggle('collapsed');
                this.saveSidebarState(sidebar.classList.contains('collapsed'));
                this.adjustChatPanelPosition(sidebar.classList.contains('collapsed'));
                
                console.log('Sidebar toggled:', sidebar.classList.contains('collapsed'));
            });
        }
        
        // 恢复侧边栏状态
        this.restoreSidebarState();
    }

    // 保存侧边栏状态
    saveSidebarState(isCollapsed) {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    // 恢复侧边栏状态
    restoreSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
            this.adjustChatPanelPosition(isCollapsed);
        }
    }

    // 调整Chat面板位置
    adjustChatPanelPosition(isCollapsed) {
        const chatPanel = document.querySelector('.chat-panel');
        if (chatPanel) {
            if (isCollapsed) {
                chatPanel.style.left = '80px';
            } else {
                chatPanel.style.left = '280px';
            }
        }
    }

    // 加载Library数据
    loadLibraryData() {
        // 模拟数据加载
        this.updateFileCounts();
    }

    // 显示模态框
    showModal(title, content, onConfirm = null) {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary modal-cancel">取消</button>
                        <button class="btn-primary modal-confirm">确认</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.querySelector('.modal-overlay');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        const confirmBtn = modal.querySelector('.modal-confirm');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#22C55E' : type === 'warning' ? '#F59E0B' : '#3B82F6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // 获取当前日期
    getCurrentDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new LibraryManager();
});

// 全局导航函数
function navigateToHome() {
    window.location.href = 'home.html';
}

function navigateToLibrary() {
    window.location.href = 'library.html';
}

// 交互已在LibraryManager.bindTitleActions中绑定，无需重复初始化
