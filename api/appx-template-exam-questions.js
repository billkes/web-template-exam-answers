/**
 * 考试题目管理API - uniCloud版本
 */

// 创建题目
export function createQuestion(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-questions',
		data: {
			action: 'create',
			params: data
		}
	}).then(res => res.result);
}

// 批量创建题目
export function batchCreateQuestions(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-questions',
		data: {
			action: 'batchCreate',
			params: data
		}
	}).then(res => res.result);
}

// 更新题目
export function updateQuestion(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-questions',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 删除题目
export function deleteQuestion(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-questions',
		data: {
			action: 'delete',
			params
		}
	}).then(res => res.result);
}

// 获取题目详情
export function getQuestion(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-questions',
		data: {
			action: 'get',
			params
		}
	}).then(res => res.result);
}

// 获取题目列表
export function getQuestionList(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-questions',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 获取考试下的所有题目
export function getExamQuestions(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-questions',
		data: {
			action: 'getExamQuestions',
			params
		}
	}).then(res => res.result);
}

// 验证用户答案
export function validateAnswer(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-questions',
		data: {
			action: 'validateAnswer',
			params
		}
	}).then(res => res.result);
}