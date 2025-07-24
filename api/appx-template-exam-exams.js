/**
 * 考试管理API - uniCloud版本
 */

// 创建考试
export function createExam(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-exams',
		data: {
			action: 'create',
			params: data
		}
	}).then(res => res.result);
}

// 更新考试信息
export function updateExam(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-exams',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 删除考试
export function deleteExam(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-exams',
		data: {
			action: 'delete',
			params
		}
	}).then(res => res.result);
}

// 获取考试详情
export function getExam(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-exams',
		data: {
			action: 'get',
			params
		}
	}).then(res => res.result);
}

// 获取考试列表
export function getExamList(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-exams',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 修改考试状态
export function changeExamStatus(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-exams',
		data: {
			action: 'changeStatus',
			params
		}
	}).then(res => res.result);
}

// 获取进行中的考试
export function getActiveExams(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-exams',
		data: {
			action: 'getActiveExams',
			params
		}
	}).then(res => res.result);
}