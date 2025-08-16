/**
 * 用户考试关联API - uniCloud版本
 */

// 用户报名考试
export function enrollUser(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'enroll',
			params
		}
	}).then(res => res.result);
}

// 取消报名
export function cancelEnrollment(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'cancelEnrollment',
			params
		}
	}).then(res => res.result);
}

// 更新报名状态
export function updateStatus(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'updateStatus',
			params
		}
	}).then(res => res.result);
}

// 获取用户的所有考试
export function getUserExams(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'getUserExams',
			params
		}
	}).then(res => res.result);
}

// 获取考试的所有用户
export function getExamUsers(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'getExamUsers',
			params
		}
	}).then(res => res.result);
}

// 获取报名列表(带分页和搜索)
export function getEnrollmentList(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'getEnrollmentList',
			params
		}
	}).then(res => res.result);
}

// 检查用户是否已报名考试
export function checkEnrollment(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-user-exams',
		data: {
			action: 'checkEnrollment',
			params
		}
	}).then(res => res.result);
}