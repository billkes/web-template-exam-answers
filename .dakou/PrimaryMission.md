# 主要任务

> 为高效工作，应严格按照步骤进行，以免返工

1. 进一步优化现有的5个JSON schema文件，以支持HBuilderX中的schema2code功能，从而快速生成后台管理页面。
	1. `uniCloud-aliyun/database/exam-questions.schema.json`
	2. `uniCloud-aliyun/database/exam-records.schema.json`
	3. `uniCloud-aliyun/database/exams.schema.json`
	4. `uniCloud-aliyun/database/exam-schedules.schema.json`
	5. `uniCloud-aliyun/database/exam-users.schema.json`
2. 添加合适的DB Schema扩展js
	1. 如 `exam-schedules` 需要计算total_score总分
	2. `exam-records` 添加定时器，到时自动交卷
	3. `exam-schedules` 添加定时器，到时改变考试安排状态
	4. ...


