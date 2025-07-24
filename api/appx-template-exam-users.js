/**
 * 用户管理API - uniCloud版本
 */

// 用户注册
export function registerUser(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-users',
		data: {
			action: 'register',
			params: data
		}
	}).then(res => res.result);
}

// 用户登录
export function loginUser(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-users',
		data: {
			action: 'login',
			params: data
		}
	}).then(res => res.result);
}

// 获取用户信息
export function getUserInfo(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-users',
		data: {
			action: 'getUserInfo',
			params
		}
	}).then(res => res.result);
}

// 更新用户信息
export function updateUser(data) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-users',
		data: {
			action: 'updateUser',
			params: data
		}
	}).then(res => res.result);
}

// 重置密码
export function resetPassword(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-users',
		data: {
			action: 'resetPassword',
			params
		}
	}).then(res => res.result);
}

// 获取用户列表
export function getUserList(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-users',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 删除用户
export function deleteUser(params) {
	return uniCloud.callFunction({
		name: 'appx-template-exam-users',
		data: {
			action: 'delete',
			params
		}
	}).then(res => res.result);
}