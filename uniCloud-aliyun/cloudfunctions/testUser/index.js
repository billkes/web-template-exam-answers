'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('test_user');

exports.main = async (event, context) => {
	const {
		action,
		params
	} = event;

	try {
		switch (action) {
			case 'add':
				return await addUser(params);
			case 'update':
				return await updateUser(params);
			case 'delete':
				return await deleteUser(params);
			case 'list':
				return await getUserList(params);
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

// 添加用户
async function addUser(data) {
	// 检查身份证号是否已存在
	const idCardExist = await collection.where({
		id_card: data.id_card
	}).count();

	if (idCardExist.total > 0) {
		return {
			code: 400,
			message: '该身份证号已存在'
		};
	}

	// 检查手机号是否已存在
	const phoneExist = await collection.where({
		phone: data.phone
	}).count();

	if (phoneExist.total > 0) {
		return {
			code: 400,
			message: '该手机号已存在'
		};
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

// 更新用户
async function updateUser(data) {
	const {
		_id,
		...updateData
	} = data;

	// 检查身份证号是否已被其他用户使用
	if (updateData.id_card) {
		const idCardExist = await collection.where({
			id_card: updateData.id_card,
			_id: dbCmd.neq(_id)
		}).count();

		if (idCardExist.total > 0) {
			return {
				code: 400,
				message: '该身份证号已被其他用户使用'
			};
		}
	}

	// 检查手机号是否已被其他用户使用
	if (updateData.phone) {
		const phoneExist = await collection.where({
			phone: updateData.phone,
			_id: dbCmd.neq(_id)
		}).count();

		if (phoneExist.total > 0) {
			return {
				code: 400,
				message: '该手机号已被其他用户使用'
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

// 删除用户
async function deleteUser(params) {
	const res = await collection.doc(params.id).remove();
	return {
		code: 200,
		data: res.deleted,
		message: '删除成功'
	};
}

// 获取用户列表
async function getUserList(params) {
	const {
		pageNum = 1, pageSize = 10
	} = params;
	const skip = (pageNum - 1) * pageSize;

	const countResult = await collection.count();
	const dataResult = await collection
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