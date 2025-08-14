'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('appx-template-exam-questions');

exports.main = async (event, context) => {
	const {
		action,
		params
	} = event;

	try {
		console.log(action);
		switch (action) {
			case 'create':
				return await createQuestion(params);
			case 'batchCreate':
				return await batchCreateQuestions(params.list);
			case 'update':
				return await updateQuestion(params);
			case 'delete':
				return await deleteQuestion(params.id);
			case 'get':
				return await getQuestion(params.id);
			case 'list':
				return await getQuestionList(params);
			case 'getExamQuestions':
				return await getExamQuestions(params.exam_id, params.type);
			case 'validateAnswer':
				return await validateAnswer(params.question_id, params.user_answer);
			default:
				return {
					code: 400,
						message: '无效的操作类型'
				};
		}
	} catch (error) {
		console.error('题目管理云函数错误:', error);
		return {
			code: 500,
			message: '服务器内部错误',
			error: error.message
		};
	}
};

// 创建题目
async function createQuestion(data) {
	const requiredFields = ['exam_id', 'content', 'type', 'score', 'options'];
	const missingFields = requiredFields.filter(field => !data[field]);

	if (missingFields.length > 0) {
		return {
			code: 400,
			message: `缺少必填字段: ${missingFields.join(', ')}`
		};
	}

	// 验证选项结构
	if (!validateOptions(data.options, data.type)) {
		return {
			code: 400,
			message: '选项格式不符合题目类型要求'
		};
	}

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

// 批量创建题目
async function batchCreateQuestions(questions) {
	if (!Array.isArray(questions)) {
		return {
			code: 400,
			message: '参数必须是题目数组'
		};
	}

	// 验证每个题目
	const validQuestions = [];
	for (const q of questions) {
		if (validateOptions(q.options, q.type)) {
			validQuestions.push({
				...q,
				create_time: Date.now()
			});
		}
	}

	if (validQuestions.length === 0) {
		return {
			code: 400,
			message: '无有效题目数据'
		};
	}

	const res = await collection.add(validQuestions);

	return {
		code: 200,
		data: {
			inserted: res.ids.length
		},
		message: `成功导入${res.ids.length}道题目`
	};
}


// 更新题目
async function updateQuestion(data) {
	if (!data._id) {
		return {
			code: 400,
			message: '题目ID不能为空'
		};
	}

	const id = data._id;
	delete data._id;

	// 禁止修改的字段
	delete data.create_time;
	delete data.exam_id; // 不允许迁移题目到其他考试

	// 验证选项结构
	if (data.options && !validateOptions(data.options, data.type || undefined)) {
		return {
			code: 400,
			message: '选项格式不符合题目类型要求'
		};
	}

	const res = await collection.doc(id).update(data);

	if (res.updated === 0) {
		return {
			code: 404,
			message: '题目不存在或数据未变更'
		};
	}

	return {
		code: 200,
		message: '更新成功'
	};
}

// 删除题目
async function deleteQuestion(id) {
	if (!id) {
		return {
			code: 400,
			message: '题目ID不能为空'
		};
	}

	// 生产环境建议先检查是否有答题记录
	const answerCount = await db.collection('appx-template-exam-answer-records')
		.where({
			question_id: id
		})
		.count();

	if (answerCount.total > 0) {
		return {
			code: 403,
			message: '该题目已有答题记录，不可删除'
		};
	}

	const res = await collection.doc(id).remove();

	if (res.deleted === 0) {
		return {
			code: 404,
			message: '题目不存在'
		};
	}

	return {
		code: 200,
		message: '删除成功'
	};
}

// 获取题目详情
async function getQuestion(id) {
	if (!id) {
		return {
			code: 400,
			message: '题目ID不能为空'
		};
	}

	const res = await collection.doc(id).get();

	if (!res.data || res.data.length === 0) {
		return {
			code: 404,
			message: '题目不存在'
		};
	}

	// 获取题目详情时不隐藏正确答案，因为管理后台需要查看
	const question = res.data[0];
	
	return {
		code: 200,
		data: question
	};
}

// 获取题目列表（分页+筛选）
async function getQuestionList(params = {}) {
	const {
		exam_id,
		type,
		keyword,
		page = 1,
		pageSize = 10,
		sortField = 'create_time',
		sortOrder = 'desc'
	} = params;

	const where = {};
	if (exam_id) where.exam_id = exam_id;
	if (type) where.type = type;
	if (keyword) where.content = new RegExp(keyword, 'i');

	// 使用聚合查询关联考试表获取考试名称
	const aggregate = db.collection('appx-template-exam-questions')
		.aggregate()
		.match(where)
		.lookup({
			from: 'appx-template-exam-exams',
			localField: 'exam_id',
			foreignField: '_id',
			as: 'exam_info'
		})
		.addFields({
			exam_name: {
				$arrayElemAt: ['$exam_info.name', 0]
			}
		})
		.project({
			exam_info: 0 // 移除临时字段，只保留exam_name
		})
		.sort({
			[sortField]: sortOrder === 'desc' ? -1 : 1
		})
		.skip((page - 1) * pageSize)
		.limit(pageSize);

	const res = await aggregate.end();
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

// 获取考试下的所有题目
async function getExamQuestions(exam_id, type) {
	if (!exam_id) {
		return {
			code: 400,
			message: '考试ID不能为空'
		};
	}

	const where = {
		exam_id
	};
	if (type) where.type = type;

	// 使用聚合查询关联考试表获取考试名称
	const aggregate = db.collection('appx-template-exam-questions')
		.aggregate()
		.match(where)
		.lookup({
			from: 'appx-template-exam-exams',
			localField: 'exam_id',
			foreignField: '_id',
			as: 'exam_info'
		})
		.addFields({
			exam_name: {
				$arrayElemAt: ['$exam_info.name', 0]
			}
		})
		.project({
			exam_info: 0
		})
		.sort({
			create_time: 1
		});

	const res = await aggregate.end();

	return {
		code: 200,
		data: res.data
	};
}

// 验证用户答案
async function validateAnswer(question_id, user_answer) {
	if (!question_id || user_answer === undefined) {
		return {
			code: 400,
			message: '参数不完整'
		};
	}

	const question = (await collection.doc(question_id).get()).data[0];
	if (!question) {
		return {
			code: 404,
			message: '题目不存在'
		};
	}

	let isCorrect = false;
	const correctAnswers = question.options
		.filter(opt => opt.is_correct)
		.map(opt => opt.id);

	// 根据题目类型验证答案
	if (question.type === 1) { // 单选
		isCorrect = correctAnswers.length === 1 &&
			correctAnswers[0] === user_answer;
	} else { // 多选
		const userAnswers = Array.isArray(user_answer) ?
			user_answer : [user_answer];
		isCorrect = correctAnswers.length === userAnswers.length &&
			correctAnswers.every(id => userAnswers.includes(id));
	}

	return {
		code: 200,
		data: {
			is_correct: isCorrect,
			correct_answers: correctAnswers,
			score: isCorrect ? question.score : 0
		}
	};
}

// 验证选项结构
function validateOptions(options, questionType) {
	if (!Array.isArray(options)) {
		return false;
	}

	// 检查每个选项的结构
	const isValid = options.every(opt => {
		return opt.key && opt.value && typeof opt.key === 'string' && typeof opt.value === 'string';
	});

	// 对于选择题，至少需要2个选项
	if ((questionType === 'single' || questionType === 'multiple') && options.length < 2) {
		return false;
	}

	return isValid;
}