/**
 * 试卷题目关联管理API
 */

// 获取试卷题目列表
export function getPaperQuestionList(params) {
	return uniCloud.callFunction({
		name: 'testPaperQuestions',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 添加试卷题目
export function addPaperQuestion(data) {
	return uniCloud.callFunction({
		name: 'testPaperQuestions',
		data: {
			action: 'add',
			params: data
		}
	}).then(res => res.result);
}

// 批量添加试卷题目
export function batchAddPaperQuestions(paper_id, question_ids) {
	return uniCloud.callFunction({
		name: 'testPaperQuestions',
		data: {
			action: 'batchAdd',
			params: {
				paper_id,
				question_ids
			}
		}
	}).then(res => res.result);
}

// 更新试卷题目
export function updatePaperQuestion(data) {
	return uniCloud.callFunction({
		name: 'testPaperQuestions',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 删除试卷题目
export function deletePaperQuestion(id) {
	return uniCloud.callFunction({
		name: 'testPaperQuestions',
		data: {
			action: 'delete',
			params: {
				id
			}
		}
	}).then(res => res.result);
}

// 批量删除试卷题目
export function batchDeletePaperQuestions(ids) {
	return uniCloud.callFunction({
		name: 'testPaperQuestions',
		data: {
			action: 'batchDelete',
			params: {
				ids
			}
		}
	}).then(res => res.result);
}