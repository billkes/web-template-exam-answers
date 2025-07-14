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
			case 'getActiveExams':
				return await getActiveExams(params);
			default:
				return {
					code: 400,
						message: '无效的操作类型'
				};
		}
	} catch (error) {
		console.error('考试云函数错误:', error);
		return {
			code: 500,
			message: '服务器内部错误',
			error: error.message
		};
	}
};

// 创建考试
async function createExam(data) {
	const requiredFields = ['title', 'start_time', 'end_time', 'duration'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	// 自动计算状态
	const now = Date.now();
	data.status = now > data.end_time ? 2 : (now >= data.start_time ? 1 : 0);

	const res = await collection.add({
		...data,
		create_time: Date.now()
	});

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

	// 禁止修改的字段
	delete data.create_time;
	delete data.status; // 状态由系统自动计算

	const res = await collection.doc(id).update(data);

	if (res.updated === 0) {
		return {
			code: 404,
			message: '考试不存在或数据未变更'
		};
	}

	// 自动更新状态
	await updateAutoStatus(id);

	return {
		code: 200,
		message: '更新成功'
	};
}

// 自动更新考试状态
async function updateAutoStatus(id) {
	const exam = (await collection.doc(id).get()).data[0];
	if (!exam) return;

	const now = Date.now();
	let newStatus = now > exam.end_time ? 2 : (now >= exam.start_time ? 1 : 0);

	if (exam.status !== newStatus) {
		await collection.doc(id).update({
			status: newStatus
		});
	}
}

// 删除考试
async function deleteExam(id) {
	if (!id) {
		return {
			code: 400,
			message: '考试ID不能为空'
		};
	}

	// 实际生产环境建议软删除
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
		title,
		status,
		start_time_range,
		page = 1,
		pageSize = 10,
		sortField = 'create_time',
		sortOrder = 'desc'
	} = params;

	const where = {};
	if (title) where.title = new RegExp(title, 'i');
	if (status !== undefined) where.status = status;

	// 时间范围查询
	if (start_time_range && start_time_range.length === 2) {
		where.start_time = dbCmd.and([
			dbCmd.gte(start_time_range[0]),
			dbCmd.lte(start_time_range[1])
		]);
	}

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
			list: res.data,
			total: countRes.total,
			page,
			pageSize
		}
	};
}

// 获取进行中的考试
async function getActiveExams(params = {}) {
	const {
		limit = 5
	} = params;
	const now = Date.now();

	const res = await collection
		.where({
			start_time: dbCmd.lte(now),
			end_time: dbCmd.gte(now),
			status: 1
		})
		.orderBy('end_time', 'asc') // 即将结束的排前面
		.limit(limit)
		.get();

	return {
		code: 200,
		data: res.data
	};
}

// 手动修改考试状态
async function changeExamStatus(id, status) {
	if (![0, 1, 2].includes(status)) {
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