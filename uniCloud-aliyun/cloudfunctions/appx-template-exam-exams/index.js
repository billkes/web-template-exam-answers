'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('appx-template-exam-exams');

exports.main = async (event, context) => {
	const {
		action,
		params
	} = event;

	try {
		switch (action) {
			case 'create':
				return await createExam(params);
			case 'update':
				return await updateExam(params);
			case 'delete':
				return await deleteExam(params.id);
			case 'get':
				return await getExam(params.id);
			case 'list':
				return await getExamList(params);
			case 'changeStatus':
				return await changeExamStatus(params.id, params.status);
			default:
				return {
					code: 400,
						message: '无效的操作类型'
				};
		}
	} catch (error) {
		console.error('考试管理云函数错误:', error);
		return {
			code: 500,
			message: '服务器内部错误',
			error: error.message
		};
	}
};

// 创建考试
async function createExam(data) {
	const requiredFields = ['name', 'start_time', 'end_time', 'duration', 'total_score'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	// 检查时间有效性
	if (new Date(data.end_time) <= new Date(data.start_time)) {
		return {
			code: 400,
			message: '结束时间必须晚于开始时间'
		};
	}

	const examData = {
		name: data.name,
		description: data.description || '',
		start_time: data.start_time,
		end_time: data.end_time,
		duration: parseInt(data.duration),
		total_score: parseFloat(data.total_score),
		status: data.status || 1,
		create_time: Date.now()
	};

	const res = await collection.add(examData);

	return {
		code: 200,
		data: {
			id: res.id
		},
		message: '创建成功'
	};
}

// 更新考试信息
async function updateExam(data) {
	if (!data._id) {
		return {
			code: 400,
			message: '考试ID不能为空'
		};
	}

	const id = data._id;
	delete data._id;

	// 检查时间有效性
	if (data.end_time && data.start_time && new Date(data.end_time) <= new Date(data.start_time)) {
		return {
			code: 400,
			message: '结束时间必须晚于开始时间'
		};
	}

	// 准备更新数据
	const updateData = {};
	if (data.name) updateData.name = data.name;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.start_time) updateData.start_time = data.start_time;
	if (data.end_time) updateData.end_time = data.end_time;
	if (data.duration) updateData.duration = parseInt(data.duration);
	if (data.total_score) updateData.total_score = parseFloat(data.total_score);

	const res = await collection.doc(id).update(updateData);

	if (res.updated === 0) {
		return {
			code: 404,
			message: '考试不存在或数据未变更'
		};
	}

	return {
		code: 200,
		message: '更新成功'
	};
}

// 删除考试
async function deleteExam(id) {
	if (!id) {
		return {
			code: 400,
			message: '考试ID不能为空'
		};
	}

	// 检查是否有考试记录
	const examRecordCount = await db.collection('appx-template-exam-answer-records')
		.where({
			exam_id: id
		})
		.count();

	if (examRecordCount.total > 0) {
		return {
			code: 403,
			message: '该考试已有答题记录，不可删除'
		};
	}

	const res = await collection.doc(id).remove();

	if (res.deleted === 0) {
		return {
			code: 404,
			message: '考试不存在'
		};
	}

	return {
		code: 200,
		message: '删除成功'
	};
}

// 获取考试详情
async function getExam(id) {
	if (!id) {
		return {
			code: 400,
			message: '考试ID不能为空'
		};
	}

	const res = await collection.doc(id).get();

	if (!res.data || res.data.length === 0) {
		return {
			code: 404,
			message: '考试不存在'
		};
	}

	return {
		code: 200,
		data: res.data[0]
	};
}

// 获取考试列表（分页+筛选）
async function getExamList(params = {}) {
	const {
		keyword,
		status,
		page = 1,
		pageSize = 10,
		sortField = 'create_time',
		sortOrder = 'desc'
	} = params;

	const where = {};
	if (keyword) {
		where.$or = [{
				name: new RegExp(keyword, 'i')
			},
			{
				description: new RegExp(keyword, 'i')
			}
		];
	}
	if (status !== undefined) where.status = status;

	const res = await collection
		.where(where)
		.orderBy(sortField, sortOrder)
		.skip((page - 1) * pageSize)
		.limit(pageSize)
		.get();

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

// 修改考试状态
async function changeExamStatus(id, status) {
	if (![0, 1].includes(status)) {
		return {
			code: 400,
			message: '状态值无效'
		};
	}

	const res = await collection.doc(id).update({
		status: status
	});

	if (res.updated === 0) {
		return {
			code: 404,
			message: '考试不存在'
		};
	}

	return {
		code: 200,
		message: '状态更新成功'
	};
}