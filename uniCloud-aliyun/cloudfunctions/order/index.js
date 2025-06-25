'use strict';
const db = uniCloud.database();
const orderCollection = db.collection("order");

exports.main = async (event, context) => {
	try {
		switch (event.action) {
			case 'getOrder':
				return await getOrder();
			case 'addOrder':
				return await addOrder(event);
			case 'updateOrder':
				return await updateOrder(event);
			case 'deleteOrder':
				return await deleteOrder(event);
			case 'importOrders':
				return await importOrders(event);
			case 'clearOrders':
				return await clearOrders();
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
async function getOrder() {
	const res = await orderCollection.get();
	return {
		code: 200,
		data: res.data
	};
}

// 添加奖品
async function addOrder(event) {
	const {
		serial,
		img,
		title,
		desc
	} = event;
	if (!serial || !img || !desc || !title) {
		return {
			code: 400,
			message: 'img和title为必填字段'
		};
	}

	const res = await orderCollection.add({
		serial,
		img,
		title,
		desc
	});

	return {
		code: 200,
		id: res.id,
		message: '添加成功'
	};
}

// 更新奖品
async function updateOrder(event) {
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

	const res = await orderCollection.doc(_id).update(updateData);
	return {
		code: 200,
		updated: res.updated,
		message: '更新成功'
	};
}

// 删除奖品
async function deleteOrder(event) {
	const {
		_id
	} = event;
	if (!_id) {
		return {
			code: 400,
			message: '_id不能为空'
		};
	}

	const res = await orderCollection.doc(_id).remove();
	return {
		code: 200,
		deleted: res.deleted,
		message: '删除成功'
	};
}

// 导入订单
async function importOrders(event) {
	const {
		orders
	} = event;
	if (!orders || !Array.isArray(orders) || orders.length === 0) {
		return {
			code: 400,
			message: '订单数据不能为空'
		};
	}

	// 验证数据格式
	const validOrders = orders.filter(order =>
		order.serial && order.img && order.title && order.desc
	);

	if (validOrders.length === 0) {
		return {
			code: 400,
			message: '没有有效的订单数据'
		};
	}

	// 批量添加订单
	const res = await orderCollection.add(validOrders);
	return {
		code: 200,
		imported: res.ids.length,
		message: `成功导入${res.ids.length}条订单`
	};
}

// 清空订单
async function clearOrders() {
	// 获取所有订单ID
	const allOrders = await orderCollection.get();
	const ids = allOrders.data.map(order => order._id);

	if (ids.length === 0) {
		return {
			code: 200,
			deleted: 0,
			message: '没有可删除的订单'
		};
	}

	// 批量删除
	const res = await orderCollection.where({
		_id: db.command.in(ids)
	}).remove();

	return {
		code: 200,
		deleted: res.deleted,
		message: `成功删除${res.deleted}条订单`
	};
}