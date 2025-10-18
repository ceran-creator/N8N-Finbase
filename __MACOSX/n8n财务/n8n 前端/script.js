// n8n Intelligent Finance - Home interactions

class FinancialDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeChat();
        this.loadDashboardData();
        this.initializeSidebar();
    }

    // Bind event listeners
    bindEvents() {
        // Module card click
        document.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.handleModuleClick(e.currentTarget);
            });
        });

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleActionClick(e.currentTarget);
            });
        });

        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavClick(e.currentTarget);
            });
        });

        // Chat send
        const chatSendBtn = document.querySelector('.chat-send-btn');
        const chatInput = document.querySelector('.chat-input');
        
        if (chatSendBtn && chatInput) {
            chatSendBtn.addEventListener('click', () => {
                this.sendChatMessage();
            });

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        // Header actions
        document.querySelectorAll('.action-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleHeaderAction(e.currentTarget);
            });
        });

        // Chat action buttons
        document.querySelectorAll('.chat-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChatAction(e.currentTarget);
            });
        });
    }

    // Handle module card click
    handleModuleClick(card) {
        const module = card.dataset.module;
        
        // Click animation
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Navigate by module
        switch(module) {
            case 'documents':
                this.navigateToModule('Documents', 'documents');
                break;
            case 'funds':
                this.navigateToModule('Funds', 'funds');
                break;
            case 'reports':
                this.navigateToModule('Reports', 'reports');
                break;
            case 'compliance':
                this.navigateToModule('Supervise', 'compliance');
                break;
            default:
                console.log('Unknown module:', module);
        }
    }

    // Handle quick action click
    handleActionClick(btn) {
        const action = btn.textContent.trim();
        
        // Click effect
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);

        // Note: action buttons removed on home; keep for compatibility
    }

    // Handle nav click
    handleNavClick(item) {
        // 移除所有活动状态
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        
        // 添加当前活动状态
        item.classList.add('active');
        
        const navText = item.querySelector('.nav-text').textContent;
        console.log('Navigate to:', navText);
        
        // 页面跳转逻辑
        if (navText === 'Library') {
            window.location.href = 'library.html';
        } else {
            this.showNotification(`Switched to ${navText}`);
        }
    }

    // Handle header action
    handleHeaderAction(btn) {
        const icon = btn.querySelector('i');
        const title = btn.getAttribute('title');
        
        // Click effect
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);

        if (title === 'Share') {
            this.handleShare();
        } else if (title === 'More Questions') {
            this.handleMoreQuestions();
        } else if (title === 'AI Modules') {
            this.handleAIModuleSelection();
        } else if (title === 'New Chat') {
            this.handleNewChat();
        }
    }

    // Share
    handleShare() {
        if (navigator.share) {
            navigator.share({
                title: 'n8n Intelligent Finance',
                text: 'Let AI be your finance co‑pilot. Make every decision with data.',
                url: window.location.href
            });
        } else {
            // Copy link to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Link copied to clipboard', 'success');
            });
        }
    }

    // FAQ
    handleMoreQuestions() {
        this.showModal('FAQ', `
            <div class="faq-list">
                <div class="faq-item">
                    <h4>How to upload bank statements?</h4>
                    <p>Click "Upload" and select PDF statements. The system will parse automatically.</p>
                </div>
                <div class="faq-item">
                    <h4>How to view reports?</h4>
                    <p>Open "Reports" and choose report type and date range to generate.</p>
                </div>
                <div class="faq-item">
                    <h4>How to set approval flows?</h4>
                    <p>In "Funds", configure multi‑level approvals based on amount thresholds.</p>
                </div>
                <div class="faq-item">
                    <h4>How to contact support?</h4>
                    <p>Use the AI assistant or email support@n8n.com.</p>
                </div>
            </div>
        `);
    }

    // AI module selection
    handleAIModuleSelection() {
        this.showModal('AI Modules', `
            <div class="ai-modules">
                <div class="ai-module-item">
                    <i class="fas fa-chart-line"></i>
                    <h4>Financial Analytics</h4>
                    <p>Analyze financials and provide decision insights.</p>
                </div>
                <div class="ai-module-item">
                    <i class="fas fa-shield-alt"></i>
                    <h4>Risk Monitoring</h4>
                    <p>Real‑time risk monitoring and early alerts.</p>
                </div>
                <div class="ai-module-item">
                    <i class="fas fa-file-alt"></i>
                    <h4>Document Processing</h4>
                    <p>OCR and intelligent document classification.</p>
                </div>
            </div>
        `);
    }

    // 处理新建对话
    handleNewChat() {
        // 清空聊天消息
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // 清空输入框
        const chatInput = document.querySelector('.chat-input');
        if (chatInput) {
            chatInput.value = '';
        }
        
        // 清空聊天记录
        this.chatMessages = [];
        
        this.showNotification('New conversation started', 'success');
    }

    // 处理聊天操作按钮
    handleChatAction(btn) {
        const title = btn.getAttribute('title');
        
        if (title === 'Link') {
            this.handleLinkAction();
        } else if (title === 'Image') {
            this.handleImageAction();
        }
    }

    // 处理链接操作
    handleLinkAction() {
        this.showNotification('Link feature under development...', 'info');
    }

    // 处理图片操作
    handleImageAction() {
        this.showNotification('Image feature under development...', 'info');
    }

    // 导航到模块页面
    navigateToModule(moduleName, moduleId) {
        this.showNotification(`Opening ${moduleName}...`);
        
        // 模拟页面跳转延迟
        setTimeout(() => {
            console.log(`Enter module: ${moduleName} (${moduleId})`);
            if (moduleId === 'funds') {
                window.location.href = 'funds.html';
            }
        }, 500);
    }

    // Upload dialog
    showUploadDialog() {
        this.showModal('Upload Bank Statements', `
            <div class="upload-area">
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <p>Drag & drop PDF files here or click to select</p>
                <input type="file" accept=".pdf" multiple>
                <div class="upload-tips">
                    <p>Supported: PDF</p>
                    <p>Max size: 10MB</p>
                </div>
            </div>
        `);
    }

    // New request dialog
    showNewApplicationDialog() {
        this.showModal('New Request', `
            <div class="form-group">
                <label>Type</label>
                <select>
                    <option>Reimbursement</option>
                    <option>Purchase</option>
                    <option>Travel</option>
                    <option>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" placeholder="Enter amount">
            </div>
            <div class="form-group">
                <label>Note</label>
                <textarea placeholder="Add details for this request"></textarea>
            </div>
        `);
    }

    // Report dialog
    showReportDialog() {
        this.showModal('Generate Report', `
            <div class="form-group">
                <label>Report Type</label>
                <select>
                    <option>Daily</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Yearly</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" value="${this.getCurrentDate()}">
            </div>
            <div class="form-group">
                <label>Include</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" checked> Cash flow</label>
                    <label><input type="checkbox" checked> Budget</label>
                    <label><input type="checkbox" checked> Compliance</label>
                </div>
            </div>
        `);
    }

    // 显示模态框
    showModal(title, content) {
        // 创建模态框HTML
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
                        <button class="btn-secondary modal-cancel">Cancel</button>
                        <button class="btn-primary modal-confirm">Confirm</button>
                    </div>
                </div>
            </div>
        `;

        // 添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 绑定事件
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
            this.showNotification('Confirmed');
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // 初始化侧边栏
    initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');
        const chatPanel = document.querySelector('.chat-panel');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                this.saveSidebarState(sidebar.classList.contains('collapsed'));
                this.adjustChatPanelPosition(sidebar.classList.contains('collapsed'));
            });
        }
        
        // 恢复侧边栏状态
        this.restoreSidebarState();
    }

    // 调整Chat面板位置
    adjustChatPanelPosition(isCollapsed) {
        const chatPanel = document.querySelector('.chat-panel');
        if (chatPanel) {
            if (isCollapsed) {
                chatPanel.style.left = 'calc(50% + 100px)';
            } else {
                chatPanel.style.left = '50%';
            }
        }
    }

    // 保存侧边栏状态
    saveSidebarState(isCollapsed) {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    // 恢复侧边栏状态
    restoreSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        const sidebar = document.getElementById('sidebar');
        if (sidebar && isCollapsed) {
            sidebar.classList.add('collapsed');
        }
        // 恢复Chat面板位置
        this.adjustChatPanelPosition(isCollapsed);
    }

    // 初始化聊天功能
    initializeChat() {
        this.chatMessages = [];
    }

    // 发送聊天消息
    sendChatMessage() {
        const input = document.querySelector('.chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // 跳转到Chat页面并传递消息
        this.navigateToChat(message);
    }

    // 添加聊天消息
    addChatMessage(type, content) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageHTML = this.createMessageHTML(type, content);
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 创建消息HTML
    createMessageHTML(type, content) {
        const isAI = type === 'ai';
        const avatar = isAI ? 'fas fa-robot' : 'fas fa-user';
        const avatarClass = isAI ? 'ai-message' : 'user-message';
        
        return `
            <div class="message ${avatarClass}">
                <div class="message-avatar">
                    <i class="${avatar}"></i>
                </div>
                <div class="message-content">
                    <p>${content}</p>
                </div>
            </div>
        `;
    }

    // 生成AI回复
    generateAIResponse(userMessage) {
        const responses = {
            '余额': '当前账户余额为 ¥2,850,000，较昨日增长 ¥85,000。',
            '流水': '今日共处理 15 笔流水，收入 ¥180,000，支出 ¥95,000。',
            '审批': '您有 3 笔待审批申请，其中 1 笔为大额支出需要特别注意。',
            '报表': '本月财务报表已生成，预算执行率为 93%，整体表现良好。',
            '风险': '当前无风险预警，所有财务操作均符合合规要求。'
        };

        // 简单的关键词匹配
        for (const [keyword, response] of Object.entries(responses)) {
            if (userMessage.includes(keyword)) {
                return response;
            }
        }

        // 默认回复
        return '我理解您的问题，正在为您查询相关信息。您可以询问关于账户余额、流水记录、审批状态、财务报表或风险预警等方面的问题。';
    }

    // 加载仪表板数据
    loadDashboardData() {
        // 模拟数据加载
        this.updateModuleStats();
        this.updateQuickActions();
    }

    // 更新模块统计
    updateModuleStats() {
        const stats = {
            documents: { total: 1234, monthly: 89 },
            funds: { daily: 85000, pending: 3 },
            reports: { monthly: 12, budget: 93 },
            compliance: { check: 100, warnings: 0 }
        };

        // 这里可以添加实际的数据更新逻辑
        console.log('模块统计数据已更新:', stats);
    }

    // 更新快速操作
    updateQuickActions() {
        // 这里可以添加快速操作的状态更新逻辑
        console.log('快速操作已更新');
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#22C55E' : '#3B82F6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
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

    // 跳转到Chat页面
    navigateToChat(message = '') {
        // 保存消息到sessionStorage，以便Chat页面使用
        if (message) {
            sessionStorage.setItem('pendingChatMessage', message);
        }
        
        // 跳转到Chat页面
        window.location.href = 'chat.html';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new FinancialDashboard();
});

// 全局导航函数
function navigateToHome() {
    window.location.href = 'home.html';
}

function navigateToLibrary() {
    window.location.href = 'library.html';
}

// 添加模态框样式
const modalStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #E5E7EB;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6B7280;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
}

.modal-close:hover {
    background: #F3F4F6;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px;
    border-top: 1px solid #E5E7EB;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.15s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: normal;
    margin-bottom: 0;
}

.upload-area {
    text-align: center;
    padding: 40px 20px;
    border: 2px dashed #D1D5DB;
    border-radius: 8px;
    background: #F9FAFB;
}

.upload-icon {
    font-size: 3rem;
    color: #9CA3AF;
    margin-bottom: 16px;
}

.upload-area p {
    margin-bottom: 16px;
    color: #6B7280;
}

.upload-area input[type="file"] {
    margin-bottom: 16px;
}

.upload-tips {
    font-size: 12px;
    color: #9CA3AF;
}

.upload-tips p {
    margin: 4px 0;
}

.btn-primary,
.btn-secondary {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
}

.btn-primary {
    background: #3B82F6;
    color: white;
}

.btn-primary:hover {
    background: #2563EB;
}

.btn-secondary {
    background: #F3F4F6;
    color: #374151;
    border: 1px solid #D1D5DB;
}

.btn-secondary:hover {
    background: #E5E7EB;
}

.user-message {
    flex-direction: row-reverse;
}

.user-message .message-avatar {
    background: #3B82F6;
    color: white;
}

.user-message .message-content {
    background: #3B82F6;
    color: white;
}
</style>
`;

// 添加模态框样式到页面
document.head.insertAdjacentHTML('beforeend', modalStyles);
