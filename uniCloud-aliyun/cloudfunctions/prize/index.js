'use strict';
const db = uniCloud.database();
const prizeCollection = db.collection("prize");

exports.main = async (event, context) => {
	try {
		switch (event.action) {
			case 'getPrize':
				return await getPrize();
			case 'addPrize':
				return await addPrize(event);
			case 'updatePrize':
				return await updatePrize(event);
			case 'deletePrize':
				return await deletePrize(event);
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
async function getPrize() {
	const res = await prizeCollection.get();
	return {
		code: 200,
		data: res.data
	};
}

// 添加奖品
async function addPrize(event) {
	const {
		img,
		title,
		bgColor,
		color
	} = event;
	if (!img || !title) {
		return {
			code: 400,
			message: 'img和title为必填字段'
		};
	}

	const res = await prizeCollection.add({
		img,
		title,
		bgColor: bgColor || '#ffffff',
		color: color || '#000000',
		createdAt: Date.now()
	});

	return {
		code: 200,
		id: res.id,
		message: '添加成功'
	};
}

// 更新奖品
async function updatePrize(event) {
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

	const res = await prizeCollection.doc(_id).update(updateData);
	return {
		code: 200,
		updated: res.updated,
		message: '更新成功'
	};
}

// 删除奖品
async function deletePrize(event) {
	const {
		_id
	} = event;
	if (!_id) {
		return {
			code: 400,
			message: '_id不能为空'
		};
	}

	const res = await prizeCollection.doc(_id).remove();
	return {
		code: 200,
		deleted: res.deleted,
		message: '删除成功'
	};
}