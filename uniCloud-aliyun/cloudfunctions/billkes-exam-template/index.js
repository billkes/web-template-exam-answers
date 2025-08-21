'use strict';

const path = 'https://fc-mp-665b39da-da04-46f3-ad6a-a354ecc1dbfc.next.bspapp.com'


exports.main = async (event, context) => {
    //event为客户端上传的参数
    console.log('event : ', event)

    // 根据event中的action参数执行不同操作
    const {action, params} = event;

    switch (action) {
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
        // 1. 调用uni-id-co云对象的注册方法创建系统用户
        // 明确构造参数对象，避免可能的迭代器问题
        const registerParams = {
            username: params.username,
            password: params.password,
            captcha: params.captcha,
            scene: 'register'  // 添加场景参数
        };

        const res = await uniCloud.request({
            url: `${path}/uni-id-co/register`,
            method: 'POST',
            data: {
                clientInfo: params.clientInfo,
                params: registerParams
            },
            header: {
                'Content-Type': 'application/json'
            }
        })

        console.log('registerRes: ', JSON.stringify(res, null, 2));

        // 检查注册结果 - 根据实际响应结构调整判断逻辑
        if (!res.data || !res.data.success) {
            // 处理注册失败的情况
            return {
                code: res.data?.error?.code || 500,
                message: res.data?.error?.message || '注册失败'
            };
        }

        // 2. 注册成功后，在考生表中创建对应的记录
        // 从响应数据中正确提取用户ID
        const userId = res.data.uid;

        // 构造考生表记录对象，使用数据库的时间戳字段
        const examUserData = {
            user_id: userId,
            username: params.username,
            email: params.email || '',
            nickname: params.nickname || params.username,
            status: 1, // 默认启用状态
            created_date: new Date(),
            updated_date: new Date()
        };

        const examUserRes = await uniCloud.database().collection('exam-users').add(examUserData);

        console.log('examUserRes: ', examUserRes);

        // 返回注册结果，包含token等信息
        return {
            code: 0,
            message: '注册成功',
            uid: res.data.uid,
            token: res.data.token,
            tokenExpired: res.data.tokenExpired
        };
    } catch (error) {
        console.error('注册失败: ', error);
        return {
            code: 500,
            message: '注册失败: ' + error.message
        }
    }
}

// 登录功能
async function login(params) {
    try {
        // 构造登录参数
        const loginParams = {
            username: params.username,
            password: params.password
        };

        // 调用uni-id-co云对象的登录方法 - 使用URL适配方式
        const res = await uniCloud.request({
            url: `${path}/uni-id-co/login`,
            method: 'POST',
            data: {
                clientInfo: params.clientInfo,
                params: loginParams
            },
            header: {
                'Content-Type': 'application/json'
            }
        });

        console.log('loginRes: ', JSON.stringify(res, null, 2));

        // 检查登录结果 - 根据实际响应结构调整判断逻辑
        if (!res.data || !res.data.success) {
            // 处理登录失败的情况
            return {
                code: res.data?.error?.code || 500,
                message: res.data?.error?.message || '登录失败'
            };
        }

        // 返回登录结果，包含token等信息
        return {
            code: 0,
            message: '登录成功',
            uid: res.data.uid,
            token: res.data.token,
            tokenExpired: res.data.tokenExpired
        };
    } catch (error) {
        console.error('登录失败: ', error);
        return {
            code: 500,
            message: '登录失败: ' + error.message
        }
    }
}

// 获取用户信息功能（获取考生表数据）
async function getUserInfo(params, context) {
    try {
        // 从请求头中获取用户token信息
        const token = context.headers && context.headers['uni-id-token'];
        if (!token) {
            return {
                code: 401,
                message: '未提供有效的用户凭证'
            }
        }

        // 调用uni-id-co云对象验证token并获取用户信息 - 使用URL适配方式
        const userInfoRes = await uniCloud.request({
            url: `${path}/uni-id-co/getUserInfo`,
            method: 'POST',
            data: {
                clientInfo: params.clientInfo,
                params: {}
            },
            header: {
                'Content-Type': 'application/json',
                'uni-id-token': token
            }
        });

        console.log('userInfoRes: ', JSON.stringify(userInfoRes, null, 2));

        // 检查token验证结果 - 根据实际响应结构调整判断逻辑
        if (!userInfoRes.data || !userInfoRes.data.success) {
            // 处理获取用户信息失败的情况
            return {
                code: userInfoRes.data?.error?.code || 500,
                message: userInfoRes.data?.error?.message || '获取用户信息失败'
            };
        }

        const userId = userInfoRes.data.uid;

        // 查询考生表中的用户信息
        const examUserRes = await uniCloud.database()
            .collection('exam-users')
            .where({
                user_id: userId
            })
            .limit(1)
            .get();

        console.log('examUserRes: ', examUserRes);

        if (examUserRes.data && examUserRes.data.length > 0) {
            // 返回考生表数据
            return {
                code: 0,
                message: '获取用户信息成功',
                userInfo: examUserRes.data[0]
            };
        } else {
            return {
                code: 404,
                message: '未找到考生信息'
            };
        }
    } catch (error) {
        console.error('获取用户信息失败: ', error);
        return {
            code: 500,
            message: '获取用户信息失败: ' + error.message
        }
    }
}