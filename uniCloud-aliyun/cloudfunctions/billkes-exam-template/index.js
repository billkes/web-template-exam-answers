'use strict';

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	// 根据event中的action参数执行不同操作
	const { action, params } = event;
	
	switch(action) {
		case 'register':
			return await register(params);
		case 'login':
			return await login(params);
		case 'getUserInfo':
			return await getUserInfo(params, context);
		default:
			return {
				code: 400,
				message: '未知的操作'
			}
	}
};

// 注册功能
async function register(params) {
	try {
		// 直接调用uni-id-co云对象的注册方法
		const res = await uniCloud.callFunction({
			name: 'uni-id-co',
			data: {
				action: 'register',
				params: params
			}
		});
		return res.result;
	} catch (error) {
		return {
			code: 500,
			message: '注册失败: ' + error.message
		}
	}
}

// 登录功能
async function login(params) {
	try {
		// 直接调用uni-id-co云对象的登录方法
		const res = await uniCloud.callFunction({
			name: 'uni-id-co',
			data: {
				action: 'login',
				params: params
			}
		});
		return res.result;
	} catch (error) {
		return {
			code: 500,
			message: '登录失败: ' + error.message
		}
	}
}

// 获取用户信息功能
async function getUserInfo(params, context) {
	try {
		// 直接调用uni-id-co云对象的获取用户信息方法
		const res = await uniCloud.callFunction({
			name: 'uni-id-co',
			data: {
				action: 'getUserInfo',
				params: params
			},
			// 传递客户端信息
			headers: {
				'uni-id-token': context.headers && context.headers['uni-id-token']
			}
		});
		return res.result;
	} catch (error) {
		return {
			code: 500,
			message: '获取用户信息失败: ' + error.message
		}
	}
}