// n8n Intelligent Finance - Login page interactions

class LoginPage {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeAnimations();
    }

    // Bind event listeners
    bindEvents() {
        // Sign-in buttons
        document.getElementById('googleLogin').addEventListener('click', () => {
            this.handleGoogleLogin();
        });

        document.getElementById('emailLogin').addEventListener('click', () => {
            this.handleEmailLogin();
        });

        document.getElementById('founderRegistration').addEventListener('click', () => {
            this.handleFounderRegistration();
        });

        // Continue with phone button
        document.getElementById('continueWithPhone').addEventListener('click', () => {
            this.handleContinueWithPhone();
        });

        // Phone input events
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.handlePhoneInput(e);
            });
            
            phoneInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleContinueWithPhone();
                }
            });
        }
    }

    // Handle Google sign-in
    handleGoogleLogin() {
        this.showNotification('Redirecting to Google sign-in...', 'info');
        
        // Simulate Google OAuth flow
        setTimeout(() => {
            this.showNotification('Google sign-in is under development. Please use another method.', 'warning');
        }, 1000);
    }

    // Handle email sign-in
    handleEmailLogin() {
        this.showNotification('Email sign-in is under development...', 'info');
    }

    // Handle Founder registration
    handleFounderRegistration() {
        this.showNotification('Founder registration is under development...', 'info');
    }

    // Handle phone input
    handlePhoneInput(e) {
        // Allow digits only
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        // Limit to 11 digits
        if (e.target.value.length > 11) {
            e.target.value = e.target.value.slice(0, 11);
        }
    }

    // Handle Continue with phone
    handleContinueWithPhone() {
        this.showNotification('Redirecting to Home...', 'info');
        
        // 直接跳转到主页面
        setTimeout(() => {
            this.redirectToHome();
        }, 500);
    }

    // Validate phone format (not used currently)
    isValidPhoneNumber(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }




    // 跳转到主页
    redirectToHome() {
        window.location.href = 'home.html';
    }

    // 初始化动画
    initializeAnimations() {
        // 为登录按钮添加悬停效果
        const loginButtons = document.querySelectorAll('.login-btn');
        loginButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0) scale(1)';
            });
        });

        // 为图片添加悬停效果
        const images = document.querySelectorAll('.channels-img, .advertisement-img');
        images.forEach(img => {
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.02)';
            });
            
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 移除现有通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '300px',
            wordWrap: 'break-word'
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
        }, 4000);
    }

    // 获取通知颜色
    getNotificationColor(type) {
        const colors = {
            info: '#3B82F6',
            success: '#22C55E',
            warning: '#F59E0B',
            error: '#EF4444'
        };
        return colors[type] || colors.info;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.loginPage = new LoginPage();
});

// 添加通知样式
const notificationStyles = `
<style>
.notification {
    font-family: var(--font-family);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(10px);
}

.notification-success {
    background: linear-gradient(135deg, var(--success-500), var(--success-600));
}

.notification-error {
    background: linear-gradient(135deg, var(--error-500), var(--error-600));
}

.notification-warning {
    background: linear-gradient(135deg, var(--warning-500), var(--warning-600));
}

.notification-info {
    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);
