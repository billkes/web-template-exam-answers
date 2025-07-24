/**
 * 考试答题记录API - uniCloud版本
 */

// 获取考试记录列表
export function getRecordList(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-answer-records',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 获取考试记录详情
export function getRecordDetail(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-answer-records',
		data: {
			action: 'detail',
			params
		}
	}).then(res => res.result);
}

// 添加考试记录
export function addRecord(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-answer-records',
		data: {
			action: 'add',
			params: data
		}
	}).then(res => res.result);
}

// 更新考试记录
export function updateRecord(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-answer-records',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 删除考试记录
export function deleteRecord(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-answer-records',
		data: {
			action: 'delete',
			params
		}
	}).then(res => res.result);
}

// 获取用户某试卷的考试记录
export function getUserPaperRecords(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-answer-records',
		data: {
			action: 'userPaperRecords',
			params
		}
	}).then(res => res.result);
}

// 批量添加考试记录
export function batchAddRecords(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-answer-records',
		data: {
			action: 'batchAdd',
			params: data
		}
	}).then(res => res.result);
}