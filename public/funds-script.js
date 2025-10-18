// 资金页面交互脚本（与主页风格一致，最小依赖即可运行）

class FundsPage {
    constructor() {
        this.chatMessages = [];
        this.pdfApiUrl = 'https://api.pdfshift.io/v3/convert/pdf';
        this.pdfApiKey = 'sk_dbb8333c3c9e3a9e1c8b15f5abd6792d7adbb659'; // 从n8n workflow获取
        this.currentReportData = null;
        // 支出申请相关配置
        this.expenseWebhookUrl = 'https://lynn-cafa-system.app.n8n.cloud/webhook/expense-request-webhook';
        this.expenseRequests = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeSidebar();
        this.initializeReportGenerator();
        this.setDefaultDates();
        this.initializeExpenseModule();
        this.loadExpenseRequests();
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

        // 支出申请相关事件
        this.bindExpenseEvents();
    }

    // 绑定支出申请相关事件
    bindExpenseEvents() {
        // 新建申请按钮
        const newRequestBtn = document.getElementById('newExpenseRequestBtn');
        if (newRequestBtn) {
            newRequestBtn.addEventListener('click', () => this.showExpenseRequestModal());
        }

        // 模态框关闭按钮
        const closeExpenseModal = document.getElementById('closeExpenseModal');
        const cancelExpenseRequest = document.getElementById('cancelExpenseRequest');
        if (closeExpenseModal) {
            closeExpenseModal.addEventListener('click', () => this.hideExpenseRequestModal());
        }
        if (cancelExpenseRequest) {
            cancelExpenseRequest.addEventListener('click', () => this.hideExpenseRequestModal());
        }

        // 申请详情模态框关闭
        const closeDetailModal = document.getElementById('closeDetailModal');
        const closeDetailBtn = document.getElementById('closeDetailBtn');
        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => this.hideExpenseDetailModal());
        }
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', () => this.hideExpenseDetailModal());
        }

        // 表单提交
        const expenseForm = document.getElementById('expenseRequestForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitExpenseRequest();
            });
        }

        // 金额输入监听（大额预警）
        const amountInput = document.getElementById('expenseAmount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.checkAmountWarning());
        }

        // 模态框背景点击关闭
        const expenseModal = document.getElementById('expenseRequestModal');
        const detailModal = document.getElementById('expenseDetailModal');
        if (expenseModal) {
            expenseModal.addEventListener('click', (e) => {
                if (e.target === expenseModal) this.hideExpenseRequestModal();
            });
        }
        if (detailModal) {
            detailModal.addEventListener('click', (e) => {
                if (e.target === detailModal) this.hideExpenseDetailModal();
            });
        }
    }

    // 初始化财务报表生成器
    initializeReportGenerator() {
        // 绑定报表生成器相关事件
        const generateBtn = document.getElementById('generateReportBtn');
        const previewBtn = document.getElementById('previewBtn');
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        const shareBtn = document.getElementById('shareReportBtn');
        const reportTypeSelect = document.getElementById('reportType');
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateReport());
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewReport());
        }

        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => this.downloadReportAsPdf());
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.showShareModal());
        }

        // 监听报表类型和日期变化
        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', () => this.updateReportPreview());
        }

        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => this.updateReportPreview());
            endDateInput.addEventListener('change', () => this.updateReportPreview());
        }

        // 绑定分享模态框事件
        this.bindShareModalEvents();
    }

    // 设置默认日期
    setDefaultDates() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');

        if (startDateInput) {
            startDateInput.value = this.formatDate(firstDayOfMonth);
        }

        if (endDateInput) {
            endDateInput.value = this.formatDate(lastDayOfMonth);
        }
    }

    // 格式化日期为YYYY-MM-DD
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // 生成财务报表
    async generateReport() {
        this.showGenerationStatus(true);
        this.updateProgress(0);

        try {
            // 获取报表参数
            const reportType = document.getElementById('reportType').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            this.updateProgress(20);
            this.updateStatusText('Collecting financial data...');

            // 模拟数据收集
            await this.delay(1000);
            const financialData = await this.collectFinancialData(reportType, startDate, endDate);

            this.updateProgress(50);
            this.updateStatusText('Generating report content...');

            // 生成报表内容
            await this.delay(1000);
            this.currentReportData = this.generateReportContent(financialData, reportType, startDate, endDate);

            this.updateProgress(80);
            this.updateStatusText('Finalizing report...');

            // 更新预览
            await this.delay(500);
            this.displayReportPreview(this.currentReportData);

            this.updateProgress(100);
            this.updateStatusText('Report generated successfully!');

            // 隐藏状态指示器
            setTimeout(() => {
                this.showGenerationStatus(false);
                this.showNotification('Financial report generated successfully!', 'success');
            }, 1000);

        } catch (error) {
            console.error('Report generation error:', error);
            this.updateStatusText('Error generating report');
            this.showNotification('Failed to generate report. Please try again.', 'error');
            setTimeout(() => this.showGenerationStatus(false), 2000);
        }
    }

    // 收集财务数据
    async collectFinancialData(reportType, startDate, endDate) {
        // 模拟从不同数据源收集财务数据
        const mockData = {
            totalIncome: 2850000,
            totalExpenses: 1980000,
            netProfit: 870000,
            transactions: [
                { date: startDate, type: 'income', amount: 150000, description: 'Product Sales' },
                { date: startDate, type: 'expense', amount: 85000, description: 'Operating Costs' },
                { date: endDate, type: 'income', amount: 200000, description: 'Service Revenue' },
                { date: endDate, type: 'expense', amount: 95000, description: 'Marketing Expenses' }
            ],
            categoryBreakdown: {
                'Product Sales': 1250000,
                'Service Revenue': 800000,
                'Investment Income': 300000,
                'Operating Costs': 980000,
                'Marketing Expenses': 450000,
                'Administrative Costs': 350000
            },
            monthlyTrend: [
                { month: 'Jan', income: 180000, expense: 120000 },
                { month: 'Feb', income: 220000, expense: 140000 },
                { month: 'Mar', income: 250000, expense: 160000 }
            ]
        };

        return mockData;
    }

    // 生成报表内容
    generateReportContent(data, reportType, startDate, endDate) {
        const reportDate = new Date().toLocaleDateString();
        const periodText = this.getPeriodText(reportType, startDate, endDate);

        return {
            title: `Financial ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
            period: periodText,
            generatedDate: reportDate,
            summary: {
                totalIncome: data.totalIncome,
                totalExpenses: data.totalExpenses,
                netProfit: data.netProfit,
                profitMargin: ((data.netProfit / data.totalIncome) * 100).toFixed(2)
            },
            transactions: data.transactions,
            categoryBreakdown: data.categoryBreakdown,
            monthlyTrend: data.monthlyTrend,
            insights: this.generateInsights(data)
        };
    }

    // 获取期间文本
    getPeriodText(reportType, startDate, endDate) {
        const start = new Date(startDate).toLocaleDateString();
        const end = new Date(endDate).toLocaleDateString();
        return `${start} - ${end}`;
    }

    // 生成财务洞察
    generateInsights(data) {
        const insights = [];
        
        if (data.netProfit > 0) {
            insights.push(`✅ Positive net profit of ¥${data.netProfit.toLocaleString()}`);
        } else {
            insights.push(`⚠️ Net loss of ¥${Math.abs(data.netProfit).toLocaleString()}`);
        }

        const profitMargin = (data.netProfit / data.totalIncome) * 100;
        if (profitMargin > 20) {
            insights.push(`📈 Excellent profit margin of ${profitMargin.toFixed(2)}%`);
        } else if (profitMargin > 10) {
            insights.push(`📊 Good profit margin of ${profitMargin.toFixed(2)}%`);
        } else {
            insights.push(`📉 Low profit margin of ${profitMargin.toFixed(2)}% - consider cost optimization`);
        }

        insights.push(`💰 Total revenue: ¥${data.totalIncome.toLocaleString()}`);
        insights.push(`💸 Total expenses: ¥${data.totalExpenses.toLocaleString()}`);

        return insights;
    }

    // 预览报表
    previewReport() {
        if (!this.currentReportData) {
            this.showNotification('Please generate a report first', 'warning');
            return;
        }

        this.displayReportPreview(this.currentReportData);
        this.showNotification('Report preview updated', 'success');
    }

    // 显示报表预览
    displayReportPreview(reportData) {
        const previewContent = document.getElementById('reportPreview');
        if (!previewContent) return;

        const html = `
            <div class="report-preview-content">
                <h4>${reportData.title}</h4>
                <p><strong>Period:</strong> ${reportData.period}</p>
                <p><strong>Generated:</strong> ${reportData.generatedDate}</p>
                
                <div class="financial-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total Income</span>
                        <span class="summary-value">¥${reportData.summary.totalIncome.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Expenses</span>
                        <span class="summary-value">¥${reportData.summary.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Net Profit</span>
                        <span class="summary-value">¥${reportData.summary.netProfit.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Profit Margin</span>
                        <span class="summary-value">${reportData.summary.profitMargin}%</span>
                    </div>
                </div>

                <div class="insights-section">
                    <h5>Key Insights:</h5>
                    <ul>
                        ${reportData.insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        previewContent.innerHTML = html;
    }

    // 更新报表预览（当参数变化时）
    updateReportPreview() {
        // 当用户更改报表类型或日期时，清空预览并提示重新生成
        const previewContent = document.getElementById('reportPreview');
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-file-alt"></i>
                    <p>Parameters changed. Click "Generate Report" to update preview</p>
                </div>
            `;
        }
        this.currentReportData = null;
    }

    // 下载PDF报表
    async downloadReportAsPdf() {
        if (!this.currentReportData) {
            this.showNotification('Please generate a report first', 'warning');
            return;
        }

        this.showGenerationStatus(true);
        this.updateStatusText('Converting to PDF...');
        this.updateProgress(0);

        try {
            // 生成完整的HTML内容
            const htmlContent = this.generateFullReportHtml(this.currentReportData);
            
            this.updateProgress(30);

            // 调用PDF转换API
            const pdfBlob = await this.convertHtmlToPdf(htmlContent);
            
            this.updateProgress(80);

            // 下载PDF文件
            this.downloadBlob(pdfBlob, `financial-report-${Date.now()}.pdf`);
            
            this.updateProgress(100);
            this.updateStatusText('PDF downloaded successfully!');

            setTimeout(() => {
                this.showGenerationStatus(false);
                this.showNotification('PDF report downloaded successfully!', 'success');
            }, 1000);

        } catch (error) {
            console.error('PDF conversion error:', error);
            this.updateStatusText('Error converting to PDF');
            this.showNotification('Failed to convert to PDF. Please try again.', 'error');
            setTimeout(() => this.showGenerationStatus(false), 2000);
        }
    }

    // 生成完整的HTML报表内容
    generateFullReportHtml(reportData) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${reportData.title}</title>
            <style>
                body { 
                    font-family: 'Inter', Arial, sans-serif; 
                    margin: 40px; 
                    color: #1F2937;
                    line-height: 1.6;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 40px; 
                    border-bottom: 2px solid #6B9FFF;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #6B9FFF;
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                }
                .summary { 
                    background: #F8FAFF; 
                    padding: 30px; 
                    border-radius: 12px; 
                    margin-bottom: 30px;
                    border: 1px solid #D9E4FF;
                }
                .summary h2 {
                    color: #374151;
                    margin-bottom: 20px;
                }
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                .summary-item { 
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #E5E7EB;
                }
                .summary-label {
                    font-size: 0.875rem;
                    color: #6B7280;
                    display: block;
                    margin-bottom: 8px;
                }
                .summary-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1F2937;
                }
                .positive { color: #22C55E; }
                .negative { color: #EF4444; }
                .insights {
                    margin-top: 30px;
                }
                .insights h3 {
                    color: #374151;
                    margin-bottom: 15px;
                }
                .insights ul {
                    list-style: none;
                    padding: 0;
                }
                .insights li {
                    background: white;
                    margin-bottom: 8px;
                    padding: 12px;
                    border-radius: 6px;
                    border-left: 4px solid #6B9FFF;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 0.875rem;
                    color: #6B7280;
                    border-top: 1px solid #E5E7EB;
                    padding-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${reportData.title}</h1>
                <p><strong>Period:</strong> ${reportData.period}</p>
                <p><strong>Generated:</strong> ${reportData.generatedDate}</p>
            </div>
            
            <div class="summary">
                <h2>Financial Summary</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Total Income</span>
                        <span class="summary-value positive">¥${reportData.summary.totalIncome.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Expenses</span>
                        <span class="summary-value negative">¥${reportData.summary.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Net Profit</span>
                        <span class="summary-value ${reportData.summary.netProfit >= 0 ? 'positive' : 'negative'}">¥${reportData.summary.netProfit.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Profit Margin</span>
                        <span class="summary-value">${reportData.summary.profitMargin}%</span>
                    </div>
                </div>
                
                <div class="insights">
                    <h3>Key Insights</h3>
                    <ul>
                        ${reportData.insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p>Generated by n8n Intelligent Finance System</p>
                <p>Report ID: RPT-${Date.now()}</p>
            </div>
        </body>
        </html>
        `;
    }

    // 调用PDF转换API
    async convertHtmlToPdf(htmlContent) {
        const response = await fetch(this.pdfApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.pdfApiKey
            },
            body: JSON.stringify({
                source: htmlContent,
                landscape: false,
                format: 'A4',
                margin: '20mm',
                printBackground: true
            })
        });

        if (!response.ok) {
            throw new Error(`PDF API Error: ${response.status} ${response.statusText}`);
        }

        return await response.blob();
    }

    // 下载Blob文件
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 绑定分享模态框事件
    bindShareModalEvents() {
        // 模态框关闭按钮
        const closeShareModal = document.getElementById('closeShareModal');
        const closeShareBtn = document.getElementById('closeShareBtn');
        
        if (closeShareModal) {
            closeShareModal.addEventListener('click', () => this.hideShareModal());
        }
        if (closeShareBtn) {
            closeShareBtn.addEventListener('click', () => this.hideShareModal());
        }

        // 模态框背景点击关闭
        const shareModal = document.getElementById('shareReportModal');
        if (shareModal) {
            shareModal.addEventListener('click', (e) => {
                if (e.target === shareModal) this.hideShareModal();
            });
        }

        // 分享选项按钮
        const copyLinkBtn = document.getElementById('copyLinkBtn');
        const emailBtn = document.getElementById('emailBtn');
        const downloadShareBtn = document.getElementById('downloadShareBtn');
        const qrCodeBtn = document.getElementById('qrCodeBtn');

        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => this.copyReportLink());
        }
        if (emailBtn) {
            emailBtn.addEventListener('click', () => this.shareViaEmail());
        }
        if (downloadShareBtn) {
            downloadShareBtn.addEventListener('click', () => this.downloadAndShare());
        }
        if (qrCodeBtn) {
            qrCodeBtn.addEventListener('click', () => this.generateQRCode());
        }
    }

    // 显示分享模态框
    showShareModal() {
        if (!this.currentReportData) {
            this.showNotification('Please generate a report first', 'warning');
            return;
        }

        const modal = document.getElementById('shareReportModal');
        if (modal) {
            modal.classList.add('active');
            // 隐藏QR码容器
            const qrContainer = document.getElementById('qrCodeContainer');
            if (qrContainer) {
                qrContainer.style.display = 'none';
            }
        }
    }

    // 隐藏分享模态框
    hideShareModal() {
        const modal = document.getElementById('shareReportModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // 复制报表链接
    copyReportLink() {
        const reportUrl = `${window.location.href}?report=${encodeURIComponent(JSON.stringify({
            type: this.currentReportData.type,
            period: this.currentReportData.period,
            timestamp: this.currentReportData.timestamp
        }))}`;

        navigator.clipboard.writeText(reportUrl).then(() => {
            this.showNotification('Report link copied to clipboard!', 'success');
            this.hideShareModal();
        }).catch(() => {
            this.showNotification('Failed to copy link', 'error');
        });
    }

    // 通过邮件分享
    shareViaEmail() {
        const subject = encodeURIComponent(this.currentReportData.title);
        const body = encodeURIComponent(`Please find the financial report for ${this.currentReportData.period}.\n\nView report: ${window.location.href}\n\nGenerated on: ${new Date().toLocaleDateString()}`);
        const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
        
        window.open(mailtoUrl);
        this.hideShareModal();
    }

    // 下载并分享
    downloadAndShare() {
        this.downloadReportAsPdf();
        this.hideShareModal();
    }

    // 生成二维码
    generateQRCode() {
        const qrContainer = document.getElementById('qrCodeContainer');
        const canvas = document.getElementById('qrCodeCanvas');
        
        if (!qrContainer || !canvas) return;

        // 显示二维码容器
        qrContainer.style.display = 'block';

        // 简单的二维码生成（这里使用一个简单的实现）
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        
        // 清空画布
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 200);
        
        // 绘制简单的二维码样式
        ctx.fillStyle = 'black';
        const size = 10;
        const url = window.location.href;
        
        // 生成简单的图案（实际项目中应使用专业的QR码库）
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if ((i + j + url.length) % 3 === 0) {
                    ctx.fillRect(i * size, j * size, size, size);
                }
            }
        }
        
        // 添加中心logo区域
        ctx.fillStyle = 'white';
        ctx.fillRect(75, 75, 50, 50);
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('n8n', 100, 95);
        ctx.fillText('Finance', 100, 110);

        this.showNotification('QR code generated! Scan to share report', 'success');
    }

    // 分享报表（保留原有功能作为备用）
    shareReport() {
        this.showShareModal();
    }

    // 显示/隐藏生成状态
    showGenerationStatus(show) {
        const statusElement = document.getElementById('generationStatus');
        if (statusElement) {
            statusElement.style.display = show ? 'block' : 'none';
        }
    }

    // 更新进度条
    updateProgress(percent) {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    }

    // 更新状态文本
    updateStatusText(text) {
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = text;
        }
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    // ===== 支出申请相关方法 =====

    // 初始化支出申请模块
    initializeExpenseModule() {
        // 设置当前日期
        const requestDateInput = document.getElementById('requestDate');
        if (requestDateInput) {
            requestDateInput.value = new Date().toISOString().split('T')[0];
        }

        // 初始化模拟数据
        this.expenseRequests = [
            {
                id: 'REQ_001',
                applicant: 'John Smith',
                amount: 3000,
                category: 'Office Supplies',
                description: 'Purchase office stationery',
                department: 'Administrative',
                status: 'pending',
                requestDate: '2024-01-15',
                createdAt: new Date().toISOString()
            },
            {
                id: 'REQ_002',
                applicant: 'Jane Doe',
                amount: 15000,
                category: 'Equipment Purchase',
                description: 'Purchase laptop computer',
                department: 'Technology',
                status: 'approved',
                requestDate: '2024-01-14',
                createdAt: new Date().toISOString()
            },
            {
                id: 'REQ_003',
                applicant: 'Mike Johnson',
                amount: 80000,
                category: 'Equipment Purchase',
                description: 'Purchase server equipment',
                department: 'Technology',
                status: 'pending',
                requestDate: '2024-01-13',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // 加载支出申请列表
    loadExpenseRequests() {
        this.updateExpenseStats();
        this.renderExpenseRequestsList();
    }

    // 更新统计数据
    updateExpenseStats() {
        const pendingCount = this.expenseRequests.filter(req => req.status === 'pending').length;
        const thisMonthTotal = this.expenseRequests.reduce((sum, req) => sum + req.amount, 0);
        const approvalRate = Math.round((this.expenseRequests.filter(req => req.status === 'approved').length / this.expenseRequests.length) * 100);

        // 更新页面显示
        const pendingCountEl = document.getElementById('pendingRequestsCount');
        const monthlyTotalEl = document.getElementById('monthlyTotalAmount');
        const approvalRateEl = document.getElementById('approvalRate');

        if (pendingCountEl) pendingCountEl.textContent = pendingCount;
        if (monthlyTotalEl) monthlyTotalEl.textContent = `¥${thisMonthTotal.toLocaleString()}`;
        if (approvalRateEl) approvalRateEl.textContent = `${approvalRate}%`;
    }

    // 渲染申请列表
    renderExpenseRequestsList() {
        const listContainer = document.getElementById('expenseRequestsList');
        if (!listContainer) return;

        const recentRequests = this.expenseRequests.slice(0, 3); // 只显示最近3个
        
        listContainer.innerHTML = recentRequests.map(request => `
            <div class="expense-request-item" onclick="fundsPageInstance.showExpenseDetail('${request.id}')">
                <div class="expense-request-info">
                    <div class="expense-request-title">${request.category} - ${request.applicant}</div>
                    <div class="expense-request-meta">${request.department} • ${request.requestDate}</div>
                </div>
                <div class="expense-request-amount">¥${request.amount.toLocaleString()}</div>
                <div class="expense-request-status ${request.status}">${request.status.toUpperCase()}</div>
            </div>
        `).join('');
    }

    // 显示支出申请模态框
    showExpenseRequestModal() {
        const modal = document.getElementById('expenseRequestModal');
        if (modal) {
            modal.classList.add('active');
            // 重置表单
            const form = document.getElementById('expenseRequestForm');
            if (form) form.reset();
            
            // 设置默认日期
            const requestDateInput = document.getElementById('requestDate');
            if (requestDateInput) {
                requestDateInput.value = new Date().toISOString().split('T')[0];
            }
            
            // 隐藏警告
            this.hideAmountWarning();
        }
    }

    // 隐藏支出申请模态框
    hideExpenseRequestModal() {
        const modal = document.getElementById('expenseRequestModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // 显示申请详情模态框
    showExpenseDetail(requestId) {
        const request = this.expenseRequests.find(req => req.id === requestId);
        if (!request) return;

        const modal = document.getElementById('expenseDetailModal');
        const content = document.getElementById('expenseDetailContent');
        
        if (modal && content) {
            content.innerHTML = this.generateExpenseDetailHTML(request);
            modal.classList.add('active');
        }
    }

    // 隐藏申请详情模态框
    hideExpenseDetailModal() {
        const modal = document.getElementById('expenseDetailModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // 生成申请详情HTML
    generateExpenseDetailHTML(request) {
        return `
            <div class="detail-section">
                <h4>Request Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Request ID</div>
                        <div class="detail-value">${request.id}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Applicant</div>
                        <div class="detail-value">${request.applicant}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Department</div>
                        <div class="detail-value">${request.department}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Amount</div>
                        <div class="detail-value">¥${request.amount.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Category</div>
                        <div class="detail-value">${request.category}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Request Date</div>
                        <div class="detail-value">${request.requestDate}</div>
                    </div>
                </div>
                <div class="detail-item" style="margin-top: 16px;">
                    <div class="detail-label">Description</div>
                    <div class="detail-value">${request.description}</div>
                </div>
            </div>

            <div class="detail-section">
                <h4>Approval Flow</h4>
                <div class="approval-flow">
                    ${this.generateApprovalFlowHTML(request)}
                </div>
            </div>
        `;
    }

    // 生成审批流程HTML
    generateApprovalFlowHTML(request) {
        const isLargeAmount = request.amount >= 50000;
        const steps = isLargeAmount ? 
            ['Department Head', 'Finance Review', 'CEO Approval'] :
            ['Department Head', 'Finance Review'];

        return steps.map((step, index) => {
            const status = request.status === 'approved' ? 'approved' : 
                         request.status === 'rejected' ? 'rejected' : 'pending';
            
            return `
                <div class="approval-step">
                    <div class="approval-step-icon ${status}">
                        ${status === 'approved' ? '✓' : status === 'rejected' ? '✗' : (index + 1)}
                    </div>
                    <div class="approval-step-info">
                        <div class="approval-step-title">${step}</div>
                        <div class="approval-step-meta">
                            ${status === 'approved' ? 'Approved' : 
                              status === 'rejected' ? 'Rejected' : 'Pending'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 检查金额预警
    checkAmountWarning() {
        const amountInput = document.getElementById('expenseAmount');
        const warningDiv = document.getElementById('amountWarning');
        
        if (amountInput && warningDiv) {
            const amount = parseFloat(amountInput.value) || 0;
            if (amount >= 50000) {
                warningDiv.style.display = 'block';
            } else {
                warningDiv.style.display = 'none';
            }
        }
    }

    // 隐藏金额预警
    hideAmountWarning() {
        const warningDiv = document.getElementById('amountWarning');
        if (warningDiv) {
            warningDiv.style.display = 'none';
        }
    }

    // 提交支出申请
    async submitExpenseRequest() {
        const form = document.getElementById('expenseRequestForm');
        if (!form) return;

        // 获取表单数据
        const formData = new FormData(form);
        const requestData = {
            applicant: formData.get('applicant'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            department: formData.get('department'),
            description: formData.get('description'),
            requestDate: formData.get('requestDate')
        };

        // 验证表单
        if (!this.validateExpenseForm(requestData)) {
            return;
        }

        try {
            // 显示加载状态
            const submitBtn = document.getElementById('submitExpenseRequest');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }

            // 发送到n8n webhook
            const response = await fetch(this.expenseWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                const result = await response.json();
                
                // 添加到本地列表
                const newRequest = {
                    id: result.data?.requestId || `REQ_${Date.now()}`,
                    ...requestData,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                this.expenseRequests.unshift(newRequest);
                
                // 更新UI
                this.loadExpenseRequests();
                this.hideExpenseRequestModal();
                
                // 显示成功消息
                this.showNotification('Expense request submitted successfully!', 'success');
                
                // 显示详情
                setTimeout(() => {
                    this.showExpenseDetail(newRequest.id);
                }, 500);
                
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

        } catch (error) {
            console.error('Error submitting expense request:', error);
            this.showNotification(`Failed to submit request: ${error.message}`, 'error');
        } finally {
            // 恢复按钮状态
            const submitBtn = document.getElementById('submitExpenseRequest');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
            }
        }
    }

    // 验证表单数据
    validateExpenseForm(data) {
        if (!data.applicant || data.applicant.trim() === '') {
            this.showNotification('Please enter applicant name', 'error');
            return false;
        }
        
        if (!data.department) {
            this.showNotification('Please select department', 'error');
            return false;
        }
        
        if (!data.amount || data.amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return false;
        }
        
        if (!data.category) {
            this.showNotification('Please select category', 'error');
            return false;
        }
        
        if (!data.description || data.description.trim() === '') {
            this.showNotification('Please enter description', 'error');
            return false;
        }
        
        if (!data.requestDate) {
            this.showNotification('Please select request date', 'error');
            return false;
        }
        
        return true;
    }
}

// 全局导航与主页保持一致
function navigateToHome() {
    window.location.href = 'home.html';
}

function navigateToLibrary() {
    window.location.href = 'library.html';
}

// 全局实例引用（用于HTML onclick调用）
let fundsPageInstance;

document.addEventListener('DOMContentLoaded', () => {
    fundsPageInstance = new FundsPage();
});


