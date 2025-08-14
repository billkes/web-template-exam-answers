'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('appx-template-exam-records');

exports.main = async (event, context) => {
	const {
		action,
		params
	} = event;

	try {
		switch (action) {
			case 'list':
				return await getRecordList(params);
			case 'detail':
				return await getRecordDetail(params.id);
			case 'add':
				return await addRecord(params);
			case 'update':
				return await updateRecord(params);
			case 'delete':
				return await deleteRecord(params.id);
			case 'userPaperRecords':
				return await getUserPaperRecords(params.user_id, params.paper_id, params.limit);
			case 'batchAdd':
				return await batchAddRecords(params);
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

// 获取考试记录列表
async function getRecordList(params = {}) {
	const {
		user_id,
		exam_id,
		question_id,
		is_correct,
		keyword,
		page = 1,
		pageSize = 10,
		sortField = 'answer_time',
		sortOrder = 'desc'
	} = params;

	const where = {};
	if (user_id) where.user_id = user_id;
	if (exam_id) where.exam_id = exam_id;
	if (question_id) where.question_id = question_id;
	if (is_correct !== undefined) where.is_correct = is_correct;

	// 使用聚合查询关联用户、考试、题目表获取名称
	const aggregate = db.collection('appx-template-exam-records')
		.aggregate()
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
		.lookup({
			from: 'appx-template-exam-questions',
			localField: 'question_id',
			foreignField: '_id',
			as: 'question_info'
		})
		.addFields({
			user_name: {
				$arrayElemAt: ['$user_info.username', 0]
			},
			exam_name: {
				$arrayElemAt: ['$exam_info.name', 0]
			},
			question_content: {
				$arrayElemAt: ['$question_info.content', 0]
			}
		})
		.project({
			user_info: 0,
			exam_info: 0,
			question_info: 0
		})
		.sort({
			[sortField]: sortOrder === 'desc' ? -1 : 1
		})
		.skip((page - 1) * pageSize)
		.limit(pageSize);

	// 如果有关键词搜索，添加搜索条件
	if (keyword) {
		aggregate.match({
			$or: [
				{ user_name: new RegExp(keyword, 'i') },
				{ exam_name: new RegExp(keyword, 'i') },
				{ question_content: new RegExp(keyword, 'i') }
			]
		});
	}

	const res = await aggregate.end();
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

// 获取考试记录详情
async function getRecordDetail(id) {
	if (!id) {
		return {
			code: 400,
			message: '记录ID不能为空'
		};
	}

	const res = await collection.doc(id).get();

	if (!res.data || res.data.length === 0) {
		return {
			code: 404,
			message: '记录不存在'
		};
	}

	return {
		code: 200,
		data: res.data[0]
	};
}

// 添加考试记录
async function addRecord(data) {
	const requiredFields = ['user_id', 'exam_id', 'question_id'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	// 处理answer字段
	if (Array.isArray(data.answer)) {
		data.answer = JSON.stringify(data.answer);
	}

	// 设置默认值
	data.answer_time = Date.now();
	data.is_correct = data.is_correct !== undefined ? data.is_correct : false;
	data.score = data.score || 0;

	const res = await collection.add(data);

	return {
		code: 200,
		data: {
			id: res.id
		},
		message: '添加成功'
	};
}

// 更新考试记录
async function updateRecord(data) {
	if (!data._id) {
		return {
			code: 400,
			message: '记录ID不能为空'
		};
	}

	const id = data._id;
	delete data._id;

	// 处理answer字段
	if (data.answer && Array.isArray(data.answer)) {
		data.answer = JSON.stringify(data.answer);
	}

	const res = await collection.doc(id).update(data);

	if (res.updated === 0) {
		return {
			code: 404,
			message: '记录不存在或未更新'
		};
	}

	return {
		code: 200,
		message: '更新成功'
	};
}

// 删除考试记录
async function deleteRecord(id) {
	if (!id) {
		return {
			code: 400,
			message: '记录ID不能为空'
		};
	}

	const res = await collection.doc(id).remove();

	if (res.deleted === 0) {
		return {
			code: 404,
			message: '记录不存在或删除失败'
		};
	}

	return {
		code: 200,
		message: '删除成功'
	};
}

// 获取用户某试卷的考试记录
async function getUserPaperRecords(user_id, paper_id, limit = 5) {
	if (!user_id || !paper_id) {
		return {
			code: 400,
			message: '用户ID和试卷ID不能为空'
		};
	}

	const res = await collection
		.where({
			user_id,
			exam_id: paper_id
		})
		.orderBy('answer_time', 'desc')
		.limit(limit)
		.get();

	return {
		code: 200,
		data: res.data
	};
}

// 批量添加考试记录
async function batchAddRecords(data) {
	if (!Array.isArray(data) || data.length === 0) {
		return {
			code: 400,
			message: '请提供有效的记录数据'
		};
	}

	// 处理每条记录的answer字段
	const records = data.map(record => {
		if (Array.isArray(record.answer)) {
			record.answer = JSON.stringify(record.answer);
		}
		record.answer_time = record.answer_time || Date.now();
		return record;
	});

	const res = await collection.add(records);

	return {
		code: 200,
		data: {
			ids: res.ids,
			inserted: res.inserted
		},
		message: '批量添加成功'
	};
}