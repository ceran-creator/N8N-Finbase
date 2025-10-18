# n8n财务系统URL验证工具

## 📋 概述

本工具用于验证n8n财务管理系统中「财务报表自动化」模块的通信URL可用性和返回内容标准。

## 🔍 发现的关键URL端点

根据workflow配置分析，发现以下重要的API端点：

### 1. 智能财务问答API
- **URL**: `/webhook/financial-chat-webhook`
- **方法**: POST
- **功能**: 基于Claude AI的财务智能问答
- **Webhook ID**: `financial-chat-webhook`

### 2. 支出申请审批API  
- **URL**: `/webhook/expense-request-webhook`
- **方法**: POST
- **功能**: 处理支出申请和自动化审批流程
- **Webhook ID**: `expense-request-webhook`

### 3. 财务报表生成
- **触发方式**: 定时触发器（每月9点）
- **功能**: 自动生成财务报表并上传到Google Drive
- **输出**: PDF格式财务报表

## 🛠️ 使用方法

### 方法1: 网页版测试工具

1. 打开 `n8n-url-validator.html` 文件
2. 在浏览器中直接运行
3. 配置您的n8n实例URL
4. 点击"一键测试所有URL"

### 方法2: JavaScript脚本测试

```javascript
// 在浏览器控制台或Node.js中运行
const validator = new N8nUrlValidator();
const report = await validator.runAllTests('https://your-n8n-instance.com');
```

## 📊 预期返回格式

### 智能问答API响应
```json
{
  "success": true,
  "message": "AI财务助手响应",
  "data": {
    "analysis": "财务分析内容...",
    "recommendations": ["建议1", "建议2"],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 支出申请API响应
```json
{
  "success": true,
  "message": "Expense request approved successfully",
  "data": {
    "requestId": "REQ_1234567890",
    "applicant": "申请人姓名",
    "amount": 15000,
    "finalStatus": "approved",
    "approvalType": "normal",
    "approvalSteps": [
      {
        "step": 1,
        "approver": "部门负责人",
        "status": "approved",
        "comment": "同意申请"
      }
    ]
  }
}
```

## ⚙️ 配置要求

### n8n实例配置
1. 确保n8n实例正在运行
2. workflow已激活并部署
3. 所有必需的凭据已配置：
   - OpenAI API密钥
   - Pinecone API密钥  
   - Google Drive OAuth2
   - Anthropic API密钥

### 网络要求
- n8n实例可通过HTTP/HTTPS访问
- 如果测试跨域请求，需要配置CORS策略

## 🔧 故障排除

### 常见问题

1. **连接失败**
   - 检查n8n实例是否运行
   - 验证URL格式是否正确
   - 确认网络连接正常

2. **CORS错误**
   - 在n8n中配置允许跨域请求
   - 或使用服务器端测试脚本

3. **认证失败**
   - 检查API密钥配置
   - 验证webhook是否设置为public

4. **响应格式错误**
   - 检查workflow节点配置
   - 验证返回数据结构

## 📈 测试覆盖范围

- ✅ URL格式验证
- ✅ 请求方法验证  
- ✅ 响应格式验证
- ✅ 必需字段检查
- ✅ 数据类型验证
- ✅ 错误处理测试

## 🚀 快速开始

1. **本地测试**:
   ```bash
   # 直接在浏览器中打开HTML文件
   open n8n-url-validator.html
   ```

2. **配置URL**:
   - 输入您的n8n实例URL
   - 格式: `https://your-n8n-instance.com`

3. **运行测试**:
   - 点击"一键测试所有URL"
   - 查看详细测试结果

## 📝 注意事项

- 测试工具包含模拟数据，用于验证响应格式
- 实际部署时需要真实的n8n实例URL
- 建议在测试环境中先验证，再部署到生产环境
- 定期检查API端点的可用性和响应时间

## 🔗 相关文件

- `n8n-url-validator.html` - 网页版测试工具
- `url-test-script.js` - JavaScript测试脚本
- `My workflow 16.json` - n8n workflow配置文件




