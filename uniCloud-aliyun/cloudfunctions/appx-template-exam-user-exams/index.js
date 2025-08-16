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
			case 'enroll':
				return await enrollUser(params);
			case 'cancelEnrollment':
				return await cancelEnrollment(params);
			case 'updateStatus':
				return await updateEnrollmentStatus(params);
			case 'getUserExams':
				return await getUserExams(params);
			case 'getExamUsers':
				return await getExamUsers(params);
			case 'getEnrollmentList':
				return await getEnrollmentList(params);
			case 'checkEnrollment':
				return await checkEnrollment(params);
			default:
				return {
					code: 400,
						message: '无效的操作类型'
				};
		}
	} catch (error) {
		console.error('用户考试关联云函数错误:', error);
		return {
			code: 500,
			message: '服务器内部错误',
			error: error.message
		};
	}
};

// 用户报名考试
async function enrollUser(data) {
	const requiredFields = ['user_id', 'exam_id'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	const {
		user_id,
		exam_id
	} = data;

	// 检查用户是否存在
	const userExists = await db.collection('appx-template-exam-users').doc(user_id).get();
	if (!userExists.data || userExists.data.length === 0) {
		return {
			code: 404,
			message: '用户不存在'
		};
	}

	// 检查考试是否存在
	const examExists = await db.collection('appx-template-exam-exams').doc(exam_id).get();
	if (!examExists.data || examExists.data.length === 0) {
		return {
			code: 404,
			message: '考试不存在'
		};
	}

	// 检查是否已报名
	const existingEnrollment = await collection.where({
		user_id,
		exam_id
	}).get();

	if (existingEnrollment.data.length > 0) {
		return {
			code: 400,
			message: '用户已报名该考试'
		};
	}

	// 创建报名记录
	const enrollmentData = {
		user_id,
		exam_id,
		enrolled_time: Date.now(),
		status: data.status || 1 // 默认已通过
	};

	const res = await collection.add(enrollmentData);

	return {
		code: 200,
		data: {
			id: res.id,
			...enrollmentData
		},
		message: '报名成功'
	};
}

// 取消报名
async function cancelEnrollment(data) {
	const requiredFields = ['user_id', 'exam_id'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	const {
		user_id,
		exam_id
	} = data;

	// 查找报名记录
	const enrollment = await collection.where({
		user_id,
		exam_id
	}).get();

	if (enrollment.data.length === 0) {
		return {
			code: 404,
			message: '未找到报名记录'
		};
	}

	// 删除报名记录
	const res = await collection.where({
		user_id,
		exam_id
	}).remove();

	if (res.deleted === 0) {
		return {
			code: 404,
			message: '取消报名失败'
		};
	}

	return {
		code: 200,
		message: '取消报名成功'
	};
}

// 更新报名状态
async function updateEnrollmentStatus(data) {
	const requiredFields = ['id', 'status'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	const {
		id,
		status
	} = data;

	// 验证状态值
	const validStatuses = [0, 1, 2]; // 0-待审核，1-已通过，2-已拒绝
	if (!validStatuses.includes(status)) {
		return {
			code: 400,
			message: '无效的状态值'
		};
	}

	const res = await collection.doc(id).update({
		status
	});

	if (res.updated === 0) {
		return {
			code: 404,
			message: '报名记录不存在'
		};
	}

	return {
		code: 200,
		message: '状态更新成功'
	};
}

// 获取用户的所有考试
async function getUserExams(params) {
	const {
		user_id,
		page = 1,
		pageSize = 10,
		status
	} = params;

	if (!user_id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	const where = {
		user_id
	};
	if (status !== undefined) {
		where.status = status;
	}

	const pipeline = [{
			$match: where
		},
		{
			$lookup: {
				from: 'appx-template-exam-exams',
				localField: 'exam_id',
				foreignField: '_id',
				as: 'exam_info'
			}
		},
		{
			$unwind: '$exam_info'
		},
		{
			$project: {
				_id: 1,
				user_id: 1,
				exam_id: 1,
				enrolled_time: 1,
				status: 1,
				'exam_info.title': 1,
				'exam_info.description': 1,
				'exam_info.start_time': 1,
				'exam_info.end_time': 1,
				'exam_info.duration': 1
			}
		},
		{
			$sort: {
				enrolled_time: -1
			}
		},
		{
			$skip: (page - 1) * pageSize
		},
		{
			$limit: pageSize
		}
	];

	const res = await collection.aggregate(pipeline).end();
	const countRes = await collection.where(where).count();

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

// 获取考试的所有用户
async function getExamUsers(params) {
	const {
		exam_id,
		page = 1,
		pageSize = 10,
		status
	} = params;

	if (!exam_id) {
		return {
			code: 400,
			message: '考试ID不能为空'
		};
	}

	const where = {
		exam_id
	};
	if (status !== undefined) {
		where.status = status;
	}

	const pipeline = [{
			$match: where
		},
		{
			$lookup: {
				from: 'appx-template-exam-users',
				localField: 'user_id',
				foreignField: '_id',
				as: 'user_info'
			}
		},
		{
			$unwind: '$user_info'
		},
		{
			$project: {
				_id: 1,
				user_id: 1,
				exam_id: 1,
				enrolled_time: 1,
				status: 1,
				'user_info.username': 1,
				'user_info.mobile': 1,
				'user_info.create_time': 1
			}
		},
		{
			$sort: {
				enrolled_time: -1
			}
		},
		{
			$skip: (page - 1) * pageSize
		},
		{
			$limit: pageSize
		}
	];

	const res = await collection.aggregate(pipeline).end();
	const countRes = await collection.where(where).count();

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

// 获取报名列表（带分页和搜索）
async function getEnrollmentList(params) {
	const {
		keyword,
		page = 1,
		pageSize = 10,
		status,
		exam_id,
		user_id
	} = params;

	const where = {};

	if (status !== undefined) {
		where.status = status;
	}
	if (exam_id) {
		where.exam_id = exam_id;
	}
	if (user_id) {
		where.user_id = user_id;
	}

	const pipeline = [{
			$match: where
		},
		{
			$lookup: {
				from: 'appx-template-exam-users',
				localField: 'user_id',
				foreignField: '_id',
				as: 'user_info'
			}
		},
		{
			$lookup: {
				from: 'appx-template-exam-exams',
				localField: 'exam_id',
				foreignField: '_id',
				as: 'exam_info'
			}
		},
		{
			$unwind: '$user_info'
		},
		{
			$unwind: '$exam_info'
		},
		{
			$match: keyword ? {
				$or: [{
						'user_info.username': new RegExp(keyword, 'i')
					},
					{
						'user_info.mobile': new RegExp(keyword, 'i')
					},
					{
						'exam_info.title': new RegExp(keyword, 'i')
					}
				]
			} : {}
		},
		{
			$project: {
				_id: 1,
				user_id: 1,
				exam_id: 1,
				enrolled_time: 1,
				status: 1,
				'user_info.username': 1,
				'user_info.mobile': 1,
				'exam_info.title': 1,
				'exam_info.description': 1,
				'exam_info.start_time': 1,
				'exam_info.end_time': 1
			}
		},
		{
			$sort: {
				enrolled_time: -1
			}
		},
		{
			$facet: {
				data: [{
						$skip: (page - 1) * pageSize
					},
					{
						$limit: pageSize
					}
				],
				total: [{
					$count: 'count'
				}]
			}
		}
	];

	const res = await collection.aggregate(pipeline).end();
	const total = res.data[0].total[0]?.count || 0;

	return {
		code: 200,
		data: {
			rows: res.data[0].data,
			total,
			page,
			pageSize
		}
	};
}

// 检查用户是否已报名考试
async function checkEnrollment(params) {
	const {
		user_id,
		exam_id
	} = params;

	if (!user_id || !exam_id) {
		return {
			code: 400,
			message: '用户ID和考试ID不能为空'
		};
	}

	const res = await collection.where({
		user_id,
		exam_id
	}).get();

	return {
		code: 200,
		data: {
			enrolled: res.data.length > 0,
			enrollment: res.data[0] || null
		}
	};
}