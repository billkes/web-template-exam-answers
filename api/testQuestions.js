/**
 * 题目管理API
 */

// 获取题目列表
export function getQuestionList(params) {
	return uniCloud.callFunction({
		name: 'testQuestions',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 获取题目详情
export function getQuestionDetail(id) {
	return uniCloud.callFunction({
		name: 'testQuestions',
		data: {
			action: 'detail',
			params: {
				id
			}
		}
	}).then(res => res.result);
}

// 添加题目
export function addQuestion(data) {
	return uniCloud.callFunction({
		name: 'testQuestions',
		data: {
			action: 'add',
			params: data
		}
	}).then(res => res.result);
}

// 更新题目
export function updateQuestion(data) {
	return uniCloud.callFunction({
		name: 'testQuestions',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 删除题目
export function deleteQuestion(id) {
	return uniCloud.callFunction({
		name: 'testQuestions',
		data: {
			action: 'delete',
			params: {
				id
			}
		}
	}).then(res => res.result);
}

// 批量删除题目
export function batchDeleteQuestions(ids) {
	return uniCloud.callFunction({
		name: 'testQuestions',
		data: {
			action: 'batchDelete',
			params: {
				ids
			}
		}
	}).then(res => res.result);
}