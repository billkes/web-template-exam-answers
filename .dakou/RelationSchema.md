# 数据库表关系图

## 表结构概览

### 1. exam-questions (题目表)
存储考试题目信息

**主要字段:**
- _id: 文档ID (系统自动生成)
- title: 题目标题
- type: 题目类型 (single-单选题, multiple-多选题)
- options: 选项 (数组)
- answer: 答案 (数组)
- analysis: 解析
- difficulty: 难度 (1-简单, 2-中等, 3-困难)
- created_date: 创建时间
- updated_date: 更新时间

### 2. exams (试卷表)
存储试卷信息

**主要字段:**
- _id: 文档ID (系统自动生成)
- title: 试卷标题
- description: 试卷描述
- questions: 题目列表 (关联 exam-questions 表)
- status: 状态 (0-草稿, 1-发布)
- created_date: 创建时间
- updated_date: 更新时间

### 3. exam-schedules (考试安排表)
存储考试安排信息

**主要字段:**
- _id: 文档ID (系统自动生成)
- exam_id: 试卷ID (关联 exams 表)
- title: 安排标题
- description: 安排描述
- start_time: 开始时间
- end_time: 结束时间
- allowed_users: 允许用户 (关联 exam-users 表)
- duration: 考试时长(分钟)
- simple_score: 简单题分数
- medium_score: 中等题分数
- difficult_score: 困难题分数
- total_score: 总分
- status: 状态 (0-未开始, 1-进行中, 2-已结束)
- created_date: 创建时间
- updated_date: 更新时间

### 4. exam-users (考生用户表)
存储考生用户信息

**主要字段:**
- _id: 文档ID (系统自动生成)
- username: 用户名
- email: 邮箱
- nickname: 昵称
- avatar: 头像
- status: 状态 (0-禁用, 1-启用)
- created_date: 创建时间
- updated_date: 更新时间

### 5. exam-records (考试记录表)
存储考试记录信息

**主要字段:**
- _id: 文档ID (系统自动生成)
- exam_schedules_id: 试卷安排ID (关联 exam-schedules 表)
- user_id: 用户ID (关联 exam-users 表)
- answers: 答题记录 (数组)
- total_full_mark: 总满分
- total_score: 总得分
- time_spent: 用时(秒)
- status: 状态 (-1-未开始, 0-未完成, 1-已完成)
- started_date: 开始时间
- finished_date: 完成时间
- created_date: 创建时间
- updated_date: 更新时间

## 表关系图

```
+----------------+          +-------------+
|  exam-questions|          |   exams     |
|                |<---------|             |
| _id (PK)       |    1   * | _id (PK)    |
| title          |          | title       |
| type           |          | description |
| options        |          | questions   |
| answer         |          | status      |
| analysis       |          | ...         |
| difficulty     |          |             |
| ...            |          +-------------+
+----------------+
                        *
                        |
                        | 1
+----------------+     +-------------+
|  exam-users    |     |exam-schedules|
|                |<----|              |
| _id (PK)       |  *  | _id (PK)     |
| username       |-----| exam_id (FK) |
| email          |  1  | title        |
| nickname       |     | description  |
| avatar         |     | start_time   |
| status         |     | end_time     |
| ...            |     | allowed_users|
+----------------+     | duration     |
     ^                 | ...          |
     | 1               +-------------+
     | *                     *
+----------------+           | 1
| exam-records   |           |
|                |-----------+
| _id (PK)       |
| exam_schedules_id (FK)
| user_id (FK)   |
| answers        |
| total_full_mark|
| total_score    |
| time_spent     |
| status         |
| ...            |
+----------------+
```

## 关系说明

1. **exams.questions → exam-questions._id**
   - 一份试卷包含多个题目
   - 通过 `exams` 表的 `questions` 字段关联到 `exam-questions` 表的 `_id` 字段

2. **exam-schedules.exam_id → exams._id**
   - 一个考试安排对应一份试卷
   - 通过 `exam-schedules` 表的 `exam_id` 字段关联到 `exams` 表的 `_id` 字段

3. **exam-schedules.allowed_users → exam-users._id**
   - 一个考试安排允许多个用户参加
   - 通过 `exam-schedules` 表的 `allowed_users` 字段关联到 `exam-users` 表的 `_id` 字段

4. **exam-records.exam_schedules_id → exam-schedules._id**
   - 一条考试记录对应一个考试安排
   - 通过 `exam-records` 表的 `exam_schedules_id` 字段关联到 `exam-schedules` 表的 `_id` 字段

5. **exam-records.user_id → exam-users._id**
   - 一条考试记录对应一个考生
   - 通过 `exam-records` 表的 `user_id` 字段关联到 `exam-users` 表的 `_id` 字段