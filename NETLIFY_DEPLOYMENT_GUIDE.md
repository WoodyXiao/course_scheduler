# 🚀 Netlify + Gemini AI 部署完整指南

## 📋 概述

你的项目现在支持 **AI 增强的前置课程解析**，使用：
- **前端**: React (已部署在 Netlify)
- **后端**: Netlify Functions (Serverless)
- **AI**: Google Gemini API (免费)

---

## 🎯 部署步骤

### 步骤 1: 获取 Gemini API Key (免费)

1. 访问: https://aistudio.google.com/app/apikey
2. 使用 Google 账号登录
3. 点击 **"Create API Key"**
4. 复制生成的 API key (类似: `AIzaSy...`)

**重要**: 这是完全免费的，无需信用卡！

---

### 步骤 2: 更新 package.json

确保你的 `package.json` 包含 Gemini SDK:

```bash
cd /Users/woodyxiao/Documents/Project/course_scheduler
npm install @google/generative-ai
```

---

### 步骤 3: 配置 Netlify 环境变量

#### 方法 A: 通过 Netlify Dashboard (推荐)

1. 登录 Netlify: https://app.netlify.com
2. 选择你的站点
3. 进入 **Site settings** → **Environment variables**
4. 点击 **Add a variable**
5. 添加:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: 你的 Gemini API key
   - **Scopes**: 选择 "All scopes" 或至少勾选 "Functions"
6. 点击 **Create variable**

#### 方法 B: 通过 Netlify CLI

```bash
# 安装 Netlify CLI (如果还没安装)
npm install -g netlify-cli

# 登录
netlify login

# 设置环境变量
netlify env:set GEMINI_API_KEY "your_api_key_here"
```

---

### 步骤 4: 提交并推送代码

```bash
cd /Users/woodyxiao/Documents/Project/course_scheduler

# 添加所有新文件
git add .

# 提交
git commit -m "feat: Add AI-enhanced prerequisite parsing with Gemini"

# 推送到 GitHub
git push origin main
```

---

### 步骤 5: Netlify 自动部署

Netlify 会自动检测到你的推送并开始构建：

1. 构建命令: `npm run build`
2. 发布目录: `build`
3. Functions 目录: `netlify/functions`

**等待 2-3 分钟**，部署完成后你会收到通知。

---

### 步骤 6: 测试部署

#### 测试 1: 访问你的站点

```
https://your-site-name.netlify.app
```

#### 测试 2: 搜索复杂课程

尝试搜索这些课程，它们应该使用 AI 解析：

- **BUS 217W** (复杂的 OR 逻辑 + 单位要求)
- **ENGL 272** (逗号分隔的 OR 列表)
- **CHEM 110** (Corequisite)
- **PSYC 210** (条件性前置)

#### 测试 3: 查看 "Additional Notes"

如果课程使用了 AI 解析，你应该看到:
```
🤖 Parsed with AI (Gemini) for better accuracy
```

---

## 🔧 本地开发 (可选)

### 1. 创建 `.env.local`

```bash
cd /Users/woodyxiao/Documents/Project/course_scheduler
nano .env.local
```

添加:
```
GEMINI_API_KEY=your_api_key_here
```

### 2. 安装 Netlify CLI

```bash
npm install -D netlify-cli
```

### 3. 本地运行 Netlify Functions

```bash
# 启动 Netlify Dev (会同时运行 React + Functions)
netlify dev
```

这会在 `http://localhost:8888` 启动你的应用，并且 Functions 会在 `http://localhost:8888/.netlify/functions/parse-prerequisite` 可用。

### 4. 测试本地 Function

```bash
curl -X POST http://localhost:8888/.netlify/functions/parse-prerequisite \
  -H "Content-Type: application/json" \
  -d '{
    "prerequisiteText": "CMPT 225 and MATH 232",
    "courseCode": "CMPT 354"
  }'
```

应该返回:
```json
{
  "success": true,
  "tree": {...},
  "source": "gemini",
  "confidence": 0.9
}
```

---

## 🎛️ 配置选项

### 启用/禁用 AI 解析

在 `src/pages/CourseTreeview.jsx` 第 10 行:

```javascript
const ENABLE_AI_FALLBACK = true;  // 启用 AI
// const ENABLE_AI_FALLBACK = false;  // 禁用 AI (仅使用本地解析)
```

### 调整复杂度阈值

在 `src/utils/aiParser.js` 的 `isComplexPrerequisite` 函数中调整:

```javascript
export function isComplexPrerequisite(text) {
  // 调整这些条件来控制何时使用 AI
  const complexityIndicators = [
    text.length > 150,  // 改为 100 让更多课程使用 AI
    (text.match(/;/g) || []).length > 2,
    // ...
  ];
  
  // 改为 1 让更宽松地使用 AI
  return complexityIndicators.filter(Boolean).length >= 2;
}
```

---

## 📊 监控和日志

### 查看 Netlify Functions 日志

1. Netlify Dashboard → **Functions**
2. 点击 **parse-prerequisite**
3. 查看 **Function log**

你会看到:
```
🔍 Parsing prerequisite for: BUS 217W
📝 Text: BUS 201 with a minimum grade of C- and 15 units...
🤖 Gemini response: {"name":"OR","condition":"OR"...
✅ Successfully parsed: BUS 217W
```

### 浏览器控制台

打开浏览器 DevTools (F12) → Console

你会看到:
```
🤖 [AI] Complex prerequisite detected for BUS 217W, using AI...
✅ [AI] Successfully parsed BUS 217W with AI
```

或者:
```
💻 [Local] Using local parser for CMPT 225
```

---

## 💰 成本分析

### Netlify 免费额度

- ✅ **Bandwidth**: 100 GB/月
- ✅ **Build minutes**: 300 分钟/月
- ✅ **Functions**: 125,000 次调用/月
- ✅ **Function runtime**: 100 小时/月

### Gemini 免费额度

- ✅ **Requests**: 15 次/分钟
- ✅ **Daily**: 1,500 次/天
- ✅ **Cost**: **$0 (永久免费)**

### 预估使用量

假设 1000 个活跃用户/月:
- 每用户平均搜索 10 门课程
- 其中 30% 使用 AI (复杂课程)
- **总 AI 调用**: 1000 × 10 × 0.3 = 3,000 次/月

**成本**: **$0** ✅ (远低于免费额度)

---

## 🐛 故障排除

### 问题 1: "AI parsing unavailable"

**原因**: Gemini API key 未设置

**解决**:
1. 检查 Netlify 环境变量是否正确设置
2. 重新部署站点
3. 清除浏览器缓存

### 问题 2: Functions 404 错误

**原因**: Netlify 未检测到 Functions 目录

**解决**:
1. 确保 `netlify.toml` 存在且正确
2. 确保 `netlify/functions/` 目录存在
3. 重新部署

### 问题 3: "GEMINI_API_KEY not configured"

**原因**: Environment variable 未传递给 Function

**解决**:
1. 在 Netlify Dashboard 中检查环境变量的 **Scopes**
2. 确保勾选了 "Functions"
3. 触发新的部署

### 问题 4: 本地测试时 CORS 错误

**原因**: 直接访问 `localhost:3000` 而不是 `localhost:8888`

**解决**:
使用 `netlify dev` 而不是 `npm start`:
```bash
netlify dev  # 正确 ✅
# npm start   # 会有 CORS 问题 ❌
```

---

## 📈 性能优化

### 1. 缓存 AI 结果 (未来)

可以添加一个数据库来缓存 AI 解析结果:

```javascript
// 伪代码
if (cachedResult = checkCache(prerequisiteText)) {
  return cachedResult;
} else {
  result = await parseWithGemini(prerequisiteText);
  saveToCache(prerequisiteText, result);
  return result;
}
```

推荐使用:
- Netlify Blobs (免费)
- Supabase (免费额度)

### 2. 批量预处理 (未来)

可以创建一个脚本预处理所有课程:

```bash
node scripts/preprocess-all-courses.js
```

将结果存入 JSON 文件，完全避免运行时 AI 调用。

---

## ✅ 部署检查清单

- [ ] 获取 Gemini API key
- [ ] 在 Netlify 添加 `GEMINI_API_KEY` 环境变量
- [ ] 确保 `package.json` 包含 `@google/generative-ai`
- [ ] 确保 `netlify.toml` 存在
- [ ] 确保 `netlify/functions/parse-prerequisite.js` 存在
- [ ] Git commit 并 push 到 GitHub
- [ ] 等待 Netlify 自动部署
- [ ] 测试复杂课程 (BUS 217W, ENGL 272)
- [ ] 检查 "Additional Notes" 是否显示 "🤖 Parsed with AI"
- [ ] 查看 Netlify Functions 日志确认正常工作

---

## 🎉 完成！

你的应用现在支持 AI 增强的前置课程解析了！

**智能路由**:
- 简单课程 (CMPT 225) → 本地解析 (快速)
- 复杂课程 (BUS 217W) → AI 解析 (准确)

**完全免费**:
- Netlify Functions: ✅ 免费
- Gemini API: ✅ 免费
- 总成本: **$0/月** 🎉

---

## 📚 相关文档

- [ENV_SETUP.md](./ENV_SETUP.md) - 环境变量设置详解
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)

---

**有问题？** 检查 Netlify Functions 日志和浏览器控制台！

