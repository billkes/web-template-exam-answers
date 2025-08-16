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
			case 'getMyExamStatistics':
				return await getMyExamStatistics(params);
			case 'getMyExamList':
				return await getMyExamList(params);
			case 'getRandomExams':
				return await getRandomExams(params);
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

// 获取我的考试统计数据
async function getMyExamStatistics(params = {}) {
	const {
		user_id
	} = params;

	// 验证user_id为必传参数
	if (!user_id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	try {
		// 基础统计
		const totalExams = await collection.count();

		// 状态统计
		const activeExams = await collection.where({
			status: 1,
			start_time: {
				$lte: new Date().toISOString()
			},
			end_time: {
				$gte: new Date().toISOString()
			}
		}).count();

		const upcomingExams = await collection.where({
			status: 0,
			start_time: {
				$gt: new Date().toISOString()
			}
		}).count();

		const endedExams = await collection.where({
			$or: [{
					status: 2
				},
				{
					end_time: {
						$lt: new Date().toISOString()
					}
				}
			]
		}).count();

		// 题目和总分统计
		const questionsCollection = db.collection('appx-template-exam-questions');
		const questionsAgg = await questionsCollection.aggregate()
			.group({
				_id: null,
				totalQuestions: {
					$sum: 1
				},
				totalScore: {
					$sum: '$score'
				}
			})
			.end();

		const result = {
			totalExams: totalExams.total || 0,
			activeExams: activeExams.total || 0,
			upcomingExams: upcomingExams.total || 0,
			endedExams: endedExams.total || 0,
			totalQuestions: questionsAgg.data[0]?.totalQuestions || 0,
			totalScore: questionsAgg.data[0]?.totalScore || 0
		};

		return {
			code: 200,
			data: result
		};
	} catch (error) {
		console.error('获取考试统计数据失败:', error);
		return {
			code: 500,
			message: '获取统计数据失败',
			error: error.message
		};
	}
}

// 获取我的考试列表（用户已报名/关联的考试）
async function getMyExamList(params = {}) {
	const {
		user_id,
		keyword,
		status,
		page = 1,
		pageSize = 10,
		sortField = 'create_time',
		sortOrder = 'desc'
	} = params;

	// 验证user_id为必传参数
	if (!user_id) {
		return {
			code: 400,
			message: '用户ID不能为空'
		};
	}

	try {
		// 查询用户关联的考试ID列表（通过用户考试关联表）
		const userExamCollection = db.collection('appx-template-exam-user-exams');
		const userExams = await userExamCollection
			.where({
				user_id
			})
			.field({
				exam_id: true,
				enrolled_time: true
			})
			.get();

		if (!userExams.data || userExams.data.length === 0) {
			return {
				code: 200,
				data: [],
				total: 0,
				page,
				pageSize
			};
		}

		// 提取考试ID列表
		const examIds = userExams.data.map(item => item.exam_id);

		// 构建查询条件
		const where = {
			_id: dbCmd.in(examIds)
		};

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

		// 获取考试列表并关联题目数量
		const aggregate = collection.aggregate()
			.match(where)
			.lookup({
				from: 'appx-template-exam-questions',
				localField: '_id',
				foreignField: 'exam_id',
				as: 'questions_info'
			})
			.lookup({
				from: 'appx-template-exam-user-exams',
				localField: '_id',
				foreignField: 'exam_id',
				as: 'user_enrollment'
			})
			.addFields({
				questions: {
					$size: '$questions_info'
				},
				totalScore: {
					$sum: '$questions_info.score'
				},
				enrolled_time: {
					$arrayElemAt: ['$user_enrollment.enrolled_time', 0]
				}
			})
			.project({
				questions_info: 0,
				user_enrollment: 0
			})
			.sort({
				[sortField]: sortOrder === 'desc' ? -1 : 1
			})
			.skip((page - 1) * pageSize)
			.limit(pageSize);

		const res = await aggregate.end();
		const countRes = await collection.where(where).count();

		// 格式化数据以匹配前端期望的结构
		const formattedData = res.data.map(item => ({
			_id: item._id,
			title: item.name,
			description: item.description,
			start_time: item.start_time,
			end_time: item.end_time,
			duration: item.duration,
			status: item.status,
			create_time: new Date(item.create_time).toISOString(),
			questions: item.questions || 0,
			totalScore: item.totalScore || 0,
			enrolled_time: item.enrolled_time ? new Date(item.enrolled_time).toISOString() : null
		}));

		return {
			code: 200,
			data: formattedData,
		};
	} catch (error) {
		console.error('获取我的考试列表失败:', error);
		return {
			code: 500,
			message: '获取考试列表失败',
			error: error.message
		};
	}
}

// 获取随机考试列表（游客模式）
async function getRandomExams(params = {}) {
	const {
		num = 3, status
	} = params;

	try {
		const where = {};
		if (status !== undefined) where.status = status;

		// 获取随机考试
		const aggregate = collection.aggregate()
			.match(where)
			.lookup({
				from: 'appx-template-exam-questions',
				localField: '_id',
				foreignField: 'exam_id',
				as: 'questions_info'
			})
			.addFields({
				questions: {
					$size: '$questions_info'
				},
				totalScore: {
					$sum: '$questions_info.score'
				}
			})
			.project({
				questions_info: 0
			})
			.sample({
				size: parseInt(num)
			});

		const res = await aggregate.end();

		// 格式化数据
		const formattedData = res.data.map(item => ({
			_id: item._id,
			title: item.name,
			description: item.description,
			start_time: item.start_time,
			end_time: item.end_time,
			duration: item.duration,
			status: item.status,
			create_time: new Date(item.create_time).toISOString(),
			questions: item.questions || 0,
			totalScore: item.totalScore || 0
		}));

		return {
			code: 200,
			data: formattedData
		};
	} catch (error) {
		console.error('获取随机考试失败:', error);
		return {
			code: 500,
			message: '获取随机考试失败',
			error: error.message
		};
	}
}