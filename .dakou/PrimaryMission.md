# 主要任务

> 为高效工作，应严格按照步骤进行，以免返工

详看文件：
components/billkes-form-exam-records-answers/billkes-form-exam-records-answers.vue(需做修改)
uniCloud-aliyun/database/exam-records.schema.json
uniCloud-aliyun/database/exam-records.schema.ext.js(需做修改)

```ts
type AnswersType = {
	questions : {
		_id : string // 题目ID，对应exam-questions表的_id
		difficulty : number // 题目难度：1-简单，2-中等，3-困难
		title : string // 题目标题
		type : string // 题目类型：single-单选题，multiple-多选题
		options : string[] // 题目选项数组
		answer : number[] // 正确答案索引数组（0=A,1=B,2=C...）
		analysis : string // 题目解析
		created_date : number // 题目创建时间（时间戳）
		updated_date : number // 题目更新时间（时间戳）
	},
	exam_schedules : {
		_id : string // 考试安排ID，对应exam-schedules表的_id
		exam_id : string // 试卷ID，对应exams表的_id
		title : string // 考试安排标题
		description : string // 考试安排描述
		start_time : number // 考试开始时间（时间戳）
		end_time : number // 考试结束时间（时间戳）
		allowed_users : string[] // 允许参加考试的用户ID数组
		duration : number // 考试时长（分钟）
		simple_score : number // 简单题分数
		medium_score : number // 中等题分数
		difficult_score : number // 困难题分数
		total_score : number // 试卷总分
		status : number // 考试状态：0-未开始，1-进行中，2-已结束
		created_date : number // 创建时间（时间戳）
		updated_date : number // 更新时间（时间戳）
	},
	full_mark : number // 本题满分取决于questions.difficulty的和exam_schedules.simple_score、exam_schedules.medium_score、exam_schedules.difficult_score
	score : number // 本题得分
	is_correct : number // 是否正确：0-错误，1-正确
	user_answer : number[] // 用户答案索引数组（0=A,1=B,2=C...）
}
```

报名：
1. 考生移动端，调用云函数，传入参数exam_schedules_id和user_id
2. 将exam-records.status默认为-1（未开始） 
3. 根据exam_records.exam_schedules_id获取exam-schedules详情，exam-schedules.exam_id找到exams详情，遍历exams.questions数组，通过id获取exam-questions详情
4. 对exam-records.answers初始化，长度要求与exams.questions数组长度一致，类型为上面的AnswersType[]
5. 将exam_records.total_full_mark计算 
6. 云函数调用新增exam_records 

开考：
1. 考生移动端，调用云函数，传入参数id
2. 云函数用id获取exam_records详情，将status改为0（未完成）
3. 调用更新exam_records
4. 返回"抹除化"的数据，不要直接去掉，在移动端类型严格！

继考：
1. 考生移动端，调用云函数，传入参数id
2. 云函数用id获取exam_records详情，
3. 返回"抹除化"的数据，不要直接去掉，在移动端类型严格！

答题：
1. 考生移动端，调用云函数，传入参数id、index和user_answer
2. 云函数用id获取exam_records详情
3. 将exam_records.answers[index].user_answer替换
4. 将exam_records.is_correct和exam_records.score计算
5. 调用更新exam_records

交卷：
1. 考生移动端，调用云函数，传入参数id
2. 云函数用id获取exam_records详情
3. 将exam_records.status改为已完成（2）
4. 将exam_records.finished_date赋值当前时间
5. 遍历answers，将exam_records.total_score计算 
6. 将exam_records.time_spent计算
