'use strict';
const uniID = require('uni-id-common')

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	// 初始化uni-id-common实例
	const uniIdCommon = uniID.createInstance({
		clientInfo: context.CLIENTAPPS[0]
	})
	
	// 根据event中的action参数执行不同操作
	const { action, params } = event;
	
	switch(action) {
		case 'register':
			return await register(uniIdCommon, params);
		case 'login':
			return await login(uniIdCommon, params);
		case 'getUserInfo':
			return await getUserInfo(uniIdCommon, params);
		default:
			return {
				code: 400,
				message: '未知的操作'
			}
	}
};

// 注册功能
async function register(uniIdCommon, params) {
	try {
		const res = await uniIdCommon.register(params);
		return res;
	} catch (error) {
		return {
			code: 500,
			message: '注册失败: ' + error.message
		}
	}
}

// 登录功能
async function login(uniIdCommon, params) {
	try {
		const res = await uniIdCommon.login(params);
		return res;
	} catch (error) {
		return {
			code: 500,
			message: '登录失败: ' + error.message
		}
	}
}

// 获取用户信息功能
async function getUserInfo(uniIdCommon, params) {
	try {
		const res = await uniIdCommon.getUserInfo(params);
		return res;
	} catch (error) {
		return {
			code: 500,
			message: '获取用户信息失败: ' + error.message
		}
	}
}