// Chat Page Specific JavaScript

class ChatInterface {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.apiUrl = 'https://lynn-cafa-system.app.n8n.cloud/webhook/financial-chat-webhook/chat';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChatHistory();
        this.setupAutoResize();
        this.updateFloatingLabel();
        
        // 延迟初始化侧边栏，确保DOM完全加载
        setTimeout(() => {
            this.initializeSidebar();
            this.testConnection();
        }, 100);
    }

    bindEvents() {
        // Send button and Enter key
        const sendBtn = document.getElementById('sendBtn');
        const chatInput = document.getElementById('chatInput');

        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Character count and floating label
            chatInput.addEventListener('input', () => {
                this.updateCharacterCount();
                this.toggleSendButton();
                this.updateFloatingLabel();
            });

            // Handle focus events for floating label
            chatInput.addEventListener('focus', () => {
                this.updateFloatingLabel();
            });

            chatInput.addEventListener('blur', () => {
                this.updateFloatingLabel();
            });
        }

        // Input action buttons
        document.querySelectorAll('.input-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleInputAction(e.currentTarget);
            });
        });

        // PDF action buttons
        document.querySelectorAll('.pdf-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handlePdfAction(e.currentTarget);
            });
        });

        // Recent chat items
        document.querySelectorAll('.recent-chat-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectChat(e.currentTarget);
            });
        });

        // Header actions
        document.querySelectorAll('.action-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleHeaderAction(e.currentTarget);
            });
        });

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavigation(e.currentTarget);
            });
        });
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();

        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage('user', message);
        chatInput.value = '';
        this.updateCharacterCount();
        this.toggleSendButton();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Call n8n AI API
            const aiResponse = await this.callFinancialAI(message);
            this.updateConnectionStatus(true);
            this.hideTypingIndicator();
            this.addMessage('ai', aiResponse);
        } catch (error) {
            this.hideTypingIndicator();
            console.error('AI API Error:', error);
            const errorMessage = this.handleAPIError(error);
            this.addMessage('ai', errorMessage);
        }
    }

    addMessage(type, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = this.createMessageElement(type, content);
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Store message
        this.messages.push({ type, content, timestamp: new Date() });
    }

    createMessageElement(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <span>An</span>
                </div>
                <div class="message-content">
                    <p>${this.escapeHtml(content)}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="ai-avatar">
                        <img src="设计图/Logo-图标.png" alt="AI Assistant">
                    </div>
                </div>
                <div class="message-content">
                    <p>${this.escapeHtml(content)}</p>
                </div>
            `;
        }

        return messageDiv;
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatMessages');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <div class="ai-avatar">
                    <img src="设计图/Logo-图标.png" alt="AI Assistant">
                </div>
            </div>
            <div class="typing-indicator">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    async callFinancialAI(message) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'sendMessage',
                    chatInput: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // 处理n8n返回的数据格式
            if (data.output) {
                return data.output;
            } else if (data.message) {
                return data.message;
            } else if (typeof data === 'string') {
                return data;
            } else {
                return JSON.stringify(data, null, 2);
            }
        } catch (error) {
            console.error('Financial AI API Error:', error);
            throw error;
        }
    }

    handleAPIError(error) {
        this.updateConnectionStatus(false);
        if (error.message.includes('Failed to fetch')) {
            return '抱歉，无法连接到AI财务助手。请检查网络连接或稍后重试。';
        } else if (error.message.includes('HTTP 4')) {
            return '请求格式有误，请重新输入您的问题。';
        } else if (error.message.includes('HTTP 5')) {
            return 'AI财务助手暂时不可用，请稍后重试。';
        } else {
            return `抱歉，发生了错误：${error.message}。请稍后重试。`;
        }
    }

    async testConnection() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'sendMessage',
                    chatInput: '测试连接'
                })
            });

            if (response.ok) {
                this.updateConnectionStatus(true);
                console.log('AI财务助手连接成功');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.updateConnectionStatus(false);
            console.warn('AI财务助手连接失败:', error.message);
        }
    }

    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = isConnected ? '🟢' : '🔴';
            statusElement.title = isConnected ? 'AI助手在线' : 'AI助手离线';
        }
    }

    generateAIResponse(userMessage) {
        const responses = {
            '财务': '我可以帮您分析TechStart Solutions的财务数据。从Q3 2024报告来看，公司营收增长30.3%，主要由订阅收入驱动。',
            '报表': '根据最新的季度报告，TechStart Solutions在Q3 2024实现了总收入$213,000，同比增长20.3%。',
            '收入': '公司Q3 2024的营业收入为$185,000，较Q2增长30.3%。一次性服务费为$28,000，下降20%。',
            '费用': '总运营费用为$172,000，同比增长8.9%。主要包括研发费用$85,000和销售营销费用$52,000。',
            '利润': '营业利润为-$1,600，相比Q2的-$11,400有显著改善，改善幅度达86%。',
            '增长': '公司整体呈现良好的增长趋势，收入增长率超过费用增长率，成本控制效果明显。',
            'hello': 'Hello! I\'m here to help you analyze TechStart Solutions\' financial data. What would you like to know?',
            'hi': 'Hi there! Feel free to ask me anything about the Q3 2024 financial report.',
            'help': '我可以帮您分析以下内容：\n• 财务报表数据\n• 收入和费用分析\n• 增长趋势\n• 成本控制情况\n• 盈利能力分析'
        };

        // 关键词匹配
        for (const [keyword, response] of Object.entries(responses)) {
            if (userMessage.toLowerCase().includes(keyword.toLowerCase())) {
                return response;
            }
        }

        // 默认回复
        const defaultResponses = [
            '基于TechStart Solutions Q3 2024的财务数据，我注意到公司在收入增长方面表现出色。您想了解哪个具体方面？',
            '从财务报告来看，公司的订阅收入是主要增长驱动力。我可以为您详细分析任何财务指标。',
            '我理解您的问题。根据当前的财务数据，我可以提供关于收入、费用、利润或增长趋势的详细分析。',
            '让我基于Q3 2024的数据为您提供分析。您希望重点关注哪个财务领域？'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    updateCharacterCount() {
        const chatInput = document.getElementById('chatInput');
        const charCount = document.querySelector('.character-count');
        
        if (chatInput && charCount) {
            const count = chatInput.value.length;
            charCount.textContent = `${count}/1000`;
            
            if (count > 900) {
                charCount.style.color = 'var(--warning-600)';
            } else if (count > 950) {
                charCount.style.color = 'var(--error-600)';
            } else {
                charCount.style.color = 'var(--gray-400)';
            }
        }
    }

    toggleSendButton() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (chatInput && sendBtn) {
            const hasContent = chatInput.value.trim().length > 0;
            sendBtn.disabled = !hasContent || this.isTyping;
            
            if (hasContent && !this.isTyping) {
                sendBtn.style.background = 'var(--primary-500)';
            } else {
                sendBtn.style.background = 'var(--gray-300)';
            }
        }
    }

    updateFloatingLabel() {
        const chatInput = document.getElementById('chatInput');
        const floatingLabel = document.querySelector('.floating-label');
        
        if (chatInput && floatingLabel) {
            const hasContent = chatInput.value.trim().length > 0;
            const isFocused = document.activeElement === chatInput;
            
            if (hasContent || isFocused) {
                // 隐藏标签当有内容或获得焦点时
                floatingLabel.style.opacity = '0';
                floatingLabel.style.visibility = 'hidden';
            } else {
                // 显示标签当输入框为空且未获得焦点时
                floatingLabel.style.opacity = '1';
                floatingLabel.style.visibility = 'visible';
            }
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    setupAutoResize() {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            });
        }
    }

    handleInputAction(btn) {
        const title = btn.getAttribute('title');
        
        if (title === 'Attach') {
            this.handleAttachment();
        } else if (title === 'Image') {
            this.handleImageUpload();
        }
    }

    handleAttachment() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.txt,.csv,.xlsx';
        fileInput.multiple = true;
        
        fileInput.onchange = (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.showNotification(`已选择 ${files.length} 个文件`, 'success');
                // 这里可以添加文件上传逻辑
            }
        };
        
        fileInput.click();
    }

    handleImageUpload() {
        // Create image input
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.multiple = true;
        
        imageInput.onchange = (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.showNotification(`已选择 ${files.length} 张图片`, 'success');
                // 这里可以添加图片上传逻辑
            }
        };
        
        imageInput.click();
    }

    handlePdfAction(btn) {
        const title = btn.getAttribute('title');
        
        if (title === 'Share') {
            this.sharePdf();
        } else if (title === 'Favorite') {
            this.toggleFavorite(btn);
        } else if (title === 'Download') {
            this.downloadPdf();
        }
    }

    sharePdf() {
        if (navigator.share) {
            navigator.share({
                title: 'TechStart Solutions - Q3 2024 Financial Report',
                text: 'Quarterly Financial Report for TechStart Solutions Co., Ltd.',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('链接已复制到剪贴板', 'success');
            });
        }
    }

    toggleFavorite(btn) {
        const icon = btn.querySelector('i');
        const isFavorited = icon.classList.contains('fas');
        
        if (isFavorited) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.style.color = 'var(--gray-600)';
            this.showNotification('已取消收藏', 'info');
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.style.color = 'var(--error-500)';
            this.showNotification('已添加到收藏', 'success');
        }
    }

    downloadPdf() {
        // 模拟PDF下载
        this.showNotification('正在下载PDF文件...', 'info');
        
        setTimeout(() => {
            this.showNotification('PDF下载完成', 'success');
        }, 2000);
    }

    selectChat(chatItem) {
        // Remove active class from all items
        document.querySelectorAll('.recent-chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected item
        chatItem.classList.add('active');
        
        // Load chat content (模拟)
        const chatPreview = chatItem.querySelector('.chat-preview').textContent;
        this.showNotification(`已切换到: ${chatPreview.substring(0, 30)}...`, 'info');
    }

    handleHeaderAction(btn) {
        const title = btn.getAttribute('title');
        
        if (title === 'Share') {
            this.shareChat();
        } else if (title === 'More Questions') {
            this.showMoreQuestions();
        } else if (title === 'New Chat') {
            this.startNewChat();
        }
    }

    shareChat() {
        if (navigator.share) {
            navigator.share({
                title: 'Chat with AI - Financial Analysis',
                text: 'AI-powered financial analysis conversation',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('聊天链接已复制', 'success');
            });
        }
    }

    showMoreQuestions() {
        const suggestions = [
            '分析公司的盈利能力趋势',
            '比较Q2和Q3的费用结构',
            '评估成本控制效果',
            '预测Q4财务表现',
            '分析现金流状况'
        ];
        
        const suggestionsList = suggestions.map(s => `• ${s}`).join('\n');
        this.addMessage('ai', `以下是一些您可能感兴趣的问题：\n\n${suggestionsList}\n\n您可以直接点击或输入任何问题。`);
    }

    startNewChat() {
        // Clear messages
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';
        
        // Clear input
        const chatInput = document.getElementById('chatInput');
        chatInput.value = '';
        
        // Reset state
        this.messages = [];
        this.updateCharacterCount();
        this.toggleSendButton();
        
        this.showNotification('已开始新对话', 'success');
    }

    handleNavigation(navItem) {
        const navText = navItem.querySelector('.nav-text')?.textContent;
        
        if (navText === 'Home') {
            window.location.href = 'home.html';
        } else if (navText === 'Library') {
            window.location.href = 'library.html';
        } else {
            this.showNotification(`导航到 ${navText}`, 'info');
        }
    }

    initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');
        
        if (!sidebar) {
            console.error('Sidebar element not found');
            return;
        }
        
        if (!toggleBtn) {
            console.error('Toggle button not found');
            return;
        }
        
        // 确保按钮可见
        toggleBtn.style.display = 'flex';
        toggleBtn.style.pointerEvents = 'auto';
        
        // 绑定点击事件
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 切换collapsed类
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            
            // 保存状态
            this.saveSidebarState(isCollapsed);
            
            // 触发重排以确保样式生效
            sidebar.offsetWidth;
        });
        
        // 恢复侧边栏状态
        this.restoreSidebarState();
    }

    saveSidebarState(isCollapsed) {
        localStorage.setItem('chatSidebarCollapsed', isCollapsed);
    }

    restoreSidebarState() {
        const isCollapsed = localStorage.getItem('chatSidebarCollapsed') === 'true';
        const sidebar = document.getElementById('sidebar');
        if (sidebar && isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }

    loadChatHistory() {
        // 检查是否有从主页传递过来的消息
        const pendingMessage = sessionStorage.getItem('pendingChatMessage');
        if (pendingMessage) {
            // 清除sessionStorage中的消息
            sessionStorage.removeItem('pendingChatMessage');
            
            // 延迟发送消息，确保页面完全加载
            setTimeout(() => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = pendingMessage;
                    this.sendMessage();
                }
            }, 500);
        }
        
        // 模拟加载聊天历史
        console.log('Chat history loaded');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#3B82F6',
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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();
    
    // 备用初始化，确保侧边栏功能正常
    setTimeout(() => {
        initSidebarFallback();
    }, 500);
});

// 备用侧边栏初始化函数
function initSidebarFallback() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (sidebar && toggleBtn) {
        // 移除可能存在的事件监听器
        const newToggleBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
        
        // 重新绑定事件
        newToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sidebar.classList.toggle('collapsed');
        });
    }
}

// 全局导航函数
function navigateToHome() {
    window.location.href = 'home.html';
}

function navigateToLibrary() {
    window.location.href = 'library.html';
}

// 全局测试函数
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}
