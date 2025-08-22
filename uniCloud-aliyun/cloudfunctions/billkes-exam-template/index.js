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
            return await getUserInfo(params);
        case 'getMyExamList':
            return await getMyExamList(params);
        case 'getRandomExamList':
            return await getRandomExamList(params);
        case 'registerExam':
            return await registerExam(params);
        case 'startExam':
            return await startExam(params);
        case 'continueExam':
            return await continueExam(params);
        case 'answerQuestion':
            return await answerQuestion(params);
        case 'submitExam':
            return await submitExam(params);
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
            nickname: params.nickname,
            username: params.username,
            password: params.password,
            captcha: params.captcha,
            scene: 'register'  // 添加场景参数
        };

        const res = await uniCloud.request({
            url: `${path}/uni-id-co/registerUser`,
            method: 'POST',
            data: {
                clientInfo: params.clientInfo,
                params: registerParams
            },
            header: {
                'Content-Type': 'application/json'
            }
        })

        console.log('registerRes: ', res);

        // 检查注册结果 - 根据实际响应结构调整判断逻辑
        // 支持两种判断方式：success字段或errCode字段
        if (!res.data || (res.data.errCode !== undefined && res.data.errCode !== 0)) {
            // 处理注册失败的情况
            return {
                code: res.data?.errCode || res.data?.code || 500,
                message: res.data?.errMsg || res.data?.msg || '注册失败'
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
        // 根据实际响应结构调整返回数据
        return {
            code: 0,
            message: '注册成功',
            uid: res.data.uid,
            token: res.data.newToken?.token,
            tokenExpired: res.data.newToken?.tokenExpired
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

        console.log('loginRes: ', res);

        // 检查登录结果 - 根据实际响应结构调整判断逻辑
        // 支持两种判断方式：success字段或errCode字段
        if (!res.data || (res.data.errCode !== undefined && res.data.errCode !== 0)) {
            // 处理登录失败的情况
            return {
                code: res.data?.errCode || res.data?.error?.code || 500,
                message: res.data?.errMsg || res.data?.error?.message || '登录失败'
            };
        }

        // 返回登录结果，包含token等信息
        return {
            code: 0,
            message: '登录成功',
            uid: res.data.uid,
            token: res.data.newToken.token,
            tokenExpired: res.data.newToken.tokenExpired
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
async function getUserInfo(params) {
    try {
        const token = params.uniIdToken;
        const uid = params.uid;
        if (!token || !uid) {
            return {
                code: 401,
                message: '未提供有效的用户凭证'
            }
        }

        // 调用uni-id-co云对象验证token并获取用户信息 - 使用URL适配方式
        const userInfoRes = await uniCloud.request({
            url: `${path}/uni-id-co/getAccountInfo`,
            method: 'POST',
            data: {
                clientInfo: params.clientInfo,
                uniIdToken: token,
                params: {}
            },
            header: {
                'Content-Type': 'application/json',
            }
        });

        console.log('userInfoRes: ', userInfoRes);

        // 检查token验证结果 - 根据实际响应结构调整判断逻辑
        // 支持两种判断方式：success字段或errCode字段
        if (!userInfoRes.data || (userInfoRes.data.errCode !== undefined && userInfoRes.data.errCode !== 0)) {
            // 处理获取用户信息失败的情况
            return {
                code: userInfoRes.data?.errCode || userInfoRes.data?.error?.code || 500,
                message: userInfoRes.data?.errMsg || userInfoRes.data?.error?.message || '获取用户信息失败'
            };
        }

        // 查询考生表中的用户信息
        const examUserRes = await uniCloud.database()
            .collection('exam-users')
            .where({
                user_id: uid
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

async function refreshToken(params) {
    const {token, clientInfo} = params
    if (!token || !clientInfo) {
        return false
    }

    // 调用uni-id-co云对象
    const res = await uniCloud.request({
        url: `${path}/uni-id-co/refreshToken`,
        method: 'POST',
        data: {
            clientInfo: params.clientInfo,
            uniIdToken: token,
            params: {}
        },
        header: {
            'Content-Type': 'application/json',
        }
    });

    console.log('res: ', res);
    return !(!res.data || (res.data.errCode !== undefined && res.data.errCode !== 0));
}

// 获取我的考试列表
async function getMyExamList(params) {
    try {
        const token = params.uniIdToken;
        const uid = params.uid;
        if (!token || !uid) {
            return {
                code: 401,
                message: '未提供有效的用户凭证'
            }
        }

        // 获取正在进行中的考试安排
        const currentTime = Date.now();
        const examSchedulesRes = await uniCloud.database()
            .collection('exam-schedules')
            .where({
                start_time: uniCloud.database().command.lt(currentTime),
                end_time: uniCloud.database().command.gt(currentTime),
                allowed_users: uniCloud.database().command.in(uid),
                status: 1 // 1表示进行中
            })
            .limit(params.limit || 10)
            .get();

        // 处理数据
        const examList = examSchedulesRes.data.map(schedule => {

            // 不展示报考的人
            schedule.allowed_users = []

            return schedule;
        });

        return {
            code: 0,
            message: '获取考试列表成功',
            data: examList
        };
    } catch (error) {
        console.error('获取考试列表失败: ', error);
        return {
            code: 500,
            message: '获取考试列表失败: ' + error.message
        }
    }
}

// 获取随机考试列表
async function getRandomExamList(params) {
    try {
        // 获取正在进行中的考试安排
        const currentTime = Date.now();
        const examSchedulesRes = await uniCloud.database()
            .collection('exam-schedules')
            .where({
                start_time: uniCloud.database().command.lt(currentTime),
                end_time: uniCloud.database().command.gt(currentTime),
                status: 1 // 1表示进行中
            })
            .limit(params.limit || 10)
            .get();

        // 处理数据
        const examList = examSchedulesRes.data.map(schedule => {

            // 不展示报考的人
            schedule.allowed_users = []

            return schedule;
        });

        return {
            code: 0,
            message: '获取随机考试列表成功',
            data: examList,
        };
    } catch (error) {
        console.error('获取随机考试列表失败: ', error);
        return {
            code: 500,
            message: '获取随机考试列表失败: ' + error.message
        }
    }
}

// 报名考试
async function registerExam(params) {
    try {
        const {exam_schedules_id, user_id} = params;

        // 获取考试安排详情
        const examSchedulesRes = await uniCloud.database()
            .collection('exam-schedules')
            .doc(exam_schedules_id)
            .get();

        if (!examSchedulesRes.data || examSchedulesRes.data.length === 0) {
            return {
                code: 404,
                message: '考试安排不存在'
            };
        }

        const examSchedule = examSchedulesRes.data[0];

        // 获取试卷详情
        const examsRes = await uniCloud.database()
            .collection('exams')
            .doc(examSchedule.exam_id)
            .get();

        if (!examsRes.data || examsRes.data.length === 0) {
            return {
                code: 404,
                message: '试卷不存在'
            };
        }

        const exam = examsRes.data[0];

        // 获取题目详情
        const questionIds = exam.questions;
        if (!questionIds || questionIds.length === 0) {
            return {
                code: 400,
                message: '试卷中没有题目'
            };
        }

        const questionsRes = await uniCloud.database()
            .collection('exam-questions')
            .where({
                _id: uniCloud.database().command.in(questionIds)
            })
            .get();

        // 初始化答题记录
        const answers = questionsRes.data.map(question => {
            // 根据题目难度获取分数
            let fullMark = 0;
            if (question.difficulty === 1) {
                fullMark = examSchedule.simple_score || 0;
            } else if (question.difficulty === 2) {
                fullMark = examSchedule.medium_score || 0;
            } else if (question.difficulty === 3) {
                fullMark = examSchedule.difficult_score || 0;
            }

            return {
                questions: question,
                exam_schedules: examSchedule,
                full_mark: fullMark,
                score: 0,
                is_correct: 0,
                user_answer: []
            };
        });

        // 计算总分
        const total_full_mark = answers.reduce((sum, answer) => sum + answer.full_mark, 0);

        // 创建考试记录
        const examRecord = {
            exam_schedules_id,
            user_id,
            answers,
            total_full_mark,
            total_score: 0,
            status: -1, // -1:未开始
            created_date: new Date(),
            updated_date: new Date()
        };

        const examRecordRes = await uniCloud.database()
            .collection('exam-records')
            .add(examRecord);

        return {
            code: 0,
            message: '报名成功',
            record_id: examRecordRes.id
        };
    } catch (error) {
        console.error('报名考试失败: ', error);
        return {
            code: 500,
            message: '报名考试失败: ' + error.message
        }
    }
}

// 开始考试
async function startExam(params) {
    try {
        const {id} = params;

        // 获取考试记录详情
        const examRecordRes = await uniCloud.database()
            .collection('exam-records')
            .doc(id)
            .get();

        if (!examRecordRes.data || examRecordRes.data.length === 0) {
            return {
                code: 404,
                message: '考试记录不存在'
            };
        }

        const examRecord = examRecordRes.data[0];

        // 更新状态为进行中
        const updateRes = await uniCloud.database()
            .collection('exam-records')
            .doc(id)
            .update({
                status: 0, // 0:未完成（进行中）
                started_date: new Date(),
                updated_date: new Date()
            });

        // 返回抹除化的数据（隐藏答案）
        const sanitizedRecord = JSON.parse(JSON.stringify(examRecord));
        sanitizedRecord.answers.forEach(answer => {
            delete answer.questions.answer;
            delete answer.questions.analysis;
        });

        return {
            code: 0,
            message: '考试开始成功',
            examData: sanitizedRecord
        };
    } catch (error) {
        console.error('开始考试失败: ', error);
        return {
            code: 500,
            message: '开始考试失败: ' + error.message
        }
    }
}

// 继续考试
async function continueExam(params) {
    try {
        const {id} = params;

        // 获取考试记录详情
        const examRecordRes = await uniCloud.database()
            .collection('exam-records')
            .doc(id)
            .get();

        if (!examRecordRes.data || examRecordRes.data.length === 0) {
            return {
                code: 404,
                message: '考试记录不存在'
            };
        }

        const examRecord = examRecordRes.data[0];

        // 返回抹除化的数据（隐藏答案）
        const sanitizedRecord = JSON.parse(JSON.stringify(examRecord));
        sanitizedRecord.answers.forEach(answer => {
            delete answer.questions.answer;
            delete answer.questions.analysis;
        });

        return {
            code: 0,
            message: '获取考试数据成功',
            examData: sanitizedRecord
        };
    } catch (error) {
        console.error('继续考试失败: ', error);
        return {
            code: 500,
            message: '继续考试失败: ' + error.message
        }
    }
}

// 答题
async function answerQuestion(params) {
    try {
        const {id, index, user_answer} = params;

        // 获取考试记录详情
        const examRecordRes = await uniCloud.database()
            .collection('exam-records')
            .doc(id)
            .get();

        if (!examRecordRes.data || examRecordRes.data.length === 0) {
            return {
                code: 404,
                message: '考试记录不存在'
            };
        }

        const examRecord = examRecordRes.data[0];

        // 检查索引是否有效
        if (index < 0 || index >= examRecord.answers.length) {
            return {
                code: 400,
                message: '题目索引无效'
            };
        }

        // 更新用户答案
        examRecord.answers[index].user_answer = user_answer;

        // 判断答案是否正确
        const correctAnswer = examRecord.answers[index].questions.answer;
        const isCorrect = JSON.stringify(user_answer.sort()) === JSON.stringify(correctAnswer.sort());
        examRecord.answers[index].is_correct = isCorrect ? 1 : 0;

        // 计算得分
        examRecord.answers[index].score = isCorrect ? examRecord.answers[index].full_mark : 0;

        // 更新考试记录
        const updateRes = await uniCloud.database()
            .collection('exam-records')
            .doc(id)
            .update({
                answers: examRecord.answers,
                updated_date: new Date()
            });

        return {
            code: 0,
            message: '答题成功',
            is_correct: isCorrect
        };
    } catch (error) {
        console.error('答题失败: ', error);
        return {
            code: 500,
            message: '答题失败: ' + error.message
        }
    }
}

// 交卷
async function submitExam(params) {
    try {
        const {id} = params;

        // 获取考试记录详情
        const examRecordRes = await uniCloud.database()
            .collection('exam-records')
            .doc(id)
            .get();

        if (!examRecordRes.data || examRecordRes.data.length === 0) {
            return {
                code: 404,
                message: '考试记录不存在'
            };
        }

        const examRecord = examRecordRes.data[0];

        // 更新状态为已完成
        const finishedDate = new Date();
        const startedDate = examRecord.started_date ? new Date(examRecord.started_date) : finishedDate;
        const timeSpent = Math.floor((finishedDate - startedDate) / 1000); // 转换为秒

        // 计算总分
        const totalScore = examRecord.answers.reduce((sum, answer) => sum + answer.score, 0);

        // 更新考试记录
        const updateRes = await uniCloud.database()
            .collection('exam-records')
            .doc(id)
            .update({
                status: 2, // 2:已完成
                finished_date: finishedDate,
                time_spent: timeSpent,
                total_score: totalScore,
                updated_date: new Date()
            });

        return {
            code: 0,
            message: '交卷成功',
            total_score: totalScore,
            time_spent: timeSpent
        };
    } catch (error) {
        console.error('交卷失败: ', error);
        return {
            code: 500,
            message: '交卷失败: ' + error.message
        }
    }
}