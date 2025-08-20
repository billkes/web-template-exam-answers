// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
const db = uniCloud.database()
const $ = db.command.aggregate
const _ = db.command

module.exports = {   
    trigger: {
        // 创建前触发器
        beforeCreate: async function({
            client,
            collection,
            doc,
            addDoc
        }) {
            // 设置默认开始时间
            if (!doc.started_date) {
                doc.started_date = new Date()
            }
            
            // 初始化答题进度
            if (doc.answers && doc.answers.length > 0) {
                doc.answers = initializeAnswerProgress(doc.answers)
            }
            
            // 计算初始得分
            if (doc.answers && doc.exam_id) {
                doc.total_score = await calculateExamScore(doc.exam_id, doc.answers)
            }
            
            // 设置默认状态
            if (doc.status === undefined) {
                doc.status = 0 // 未完成
            }
            
            return doc
        },
        
        // 更新前触发器
        beforeUpdate: async function({
            client,
            collection,
            doc,
            where
        }) {
            // 更新答题进度
            if (doc.answers) {
                doc.answers = updateAnswerProgress(doc.answers)
            }
            
            // 实时计算得分
            if (doc.answers || doc.exam_id) {
                const currentDoc = await collection.doc(where._id).get()
                const currentData = currentDoc.data[0] || {}
                const examId = doc.exam_id || currentData.exam_id
                const answers = doc.answers || currentData.answers
                
                if (examId && answers) {
                    doc.total_score = await calculateExamScore(examId, answers)
                }
            }
            
            // 检查是否需要自动交卷
            if (doc.status === 1) { // 如果设置为已完成
                if (!doc.finished_date) {
                    doc.finished_date = new Date()
                }
                
                // 计算用时
                const currentDoc = await collection.doc(where._id).get()
                const currentData = currentDoc.data[0] || {}
                const startTime = doc.started_date || currentData.started_date
                const endTime = doc.finished_date
                
                if (startTime && endTime) {
                    doc.time_spent = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
                }
            }
            
            return doc
        },
        
        // 读取后触发器（用于自动交卷检查）
        afterRead: async function({
            client,
            collection,
            doc,
            addDoc
        }) {
            // 检查是否需要自动交卷
            if (doc && doc.status === 0 && doc.started_date && doc.exam_id) {
                const shouldAutoSubmit = await checkAutoSubmit(doc)
                if (shouldAutoSubmit) {
                    // 自动更新为已完成状态
                    await collection.doc(doc._id).update({
                        status: 1,
                        finished_date: new Date(),
                        total_score: await calculateExamScore(doc.exam_id, doc.answers || [])
                    })
                    
                    // 返回更新后的状态
                    doc.status = 1
                    doc.finished_date = new Date()
                }
            }
            
            return doc
        }
    }
}

// 初始化答题进度
function initializeAnswerProgress(answers) {
    return answers.map(answer => ({
        question_id: answer.question_id || answer,
        selected_answer: answer.selected_answer || [],
        answer_time: answer.answer_time || 0,
        is_answered: answer.is_answered || false,
        last_saved: new Date()
    }))
}

// 更新答题进度
function updateAnswerProgress(answers) {
    return answers.map(answer => ({
        ...answer,
        is_answered: answer.selected_answer && answer.selected_answer.length > 0,
        last_saved: new Date()
    }))
}

// 计算考试得分
async function calculateExamScore(examId, userAnswers) {
    try {
        // 获取考试信息
        const examDoc = await db.collection('exams').doc(examId).get()
        if (!examDoc.data || examDoc.data.length === 0) {
            return 0
        }
        
        const exam = examDoc.data[0]
        const questionIds = exam.questions || []
        
        if (questionIds.length === 0 || userAnswers.length === 0) {
            return 0
        }
        
        // 获取所有题目信息
        const questionsDoc = await db.collection('exam-questions')
            .where({
                _id: _.in(questionIds)
            })
            .get()
        
        const questions = questionsDoc.data || []
        let totalScore = 0
        
        // 计算每个题目的得分
        for (const userAnswer of userAnswers) {
            const question = questions.find(q => q._id === userAnswer.question_id)
            if (!question) continue
            
            const questionScore = await calculateQuestionScore(question, userAnswer)
            totalScore += questionScore
        }
        
        return totalScore
    } catch (error) {
        console.error('计算考试得分失败:', error)
        return 0
    }
}

// 计算单个题目得分
async function calculateQuestionScore(question, userAnswer) {
    if (!userAnswer.selected_answer || userAnswer.selected_answer.length === 0) {
        return 0
    }
    
    // 获取考试安排中的分数设置
    const examSchedules = await db.collection('exam-schedules')
        .where({
            exam_id: _.in([question.exam_id]) // 假设题目中有exam_id字段
        })
        .get()
    
    let simpleScore = 1
    let mediumScore = 2
    let difficultScore = 3
    
    if (examSchedules.data && examSchedules.data.length > 0) {
        const schedule = examSchedules.data[0]
        simpleScore = schedule.simple_score || 1
        mediumScore = schedule.medium_score || 2
        difficultScore = schedule.difficult_score || 3
    }
    
    // 根据题目难度确定分数
    let questionScore = 1
    switch (question.difficulty) {
        case 1: // 简单
            questionScore = simpleScore
            break
        case 2: // 中等
            questionScore = mediumScore
            break
        case 3: // 困难
            questionScore = difficultScore
            break
        default:
            questionScore = 1
    }
    
    // 检查答案是否正确
    const correctAnswer = question.answer || []
    const userAnswerArray = Array.isArray(userAnswer.selected_answer) ? 
        userAnswer.selected_answer : [userAnswer.selected_answer]
    
    // 单选题：完全匹配
    if (question.type === 'single') {
        const isCorrect = userAnswerArray.length === 1 && 
                         correctAnswer.length === 1 && 
                         userAnswerArray[0] === correctAnswer[0]
        return isCorrect ? questionScore : 0
    }
    
    // 多选题：完全匹配
    if (question.type === 'multiple') {
        const sortedUser = userAnswerArray.sort()
        const sortedCorrect = correctAnswer.sort()
        const isCorrect = sortedUser.length === sortedCorrect.length && 
                         sortedUser.every((val, index) => val === sortedCorrect[index])
        return isCorrect ? questionScore : 0
    }
    
    return 0
}

// 检查是否需要自动交卷
async function checkAutoSubmit(examRecord) {
    try {
        // 获取考试安排信息
        const examSchedules = await db.collection('exam-schedules')
            .where({
                exam_id: examRecord.exam_id
            })
            .get()
        
        if (!examSchedules.data || examSchedules.data.length === 0) {
            return false
        }
        
        const schedule = examSchedules.data[0]
        
        // 检查考试是否已结束
        const now = new Date().getTime()
        const endTime = new Date(schedule.end_time).getTime()
        
        if (now > endTime) {
            return true // 考试时间已到，自动交卷
        }
        
        // 检查考试时长是否已用完
        if (schedule.duration && examRecord.started_date) {
            const startTime = new Date(examRecord.started_date).getTime()
            const durationMs = schedule.duration * 60 * 1000 // 转换为毫秒
            const timeUsed = now - startTime
            
            if (timeUsed >= durationMs) {
                return true // 考试时长已用完，自动交卷
            }
        }
        
        return false
    } catch (error) {
        console.error('检查自动交卷失败:', error)
        return false
    }
}