'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('test_paper_settings');

exports.main = async (event, context) => {
	const {
		action,
		params
	} = event;

	try {
		switch (action) {
			case 'add':
				return await addPaperSettings(params);
			case 'update':
				return await updatePaperSettings(params);
			case 'delete':
				return await deletePaperSettings(params);
			case 'list':
				return await getPaperSettingsList(params);
			case 'detail':
				return await getPaperSettingsDetail(params);
			case 'batchDelete':
				return await batchDeletePaperSettings(params);
			default:
				return {
					code: 400,
						message: '未知操作'
				};
		}
	} catch (e) {
		return {
			code: 500,
			message: e.message
		};
	}
};

// 添加批量删除函数
async function batchDeletePaperSettings(params) {
	const {
		ids
	} = params;

	// 验证参数
	if (!ids || !Array.isArray(ids)) {
		return {
			code: 400,
			message: '参数错误：缺少有效的ID数组'
		};
	}

	if (ids.length === 0) {
		return {
			code: 400,
			message: '请提供要删除的ID列表'
		};
	}

	try {
		// 使用in操作符批量删除
		const res = await collection.where({
			_id: dbCmd.in(ids)
		}).remove();

		return {
			code: 200,
			data: {
				deleted: res.deleted,
				ids: ids
			},
			message: `成功删除${res.deleted}条记录`
		};
	} catch (e) {
		return {
			code: 500,
			message: `批量删除失败: ${e.message}`
		};
	}
}

// 添加试卷设置
async function addPaperSettings(data) {
	// 检查考试编号是否已存在
	if (data.code) {
		const codeExist = await collection.where({
			code: data.code
		}).count();

		if (codeExist.total > 0) {
			return {
				code: 400,
				message: '该考试编号已存在'
			};
		}
	}

	// 添加创建时间
	data.create_time = Date.now();

	const res = await collection.add(data);
	return {
		code: 200,
		data: res.id,
		message: '添加成功'
	};
}

// 更新试卷设置
async function updatePaperSettings(data) {
	const {
		_id,
		...updateData
	} = data;

	// 检查考试编号是否已被其他试卷使用
	if (updateData.code) {
		const codeExist = await collection.where({
			code: updateData.code,
			_id: dbCmd.neq(_id)
		}).count();

		if (codeExist.total > 0) {
			return {
				code: 400,
				message: '该考试编号已被其他试卷使用'
			};
		}
	}

	// 添加修改时间
	updateData.modify_time = Date.now();

	const res = await collection.doc(_id).update(updateData);
	return {
		code: 200,
		data: res.updated,
		message: '更新成功'
	};
}

// 删除试卷设置
async function deletePaperSettings(params) {
	const res = await collection.doc(params.id).remove();
	return {
		code: 200,
		data: res.deleted,
		message: '删除成功'
	};
}

// 获取试卷设置列表
async function getPaperSettingsList(params) {
	const {
		pageNum = 1, pageSize = 10, ...query
	} = params;
	const skip = (pageNum - 1) * pageSize;

	const where = {};
	if (query.code) {
		where.code = new RegExp(query.code, 'i');
	}
	if (query.name) {
		where.name = new RegExp(query.name, 'i');
	}

	const countResult = await collection.where(where).count();
	const dataResult = await collection.where(where)
		.orderBy('create_time', 'desc')
		.skip(skip)
		.limit(pageSize)
		.get();

	return {
		code: 200,
		data: {
			rows: dataResult.data,
			total: countResult.total,
			pageNum,
			pageSize
		}
	};
}

// 获取试卷设置详情
async function getPaperSettingsDetail(params) {
	const data = await collection.doc(params.id).get();
	return {
		code: 200,
		data: data.data[0] || null
	};
}