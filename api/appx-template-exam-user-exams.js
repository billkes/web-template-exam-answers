/**
 * 用户考试关联API - uniCloud版本
 */

// 获取用户考试关联列表
export function getUserExamList(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 获取单个用户考试关联详情
export function getUserExamDetail(id) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'detail',
			params: {
				id
			}
		}
	}).then(res => res.result);
}

// 用户报名考试
export function enrollExam(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'add',
			params: data
		}
	}).then(res => res.result);
}

// 更新用户考试
export function updateUserExam(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 删除用户考试关联（取消报名）
export function deleteUserExam(id) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'delete',
			params: {
				id
			}
		}
	}).then(res => res.result);
}