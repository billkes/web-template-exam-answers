/**
 * 考试记录管理API
 */

// 获取考试记录列表
export function getRecordList(params) {
	return uniCloud.callFunction({
		name: 'testRecords',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 获取考试记录详情
export function getRecordDetail(id) {
	return uniCloud.callFunction({
		name: 'testRecords',
		data: {
			action: 'detail',
			params: {
				id
			}
		}
	}).then(res => res.result);
}

// 添加考试记录
export function addRecord(data) {
	return uniCloud.callFunction({
		name: 'testRecords',
		data: {
			action: 'add',
			params: data
		}
	}).then(res => res.result);
}

// 更新考试记录
export function updateRecord(data) {
	return uniCloud.callFunction({
		name: 'testRecords',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 获取用户某试卷的考试记录
export function getUserPaperRecords(user_id, paper_id, limit = 5) {
	return uniCloud.callFunction({
		name: 'testRecords',
		data: {
			action: 'userPaperRecords',
			params: {
				user_id,
				paper_id,
				limit
			}
		}
	}).then(res => res.result);
}