'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('appx-template-exam-users');
const crypto = require('crypto');

exports.main = async (event, context) => {
	const {
		action,
		params
	} = event;

	try {
		switch (action) {
			case 'register':
				return await registerUser(params);
			case 'login':
				return await loginUser(params);
			case 'getUserInfo':
				return await getUserInfo(params.id);
			case 'updateUser':
				return await updateUser(params);
			case 'resetPassword':
				return await resetPassword(params.id, params.newPassword);
			case 'list':
				return await getUserList(params);
			case 'delete':
				return await deleteUser(params.id);
			default:
				return {
					code: 400,
						message: '无效的操作类型'
				};
		}
	} catch (error) {
		console.error('用户管理云函数错误:', error);
		return {
			code: 500,
			message: '服务器内部错误',
			error: error.message
		};
	}
};

// 用户注册
async function registerUser(data) {
	const requiredFields = ['username', 'password'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	// 用户名唯一性检查
	const existUser = await collection.where({
		username: data.username
	}).count();

	if (existUser.total > 0) {
		return {
			code: 400,
			message: '用户名已存在'
		};
	}

	// 密码加密处理
	const encryptedPassword = encryptPassword(data.password);

	const res = await collection.add({
		username: data.username,
		password: encryptedPassword,
		create_time: Date.now()
	});

	return {
		code: 200,
		data: {
			id: res.id,
			username: data.username
		},
		message: '注册成功'
	};
}

// 用户登录
async function loginUser(data) {
	if (!data.username || !data.password) {
		return {
			code: 400,
			message: '用户名和密码不能为空'
		};
	}

	// 查找用户
	const res = await collection.where({
		username: data.username,
		password: encryptPassword(data.password)
	}).get();

	if (res.data.length === 0) {
		return {
			code: 401,
			message: '用户名或密码错误'
		};
	}

	const user = res.data[0];

	// 生成访问令牌(实际项目应使用更安全的方案如JWT)
	const token = generateToken(user._id);

	return {
		code: 200,
		data: {
			id: user._id,
			username: user.username,
			token: token
		},
		message: '登录成功'
	};
}

// 获取用户信息
async function getUserInfo(id) {
	if (!id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	const res = await collection.doc(id).field({
		password: false // 排除密码字段
	}).get();

	if (!res.data || res.data.length === 0) {
		return {
			code: 404,
			message: '用户不存在'
		};
	}

	return {
		code: 200,
		data: res.data[0]
	};
}

// 更新用户信息
async function updateUser(data) {
	if (!data._id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	const id = data._id;
	delete data._id;

	// 禁止修改的字段
	delete data.password; // 密码修改走单独接口
	delete data.create_time;

	// 如果修改用户名需要检查唯一性
	if (data.username) {
		const existUser = await collection.where({
			username: data.username,
			_id: dbCmd.neq(id)
		}).count();

		if (existUser.total > 0) {
			return {
				code: 400,
				message: '用户名已存在'
			};
		}
	}

	const res = await collection.doc(id).update(data);

	if (res.updated === 0) {
		return {
			code: 404,
			message: '用户不存在或数据未变更'
		};
	}

	return {
		code: 200,
		message: '更新成功'
	};
}

// 重置密码
async function resetPassword(id, newPassword) {
	if (!id || !newPassword) {
		return {
			code: 400,
			message: '参数不完整'
		};
	}

	if (newPassword.length < 6) {
		return {
			code: 400,
			message: '密码长度不能少于6位'
		};
	}

	const res = await collection.doc(id).update({
		password: encryptPassword(newPassword)
	});

	if (res.updated === 0) {
		return {
			code: 404,
			message: '用户不存在'
		};
	}

	return {
		code: 200,
		message: '密码重置成功'
	};
}

// 获取用户列表
async function getUserList(params = {}) {
	const {
		keyword,
		page = 1,
		pageSize = 10,
		sortField = 'create_time',
		sortOrder = 'desc'
	} = params;

	const where = {};
	if (keyword) where.username = new RegExp(keyword, 'i');

	const res = await collection
		.where(where)
		.field({
			password: false // 不返回密码字段
		})
		.orderBy(sortField, sortOrder)
		.skip((page - 1) * pageSize)
		.limit(pageSize)
		.get();

	const countRes = await collection.where(where).count();

	return {
		code: 200,
		data: {
			list: res.data,
			total: countRes.total,
			page,
			pageSize
		}
	};
}

// 删除用户
async function deleteUser(id) {
	if (!id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	// 检查用户是否有考试记录
	const examCount = await db.collection('appx-template-exam-answer-records')
		.where({
			user_id: id
		})
		.count();

	if (examCount.total > 0) {
		return {
			code: 403,
			message: '用户已有考试记录，不可删除'
		};
	}

	const res = await collection.doc(id).remove();

	if (res.deleted === 0) {
		return {
			code: 404,
			message: '用户不存在'
		};
	}

	return {
		code: 200,
		message: '删除成功'
	};
}

// 密码加密函数
function encryptPassword(password) {
	return crypto.createHash('sha256')
		.update(password + 'exam_system_salt') // 加盐处理
		.digest('hex');
}

// 生成简易令牌(生产环境建议使用JWT)
function generateToken(userId) {
	return crypto.createHash('md5')
		.update(userId + Date.now() + 'token_secret')
		.digest('hex');
}