# UniApp Admin 考试答题系统

## 项目简介

这是一个基于 UniApp 和 uniCloud 开发的考试答题系统，支持在线考试、成绩管理、题目管理等功能。系统采用前后端分离架构，前端使用 Vue.js，后端使用 uniCloud 云服务。

## 主要功能

- 📝 **在线考试**: 支持多种题型，包括单选题、多选题、判断题等
- 📊 **成绩管理**: 自动评分、成绩统计、成绩分析
- 🗂️ **题目管理**: 题目录入、题目分类、题目审核
- 📅 **考试安排**: 考试时间安排、考试状态管理
- 👥 **用户管理**: 考生信息管理、权限控制

## 技术栈

- **前端**: UniApp + Vue.js + Billkes UI 组件库
- **后端**: uniCloud 云函数 + 云数据库
- **数据库**: uniCloud 云数据库 (NoSQL)
- **开发工具**: HBuilderX

## 项目结构

```
├── .dakou/                 # 项目文档目录
│   ├── BillkesUI.md       # UI组件库说明
│   ├── ChangeLog.md       # 项目变更日志
│   ├── Dom.md             # uniCloud相关文档
│   ├── PrimaryMission.md  # 主要任务说明
│   └── ProjectReadme.md   # 项目说明文档
├── components/            # 自定义组件
├── pages/                 # 页面文件
├── store/                 # 状态管理
├── uniCloud-aliyun/       # uniCloud云服务配置
└── uni_modules/           # uni-app模块
```

## 开发指南

### 环境要求

- HBuilderX 3.0+
- uniCloud 账号
- Node.js 14+

### 快速开始

1. 克隆项目到本地
2. 使用 HBuilderX 打开项目
3. 配置 uniCloud 服务空间
4. 运行项目到浏览器或手机模拟器

### 数据库Schema

项目使用 uniCloud 的 DB Schema 功能来定义数据结构，支持 schema2code 自动生成管理页面。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

MIT License
