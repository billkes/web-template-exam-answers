'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('appx-template-exam-user-exams');

exports.main = async (event, context) => {
	const {
		action,
		params
	} = event;

	try {
		switch (action) {
			case 'list':
				return await getList(params);
			case 'detail':
				return await getDetail(params.id);
			case 'add':
				return await add(params);
			case 'update':
				return await update(params);
			case 'delete':
				return await deleteData(params.id);
			default:
				return {
					code: 400,
						message: '无效的操作类型'
				};
		}
	} catch (error) {
		console.error('云函数执行错误:', error);
		return {
			code: 500,
			message: '服务器内部错误',
			error: error.message
		};
	}
};

// 获取用户列表
async function getList(params = {}) {
	const {
		keyword,
		page = 1,
		pageSize = 10,
		sortField = 'created_at',
		sortOrder = 'desc'
	} = params;

	const where = {};
	if (keyword) {
		where.user_id = new RegExp(keyword, 'i');
	}

	const aggregate = collection.aggregate()
		.match(where)
		.lookup({
			from: 'appx-template-exam-users',
			localField: 'user_id',
			foreignField: '_id',
			as: 'user_info'
		})
		.lookup({
			from: 'appx-template-exam-exams',
			localField: 'exam_id',
			foreignField: '_id',
			as: 'exam_info'
		})
		.addFields({
			user_username: {
				$arrayElemAt: ['$user_info.username', 0]
			},
			exam_title: {
				$arrayElemAt: ['$exam_info.title', 0]
			}
		})
		.project({
			user_info: 0,
			exam_info: 0
		})
		.sort({
			[sortField]: sortOrder === 'desc' ? -1 : 1
		})
		.skip((page - 1) * pageSize)
		.limit(pageSize);

	const [res, countRes] = await Promise.all([
		aggregate.end(),
		collection.where(where).count()
	]);

	return {
		code: 200,
		data: {
			rows: res.data,
			total: countRes.total,
			page,
			pageSize
		}
	};
}

// 获取用户详情
async function getDetail(id) {
	if (!id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	const res = await collection
		.aggregate()
		.match({
			_id: id
		})
		.lookup({
			from: 'appx-template-exam-users',
			localField: 'user_id',
			foreignField: '_id',
			as: 'user_info'
		})
		.lookup({
			from: 'appx-template-exam-exams',
			localField: 'exam_id',
			foreignField: '_id',
			as: 'exam_info'
		})
		.addFields({
			user_username: {
				$arrayElemAt: ['$user_info.username', 0]
			},
			exam_title: {
				$arrayElemAt: ['$exam_info.title', 0]
			}
		})
		.project({
			user_info: 0,
			exam_info: 0
		})
		.end();

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

// 添加用户
async function add(data) {
	const requiredFields = ['user_id', 'exam_id', 'enrolled_time'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	const exists = await collection.where({
		user_id: data.user_id,
		exam_id: data.exam_id
	}).get();
	if (exists.data && exists.data.length > 0) {
		return {
			code: 409,
			message: '考试已存在'
		};
	}

	data.created_at = Date.now();
	data.role = data.role !== undefined ? data.role : 0;

	const res = await collection.add(data);

	return {
		code: 200,
		data: {
			id: res.id
		},
		message: '添加用户考试成功'
	};
}

// 更新用户信息
async function update(data) {
	if (!data._id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	const id = data._id;
	delete data._id;

	if (data.username) {
		const exists = await collection.where({
			username: data.username,
			_id: dbCmd.neq(id)
		}).get();
		if (exists.data && exists.data.length > 0) {
			return {
				code: 409,
				message: '用户名已被占用'
			};
		}
	}

	const res = await collection.doc(id).update(data);
	if (res.updated === 0) {
		return {
			code: 404,
			message: '用户不存在或未更新'
		};
	}

	return {
		code: 200,
		message: '更新用户成功'
	};
}

// 删除用户
async function deleteData(id) {
	if (!id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	const res = await collection.doc(id).remove();
	if (res.deleted === 0) {
		return {
			code: 404,
			message: '用户不存在或删除失败'
		};
	}

	return {
		code: 200,
		message: '删除用户成功'
	};
}