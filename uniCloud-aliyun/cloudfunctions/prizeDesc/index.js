'use strict';
const db = uniCloud.database();
const prizeDescCollection = db.collection("prizeDesc");

exports.main = async (event, context) => {
	try {
		switch (event.action) {
			case 'getPrizeDescList':
				return await getPrizeDescList();
			case 'addPrizeDesc':
				return await addPrizeDesc(event);
			case 'updatePrizeDesc':
				return await updatePrizeDesc(event);
			case 'deletePrizeDesc':
				return await deletePrizeDesc(event);
			default:
				return {
					code: 400,
						message: '无效的操作类型'
				};
		}
	} catch (e) {
		console.error(e);
		return {
			code: 500,
			message: '服务器错误: ' + e.message
		};
	}
};

// 获取奖品描述列表（按order排序）
async function getPrizeDescList() {
	const res = await prizeDescCollection.orderBy('order', 'asc').get();
	return {
		code: 200,
		data: res.data
	};
}

// 添加奖品描述
async function addPrizeDesc(event) {
	const {
		content,
		order
	} = event;
	if (order === undefined) {
		return {
			code: 400,
			message: 'content和order为必填字段'
		};
	}

	const res = await prizeDescCollection.add({
		content,
		order: Number(order),
		createdAt: Date.now()
	});

	return {
		code: 200,
		id: res.id,
		message: '添加成功'
	};
}

// 更新奖品描述
async function updatePrizeDesc(event) {
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

	if (updateData.order !== undefined) {
		updateData.order = Number(updateData.order);
	}

	const res = await prizeDescCollection.doc(_id).update(updateData);
	return {
		code: 200,
		updated: res.updated,
		message: '更新成功'
	};
}

// 删除奖品描述
async function deletePrizeDesc(event) {
	const {
		_id
	} = event;
	if (!_id) {
		return {
			code: 400,
			message: '_id不能为空'
		};
	}

	const res = await prizeDescCollection.doc(_id).remove();
	return {
		code: 200,
		deleted: res.deleted,
		message: '删除成功'
	};
}