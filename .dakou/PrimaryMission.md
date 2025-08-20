# 主要任务

> 为高效工作，应严格按照步骤进行，以免返工

1. 检查5个JSON schema文件的当前状态和结构
2. 识别每个schema的字段定义、验证规则和关系
3. 分析schema与现有组件的匹配度
4. 创建 `exam-schedules.schema.ext.js` 需要计算total_score总分、添加考试状态自动更新逻辑、实现考试冲突检测逻辑
5. 创建 `exam-records.schema.ext.js` 实现自动交卷定时器功能、添加答题进度自动保存逻辑、创建成绩实时计算功能
6. 测试和验证，测试所有schema文件的正确性、验证扩展js功能的正常运行、确保schema2code功能正常工作、测试生成的后台管理页面、进行性能和安全性测试
7. 更新ChangeLog.md