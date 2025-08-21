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

        const registerRes = JSON.stringify(res, null, 2);

        // const registerRes = {
        //     "statusCode": 400,
        //     "header": {
        //         "date": "Thu, 21 Aug 2025 08:29:06 GMT",
        //         "content-type": "application/json;charset=UTF-8",
        //         "transfer-encoding": "chunked",
        //         "connection": "keep-alive",
        //         "set-cookie": [
        //             "aliyungf_tc=b920ed362133c80ae2ae73b55b7bcda22af79be4a926a25e9ff7f9fc00866d60; Path=/; HttpOnly",
        //             "acw_tc=ac11000117557649463605436e0667302250c903450c47c20c307ac54d2bfe;path=/;HttpOnly;Max-Age=1800"
        //         ],
        //         "request-id": "ac1cc3151755764946483169779"
        //     },
        //     "data": {
        //         "success": false,
        //         "error": {
        //             "code": "PrePayResourceExhausted",
        //             "message": "FC invoke failed, resource exhausted."
        //         }
        //     }
        // }

        console.log('registerRes: ', registerRes);

        // 检查注册结果
        if (registerRes.result.code !== 0) {
            return registerRes.result;
        }

        // 2. 注册成功后，在考生表中创建对应的记录
        const userId = registerRes.result.uid;

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
            uid: registerRes.result.uid,
            token: registerRes.result.token,
            tokenExpired: registerRes.result.tokenExpired
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

        // 调用uni-id-co云对象的登录方法
        const res = await uniCloud.callFunction({
            name: 'uni-id-co',
            data: {
                action: 'login',
                params: loginParams
            }
        });
        return res.result;
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

        // 调用uni-id-co云对象验证token并获取用户信息
        const userInfoRes = await uniCloud.callFunction({
            name: 'uni-id-co',
            data: {
                action: 'getUserInfo',
                params: {}
            },
            headers: {
                'uni-id-token': token
            }
        });

        console.log('userInfoRes: ', userInfoRes);

        // 检查token验证结果
        if (userInfoRes.result.code !== 0) {
            return userInfoRes.result;
        }

        const userId = userInfoRes.result.uid;

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