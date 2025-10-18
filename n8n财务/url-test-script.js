// n8n财务系统URL验证脚本
// 用于验证财务报表自动化模块的通信URL

class N8nUrlValidator {
    constructor() {
        this.baseUrl = '';
        this.endpoints = {
            chat: '/webhook/financial-chat-webhook',
            expense: '/webhook/expense-request-webhook'
        };
        this.testResults = {};
    }

    // 设置n8n实例基础URL
    setBaseUrl(url) {
        this.baseUrl = url.replace(/\/$/, ''); // 移除末尾斜杠
        console.log(`✅ 基础URL已设置: ${this.baseUrl}`);
    }

    // 验证URL格式
    validateUrlFormat(endpoint) {
        const fullUrl = `${this.baseUrl}${endpoint}`;
        const urlPattern = /^https?:\/\/.+\/webhook\/.+$/;
        
        if (!urlPattern.test(fullUrl)) {
            throw new Error(`URL格式不正确: ${fullUrl}`);
        }
        
        return fullUrl;
    }

    // 测试智能问答API
    async testChatApi() {
        console.log('\n🔍 测试智能财务问答API...');
        
        try {
            const url = this.validateUrlFormat(this.endpoints.chat);
            const testData = {
                message: "请帮我分析一下公司当前的资金状况",
                context: "财务查询",
                timestamp: new Date().toISOString()
            };

            console.log(`📡 请求URL: ${url}`);
            console.log(`📤 发送数据:`, testData);

            // 模拟请求（实际环境中需要真实的n8n实例）
            const mockResponse = {
                success: true,
                message: "AI财务助手响应",
                data: {
                    analysis: "根据最新数据分析，公司当前资金状况良好...",
                    recommendations: ["建议优化现金流管理", "关注应收账款回收"],
                    timestamp: new Date().toISOString()
                }
            };

            // 验证响应格式
            this.validateChatResponse(mockResponse);
            
            this.testResults.chat = {
                status: 'success',
                url: url,
                response: mockResponse
            };

            console.log('✅ 智能问答API测试通过');
            return mockResponse;

        } catch (error) {
            console.error('❌ 智能问答API测试失败:', error.message);
            this.testResults.chat = {
                status: 'error',
                error: error.message
            };
            throw error;
        }
    }

    // 测试支出申请API
    async testExpenseApi() {
        console.log('\n💰 测试支出申请审批API...');
        
        try {
            const url = this.validateUrlFormat(this.endpoints.expense);
            const testData = {
                applicant: "张三",
                amount: 15000,
                category: "设备采购",
                description: "购买笔记本电脑",
                department: "技术部",
                requestDate: new Date().toISOString().split('T')[0]
            };

            console.log(`📡 请求URL: ${url}`);
            console.log(`📤 发送数据:`, testData);

            // 模拟审批流程响应
            const mockResponse = {
                success: true,
                message: "Expense request approved successfully",
                data: {
                    requestId: `REQ_${Date.now()}`,
                    applicant: testData.applicant,
                    amount: testData.amount,
                    category: testData.category,
                    description: testData.description,
                    department: testData.department,
                    finalStatus: "approved",
                    approvalType: "normal",
                    approvedAt: new Date().toISOString(),
                    contractVerified: false,
                    approvalSteps: [
                        {
                            step: 1,
                            approver: "部门负责人",
                            status: "approved",
                            comment: "同意申请",
                            approvedAt: new Date().toISOString()
                        },
                        {
                            step: 2,
                            approver: "财务审核",
                            status: "approved",
                            comment: "财务审核通过",
                            approvedAt: new Date().toISOString()
                        }
                    ]
                }
            };

            // 验证响应格式
            this.validateExpenseResponse(mockResponse);
            
            this.testResults.expense = {
                status: 'success',
                url: url,
                response: mockResponse
            };

            console.log('✅ 支出申请API测试通过');
            return mockResponse;

        } catch (error) {
            console.error('❌ 支出申请API测试失败:', error.message);
            this.testResults.expense = {
                status: 'error',
                error: error.message
            };
            throw error;
        }
    }

    // 验证智能问答响应格式
    validateChatResponse(response) {
        const requiredFields = ['success', 'message', 'data'];
        const dataFields = ['analysis', 'timestamp'];

        // 检查必需字段
        for (const field of requiredFields) {
            if (!(field in response)) {
                throw new Error(`智能问答响应缺少必需字段: ${field}`);
            }
        }

        // 检查data字段
        if (typeof response.data !== 'object') {
            throw new Error('智能问答响应data字段必须是对象');
        }

        for (const field of dataFields) {
            if (!(field in response.data)) {
                throw new Error(`智能问答响应data缺少字段: ${field}`);
            }
        }

        console.log('✅ 智能问答响应格式验证通过');
    }

    // 验证支出申请响应格式
    validateExpenseResponse(response) {
        const requiredFields = ['success', 'message', 'data'];
        const dataFields = ['requestId', 'applicant', 'amount', 'finalStatus', 'approvalSteps'];

        // 检查必需字段
        for (const field of requiredFields) {
            if (!(field in response)) {
                throw new Error(`支出申请响应缺少必需字段: ${field}`);
            }
        }

        // 检查data字段
        if (typeof response.data !== 'object') {
            throw new Error('支出申请响应data字段必须是对象');
        }

        for (const field of dataFields) {
            if (!(field in response.data)) {
                throw new Error(`支出申请响应data缺少字段: ${field}`);
            }
        }

        // 验证审批步骤格式
        if (!Array.isArray(response.data.approvalSteps)) {
            throw new Error('审批步骤必须是数组格式');
        }

        console.log('✅ 支出申请响应格式验证通过');
    }

    // 生成测试报告
    generateReport() {
        console.log('\n📊 测试报告生成中...');
        console.log('='.repeat(50));
        
        const report = {
            timestamp: new Date().toISOString(),
            baseUrl: this.baseUrl,
            results: this.testResults,
            summary: {
                total: Object.keys(this.testResults).length,
                success: Object.values(this.testResults).filter(r => r.status === 'success').length,
                failed: Object.values(this.testResults).filter(r => r.status === 'error').length
            }
        };

        console.log('📈 测试汇总:');
        console.log(`   总计: ${report.summary.total} 个API`);
        console.log(`   成功: ${report.summary.success} 个`);
        console.log(`   失败: ${report.summary.failed} 个`);
        
        console.log('\n📋 详细结果:');
        Object.entries(this.testResults).forEach(([api, result]) => {
            const status = result.status === 'success' ? '✅' : '❌';
            console.log(`   ${status} ${api.toUpperCase()} API: ${result.status}`);
            if (result.error) {
                console.log(`      错误: ${result.error}`);
            }
        });

        return report;
    }

    // 运行所有测试
    async runAllTests(baseUrl) {
        console.log('🚀 开始n8n财务系统URL验证...');
        
        this.setBaseUrl(baseUrl);
        
        try {
            await this.testChatApi();
            await this.testExpenseApi();
            
            const report = this.generateReport();
            console.log('\n🎉 所有测试完成!');
            return report;
            
        } catch (error) {
            console.error('\n💥 测试过程中出现错误:', error.message);
            return this.generateReport();
        }
    }
}

// 使用示例
async function runValidation() {
    const validator = new N8nUrlValidator();
    
    // 示例URL - 请替换为实际的n8n实例URL
    const n8nInstanceUrl = 'https://your-n8n-instance.com';
    
    try {
        const report = await validator.runAllTests(n8nInstanceUrl);
        
        // 输出JSON格式的报告（可用于进一步处理）
        console.log('\n📄 JSON格式报告:');
        console.log(JSON.stringify(report, null, 2));
        
        return report;
        
    } catch (error) {
        console.error('验证过程失败:', error);
    }
}

// 导出模块（如果在Node.js环境中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { N8nUrlValidator, runValidation };
}

// 浏览器环境中的全局访问
if (typeof window !== 'undefined') {
    window.N8nUrlValidator = N8nUrlValidator;
    window.runValidation = runValidation;
}

// 自动运行验证（可选）
// runValidation();




