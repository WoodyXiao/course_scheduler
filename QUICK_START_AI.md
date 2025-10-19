# 🚀 AI 解析 - 5 分钟快速开始

## 📋 你需要做什么

### 1️⃣ 获取免费 API Key (2 分钟)

1. 打开: https://aistudio.google.com/app/apikey
2. Google 账号登录
3. 点 "Create API Key"
4. 复制生成的 key (类似 `AIzaSy...`)

### 2️⃣ 安装依赖 (1 分钟)

```bash
cd /Users/woodyxiao/Documents/Project/course_scheduler
npm install @google/generative-ai
```

### 3️⃣ 部署到 Netlify (2 分钟)

#### A. 提交代码

```bash
git add .
git commit -m "Add AI parsing"
git push
```

#### B. 添加环境变量

1. 打开: https://app.netlify.com
2. 选择你的站点
3. **Site settings** → **Environment variables**
4. 点 **Add a variable**:
   - Key: `GEMINI_API_KEY`
   - Value: 粘贴你的 API key
5. 点 **Create variable**

#### C. 等待部署

Netlify 会自动部署（2-3 分钟）

---

## ✅ 测试

### 访问你的站点

```
https://your-site.netlify.app
```

### 搜索这些课程测试:

| 课程 | 预期结果 |
|------|---------|
| **CMPT 225** | 💻 本地解析（快速） |
| **BUS 217W** | 🤖 AI 解析（准确） |
| **ENGL 272** | 🤖 AI 解析（准确） |

### 查看 "Additional Notes"

如果看到:
```
🤖 Parsed with AI (Gemini) for better accuracy
```

**恭喜！AI 解析成功！** 🎉

---

## 🔧 本地开发 (可选)

### 方法 1: 使用 Netlify Dev (推荐)

```bash
# 创建 .env.local
echo "GEMINI_API_KEY=你的_API_KEY" > .env.local

# 启动 (会同时运行 React + Functions)
npx netlify dev
```

访问: http://localhost:8888

### 方法 2: 普通开发

```bash
# 创建 .env.local
echo "GEMINI_API_KEY=你的_API_KEY" > .env.local

# 启动 React
npm start
```

**注意**: 这种方式 AI 功能不可用（仅本地解析），需要部署后才能用 AI。

---

## 💰 费用

**完全免费！**

- ✅ Netlify Functions: 免费 125,000 次/月
- ✅ Gemini API: 免费 1,500 次/天
- ✅ 总成本: **$0/月**

---

## 🎛️ 开关

### 禁用 AI (如果需要)

编辑 `src/pages/CourseTreeview.jsx` 第 10 行:

```javascript
const ENABLE_AI_FALLBACK = false;  // 禁用 AI，仅用本地解析
```

---

## 🐛 遇到问题？

### 问题 1: "AI parsing unavailable"

**解决**: 
1. 检查 Netlify 环境变量是否正确
2. 确保 `GEMINI_API_KEY` 的 Scopes 包含 "Functions"
3. 重新部署

### 问题 2: 本地测试不工作

**解决**: 使用 `netlify dev` 而不是 `npm start`

### 问题 3: 查看详细日志

**本地**:
```bash
# 终端会显示详细日志
npx netlify dev
```

**生产**:
1. Netlify Dashboard → **Functions**
2. 点击 `parse-prerequisite`
3. 查看 **Function log**

---

## 📚 完整文档

- **ENV_SETUP.md** - 环境变量详细说明
- **NETLIFY_DEPLOYMENT_GUIDE.md** - 完整部署指南  
- **AI_INTEGRATION_SUMMARY.md** - 功能总结

---

## ✅ 检查清单

- [ ] 获取 Gemini API key
- [ ] `npm install @google/generative-ai`
- [ ] `git push` 代码
- [ ] 在 Netlify 添加 `GEMINI_API_KEY`
- [ ] 等待部署完成
- [ ] 测试 BUS 217W (应该用 AI)
- [ ] 查看是否显示 "🤖 Parsed with AI"

**全部勾选？恭喜完成！🎉**

---

## 🎯 工作原理

```
用户搜索课程
    ↓
简单课程? → 本地解析 (快速 <50ms)
    ↓
复杂课程? → AI 解析 (准确 1-2s)
    ↓
AI 失败? → 自动降级到本地解析
    ↓
用户总能看到结果！
```

---

**就这么简单！现在开始使用 AI 增强的课程解析吧！** 🚀

