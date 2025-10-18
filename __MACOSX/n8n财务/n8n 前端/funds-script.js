// 资金页面交互脚本（与主页风格一致，最小依赖即可运行）

class FundsPage {
    constructor() {
        this.chatMessages = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeSidebar();
    }

    bindEvents() {
        // read more 按钮
        document.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.currentTarget.closest('[data-module]');
                const title = card?.querySelector('.others-module-title')?.textContent?.trim() || 'Details';
                this.showNotification(`Open ${title}`);
            });
        });

        // Others 区域卡片点击
        document.querySelectorAll('.others-module').forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.others-module-title')?.textContent?.trim();
                this.showNotification(`Enter: ${title}`);
            });
        });

        // 顶部 Header 图标
        document.querySelectorAll('.action-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.currentTarget.getAttribute('title');
                if (title === 'Share') {
                    this.handleShare();
                } else if (title === 'More Questions') {
                    this.showNotification('FAQ coming soon...');
                } else if (title === 'AI Module Picker') {
                    this.showNotification('AI module picker coming soon...');
                } else if (title === 'New Chat') {
                    this.resetChat();
                }
            });
        });

        // 聊天发送
        const chatSendBtn = document.querySelector('.chat-send-btn');
        const chatInput = document.querySelector('.chat-input');
        if (chatSendBtn && chatInput) {
            chatSendBtn.addEventListener('click', () => this.sendChatMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }

        // Chat 面板左侧操作按钮
        document.querySelectorAll('.chat-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.currentTarget.getAttribute('title');
                this.showNotification(`${title} feature coming soon...`);
            });
        });

        // 左侧导航：保持与其他页面一致的行为
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const text = e.currentTarget.querySelector('.nav-text')?.textContent?.trim();
                if (text === 'Home') navigateToHome();
                if (text === 'Library') navigateToLibrary();
            });
        });
    }

    // 侧边栏折叠与状态恢复
    initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');
        const chatPanel = document.querySelector('.chat-panel');

        const adjustChat = (collapsed) => {
            if (!chatPanel) return;
            chatPanel.style.left = collapsed ? 'calc(50% + 100px)' : '50%';
        };

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                const collapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarCollapsed', collapsed);
                adjustChat(collapsed);
            });
        }

        const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (collapsed) sidebar.classList.add('collapsed');
        adjustChat(collapsed);
    }

    // 简易通知
    showNotification(message, type = 'info') {
        const notice = document.createElement('div');
        notice.textContent = message;
        notice.style.position = 'fixed';
        notice.style.top = '20px';
        notice.style.right = '20px';
        notice.style.zIndex = '1000';
        notice.style.padding = '12px 16px';
        notice.style.borderRadius = '8px';
        notice.style.color = '#fff';
        notice.style.background = type === 'success' ? '#16A34A' : '#3B82F6';
        notice.style.boxShadow = '0 6px 20px rgba(0,0,0,.15)';
        notice.style.transform = 'translateX(120%)';
        notice.style.transition = 'transform .25s ease';
        document.body.appendChild(notice);
        requestAnimationFrame(() => notice.style.transform = 'translateX(0)');
        setTimeout(() => {
            notice.style.transform = 'translateX(120%)';
            setTimeout(() => notice.remove(), 250);
        }, 2500);
    }

    handleShare() {
        if (navigator.share) {
            navigator.share({ title: 'Funds', url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Link copied to clipboard', 'success');
            });
        }
    }

    resetChat() {
        const input = document.querySelector('.chat-input');
        if (input) input.value = '';
        this.chatMessages = [];
        this.showNotification('Started a new chat', 'success');
    }

    sendChatMessage() {
        const input = document.querySelector('.chat-input');
        const text = input?.value?.trim();
        if (!text) return;
        this.chatMessages.push({ role: 'user', content: text });
        input.value = '';
        setTimeout(() => {
            this.chatMessages.push({ role: 'ai', content: 'Got it. I will help you in the Funds module.' });
        }, 600);
    }
}

// 全局导航与主页保持一致
function navigateToHome() {
    window.location.href = 'home.html';
}

function navigateToLibrary() {
    window.location.href = 'library.html';
}

document.addEventListener('DOMContentLoaded', () => {
    new FundsPage();
});


