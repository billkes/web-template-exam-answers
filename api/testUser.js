/**
 * 考试用户管理API - uniCloud版本
 */

// 获取用户列表
export function getUserList(params) {
	return uniCloud.callFunction({
		name: 'testUser',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 添加用户
export function addUser(data) {
	return uniCloud.callFunction({
		name: 'testUser',
		data: {
			action: 'add',
			params: data
		}
	}).then(res => res.result);
}

// 更新用户
export function updateUser(data) {
	return uniCloud.callFunction({
		name: 'testUser',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 删除用户
export function deleteUser(params) {
	return uniCloud.callFunction({
		name: 'testUser',
		data: {
			action: 'delete',
			params
		}
	}).then(res => res.result);
}