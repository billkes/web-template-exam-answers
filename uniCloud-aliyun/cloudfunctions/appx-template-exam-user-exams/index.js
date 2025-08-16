
// 获取统计数据
async function getCount(params) {
	const { status } = params;
	
	const where = {};
	if (status !== undefined) {
		where.status = status;
	}

	try {
		const countRes = await collection.where(where).count();
		return {
			code: 200,
			data: {
				count: countRes.total || 0
			}
		};
	} catch (error) {
		console.error('获取统计数据错误:', error);
		return {
			code: 500,
			message: '获取统计数据失败',
			error: error.message
		};
	}
}