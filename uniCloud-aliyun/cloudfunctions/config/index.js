'use strict';
const db = uniCloud.database();
const configCollection = db.collection("config");

exports.main = async (event, context) => {
	try {
		switch (event.action) {
			case 'getConfig':
				return await getConfig();
			case 'addConfig':
				return await addConfig(event);
			case 'updateConfig':
				return await updateConfig(event);
			case 'deleteConfig':
				return await deleteConfig(event);
			default:
				return {
					code: 400,
						message: 'Invalid action'
				};
		}
	} catch (e) {
		console.error(e);
		return {
			code: 500,
			message: 'Server error: ' + e.message
		};
	}
};

// 查询奖品列表
async function getConfig() {
	const res = await configCollection.get();
	return {
		code: 200,
		data: res.data
	};
}

// 添加奖品
async function addConfig(event) {
	const {
		label,
		value
	} = event;
	if (!label || !value) {
		return {
			code: 400,
			message: 'img和title为必填字段'
		};
	}

	const res = await configCollection.add({
		label,
		value,
	});

	return {
		code: 200,
		id: res.id,
		message: '添加成功'
	};
}

// 更新奖品
async function updateConfig(event) {
	const {
		_id,
		...updateData
	} = event;
	if (!_id) {
		return {
			code: 400,
			message: '_id不能为空'
		};
	}

	const res = await configCollection.doc(_id).update(updateData);
	return {
		code: 200,
		updated: res.updated,
		message: '更新成功'
	};
}

// 删除奖品
async function deleteConfig(event) {
	const {
		_id
	} = event;
	if (!_id) {
		return {
			code: 400,
			message: '_id不能为空'
		};
	}

	const res = await configCollection.doc(_id).remove();
	return {
		code: 200,
		deleted: res.deleted,
		message: '删除成功'
	};
}