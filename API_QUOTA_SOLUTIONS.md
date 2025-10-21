# Gemini API 配额限制解决方案

## 🚨 问题概述

### 当前错误
```
429 - Quota Exceeded
You exceeded your current quota, please check your plan and billing details.
```

### 原因
- **免费层限制**：Gemini API 免费层有每日和每分钟请求限制
- **用完配额**：所有免费层配额已达到上限
- **需要等待**：需要等待约 21 秒才能重试

---

## ✅ 已实施的解决方案

### 1. 智能降级机制

**功能**：
- 当 AI API 失败时，自动回退到本地解析器
- 区分配额错误和其他错误类型
- 提供清晰的用户反馈

**实现**：
```javascript
catch (error) {
  console.error(`❌ [AI] Error:`, error);
  // Check if it's a quota error
  if (error.message && error.message.includes('429')) {
    extraInfoRef.current.push('⚠️ AI quota exceeded, using local parser (will retry after cooldown)');
  } else {
    extraInfoRef.current.push('⚠️ AI parsing error, using local parser');
  }
}

// Fallback to local parsing
console.log(`💻 [Local] Using local parser for ${courseFullName} (non-recursive)`);
if (courseFullName) {
  extraInfoRef.current.push(`💻 ${courseFullName} parsed with local parser`);
}
return parsePrerequisitesNonRecursive(prerequisites, allCourses, courseFullName);
```

**用户体验**：
- ✅ 系统不会崩溃
- ✅ 继续使用本地解析器
- ✅ 显示清晰的状态信息
- ✅ 告知用户何时可以重试

---

## 🛠️ 短期解决方案

### 方案 A：等待配额恢复（免费）

**适用场景**：测试和轻度使用

**步骤**：
1. **等待时间重置**：
   - 每分钟限制：等待 1 分钟
   - 每日限制：等待到第二天（UTC 时间）

2. **减少使用频率**：
   - 使用缓存（已实现）
   - 避免频繁搜索新课程
   - 清除缓存前仔细考虑

3. **最佳实践**：
   ```
   - 搜索课程 → 使用 AI（如果可用）
   - 展开节点 → 使用 AI（如果可用）
   - 重复搜索 → 使用缓存 ✅
   - 配额用完 → 使用本地解析器 ✅
   ```

---

### 方案 B：升级到付费计划（推荐用于生产）

**Gemini API 付费计划**：

| 计划 | 价格 | 每分钟请求 | 每日请求 | 适用场景 |
|------|------|-----------|---------|----------|
| **Free** | $0 | 15 | 1,500 | 测试 |
| **Pay-as-you-go** | ~$0.001/请求 | 无限 | 无限 | 生产环境 |

**链接**：https://ai.google.dev/pricing

**优点**：
- ✅ 无请求限制
- ✅ 更快的响应速度
- ✅ 更高的可靠性
- ✅ 支持商业使用

---

### 方案 C：使用替代 AI 服务

**1. OpenAI GPT-3.5/4**
- **价格**：$0.002/1K tokens (GPT-3.5)
- **优点**：稳定，文档完善
- **缺点**：需要信用卡

**2. Anthropic Claude**
- **价格**：$0.008/1K tokens
- **优点**：长上下文，高质量
- **缺点**：需要付费

**3. Ollama（本地）**
- **价格**：免费
- **优点**：完全免费，无配额限制
- **缺点**：需要本地运行，性能依赖硬件

---

## 🔧 长期优化建议

### 1. 实现请求队列和限流

**目的**：避免触发速率限制

```javascript
// 示例：简单的请求队列
class AIRequestQueue {
  constructor(maxRequestsPerMinute = 10) {
    this.queue = [];
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.requestTimestamps = [];
  }

  async enqueue(requestFn) {
    // 检查最近一分钟的请求数
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      t => now - t < 60000
    );

    // 如果超过限制，等待
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = 60000 - (now - oldestTimestamp);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // 执行请求
    this.requestTimestamps.push(Date.now());
    return await requestFn();
  }
}
```

---

### 2. 增强缓存策略

**当前实现**：
- ✅ 会话级缓存（浏览器刷新后清除）

**建议增强**：
```javascript
// LocalStorage 持久化缓存
const persistentCache = {
  set: (key, value) => {
    try {
      const item = {
        value: value,
        timestamp: Date.now(),
        expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      localStorage.setItem(`ai-cache-${key}`, JSON.stringify(item));
    } catch (e) {
      console.error('Cache storage failed:', e);
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(`ai-cache-${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      // Check if expired
      if (now - parsed.timestamp > parsed.expiresIn) {
        localStorage.removeItem(`ai-cache-${key}`);
        return null;
      }

      return parsed.value;
    } catch (e) {
      console.error('Cache retrieval failed:', e);
      return null;
    }
  },
};
```

---

### 3. 预处理常见课程

**策略**：
1. 收集最常搜索的课程（如 CMPT 120, CMPT 225 等）
2. 预先使用 AI 解析并存储结果
3. 直接从预处理的结果加载

**实现**：
```bash
# 创建预处理脚本
node scripts/preprocess-popular-courses.js

# 预处理结果存储为 JSON
src/assets/preprocessed_trees/
  - cmpt_120_tree.json
  - cmpt_225_tree.json
  - ...
```

---

### 4. 混合解析策略

**策略**：
- **简单前置**：使用本地解析器（如 "CMPT 120"）
- **复杂前置**：使用 AI（如 "CMPT 225 and (MATH 150 or MATH 151)"）

**实现**：
```javascript
function isComplexPrerequisite(prerequisites) {
  // 检查复杂度指标
  const complexityIndicators = [
    /\([^)]*\([^)]*\)/,  // Nested parentheses
    /\band\b.*\bor\b/i,  // Mixed AND/OR
    /grade|minimum|permission|corequisite/i,  // Special conditions
    /[,;].*[,;]/,        // Multiple comma-separated items
  ];

  const complexityScore = complexityIndicators.filter(
    indicator => indicator.test(prerequisites)
  ).length;

  // Only use AI for complexity score >= 2
  return complexityScore >= 2;
}
```

---

## 📊 配额使用优化

### 当前使用模式分析

**高消耗场景**：
1. 首次搜索热门课程（无缓存）
2. 展开多层前置课程树
3. 测试和开发阶段频繁刷新

**优化策略**：

| 场景 | 当前 | 优化后 |
|------|------|--------|
| 首次搜索 CMPT 354 | 1 AI 调用 | 1 AI 调用（无法避免） |
| 展开 CMPT 225 | 1 AI 调用 | **使用预处理或本地解析器** |
| 重复搜索 CMPT 354 | 0（缓存命中） | 0（缓存命中）✅ |
| 展开 10 个节点 | 10 AI 调用 | **2-3 AI 调用**（简单的用本地） |

---

## 🎯 实施优先级

### 立即实施（已完成）✅
1. ✅ 智能降级到本地解析器
2. ✅ 会话级缓存
3. ✅ 配额错误友好提示
4. ✅ 防止重复 API 调用

### 短期实施（1-2 周）
1. ⏳ LocalStorage 持久化缓存
2. ⏳ 请求队列和限流
3. ⏳ 复杂度评分系统

### 中期实施（1 个月）
1. ⏳ 预处理常见课程
2. ⏳ 升级到付费计划（如果需要）
3. ⏳ 添加配额监控仪表板

---

## 🧪 测试当前系统

### 测试配额耗尽场景

1. **触发配额限制**：
   ```
   - 快速搜索 15 个不同的课程
   - 等待几秒钟看到 429 错误
   ```

2. **验证降级机制**：
   ```
   - 检查控制台：应该看到 "⚠️ AI quota exceeded, using local parser"
   - 检查 TreeView：应该显示 "💻 parsed with local parser"
   - 验证功能：树应该仍然正常显示（使用本地解析器）
   ```

3. **验证缓存**：
   ```
   - 搜索 CMPT 225（AI 或本地解析器）
   - 点击 Clear 按钮
   - 再次搜索 CMPT 225
   - 应该显示 "💾 loaded from cache"
   ```

---

## 💡 开发环境最佳实践

### 1. 使用环境变量控制 AI

```javascript
// .env.local
REACT_APP_ENABLE_AI=false  # 开发时禁用 AI
REACT_APP_ENABLE_AI=true   # 生产时启用 AI
```

```javascript
// CourseTreeview.jsx
const ENABLE_AI = process.env.REACT_APP_ENABLE_AI === 'true';
```

### 2. 本地测试数据

创建预先解析的测试数据：
```javascript
// src/assets/test_data/
cmpt_225_tree.json
cmpt_354_tree.json
```

### 3. Mock AI 响应

```javascript
if (process.env.NODE_ENV === 'development') {
  // Use mock data instead of real API
  return mockAIResponse(prerequisites);
}
```

---

## 📞 获取帮助

### Gemini API 支持
- **文档**：https://ai.google.dev/gemini-api/docs
- **配额信息**：https://ai.google.dev/gemini-api/docs/rate-limits
- **社区**：https://github.com/google/generative-ai-js/issues

### 项目支持
- 查看项目 README.md
- 检查 AI_INTEGRATION_SUMMARY.md
- 参考 SUPPORTED_DEPARTMENTS.md

---

## ✅ 总结

### 当前状态
- ✅ 系统有智能降级机制
- ✅ 配额耗尽时自动使用本地解析器
- ✅ 缓存系统减少 API 调用
- ✅ 防止重复 API 调用

### 用户操作建议
1. **短期**：等待配额恢复（每日重置）
2. **中期**：使用缓存功能，避免重复搜索
3. **长期**：考虑升级到付费计划（生产环境）

### 开发者建议
1. 实施 LocalStorage 持久化缓存
2. 添加请求队列和限流
3. 预处理常见课程
4. 考虑混合解析策略

---

**最后更新**：2025-01-20  
**状态**：智能降级已实施 ✅  
**下一步**：实施持久化缓存和请求限流

