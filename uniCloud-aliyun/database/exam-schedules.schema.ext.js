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
            // 计算总分
            if (doc.simple_score !== undefined && doc.medium_score !== undefined && doc.difficult_score !== undefined) {
                doc.total_score = (doc.simple_score || 0) + (doc.medium_score || 0) + (doc.difficult_score || 0)
            }
            
            // 检查考试冲突
            if (doc.start_time && doc.end_time && doc.allowed_users && doc.allowed_users.length > 0) {
                const conflictCheck = await checkExamConflicts(doc)
                if (conflictCheck.hasConflict) {
                    throw new Error(`考试时间冲突：${conflictCheck.conflictMessage}`)
                }
            }
            
            // 自动设置考试状态
            doc.status = calculateExamStatus(doc.start_time, doc.end_time)
            
            return doc
        },
        
        // 更新前触发器
        beforeUpdate: async function({
            client,
            collection,
            doc,
            where
        }) {
            // 计算总分
            if (doc.simple_score !== undefined || doc.medium_score !== undefined || doc.difficult_score !== undefined) {
                const currentDoc = await collection.doc(where._id).get()
                const currentData = currentDoc.data[0] || {}
                
                doc.total_score = (doc.simple_score || currentData.simple_score || 0) + 
                                 (doc.medium_score || currentData.medium_score || 0) + 
                                 (doc.difficult_score || currentData.difficult_score || 0)
            }
            
            // 检查考试冲突（如果更新了时间或允许用户）
            if (doc.start_time || doc.end_time || doc.allowed_users) {
                const currentDoc = await collection.doc(where._id).get()
                const currentData = currentDoc.data[0] || {}
                const mergedDoc = {
                    ...currentData,
                    ...doc,
                    _id: where._id // 排除当前记录的冲突检查
                }
                
                const conflictCheck = await checkExamConflicts(mergedDoc, where._id)
                if (conflictCheck.hasConflict) {
                    throw new Error(`考试时间冲突：${conflictCheck.conflictMessage}`)
                }
            }
            
            // 自动更新考试状态
            if (doc.start_time || doc.end_time) {
                const currentDoc = await collection.doc(where._id).get()
                const currentData = currentDoc.data[0] || {}
                const startTime = doc.start_time || currentData.start_time
                const endTime = doc.end_time || currentData.end_time
                doc.status = calculateExamStatus(startTime, endTime)
            }
            
            return doc
        },
        
        // 读取后触发器（用于实时状态更新）
        afterRead: async function({
            client,
            collection,
            doc,
            addDoc
        }) {
            // 实时更新考试状态
            if (doc && doc.start_time && doc.end_time) {
                doc.status = calculateExamStatus(doc.start_time, doc.end_time)
            }
            return doc
        }
    }
}

// 计算考试状态
function calculateExamStatus(startTime, endTime) {
    const now = new Date().getTime()
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    
    if (now < start) {
        return 0 // 未开始
    } else if (now >= start && now <= end) {
        return 1 // 进行中
    } else {
        return 2 // 已结束
    }
}

// 检查考试冲突
async function checkExamConflicts(examDoc, excludeId = null) {
    const { start_time, end_time, allowed_users } = examDoc
    
    if (!start_time || !end_time || !allowed_users || allowed_users.length === 0) {
        return { hasConflict: false }
    }
    
    const newStart = new Date(start_time).getTime()
    const newEnd = new Date(end_time).getTime()
    
    // 查询同一用户的考试安排
    const query = {
        allowed_users: _.in(allowed_users),
        _id: _.neq(excludeId), // 排除当前记录
        status: _.lt(2) // 只检查未结束的考试
    }
    
    const conflictExams = await db.collection('exam-schedules')
        .where(query)
        .get()
    
    const conflicts = []
    
    for (const exam of conflictExams.data) {
        const existingStart = new Date(exam.start_time).getTime()
        const existingEnd = new Date(exam.end_time).getTime()
        
        // 检查时间重叠
        if ((newStart >= existingStart && newStart <= existingEnd) ||
            (newEnd >= existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)) {
            
            // 找出冲突的用户
            const conflictUsers = exam.allowed_users.filter(user => 
                allowed_users.includes(user)
            )
            
            conflicts.push({
                examId: exam._id,
                examTitle: exam.title || '未命名考试',
                conflictUsers: conflictUsers,
                timeRange: `${new Date(existingStart).toLocaleString()} - ${new Date(existingEnd).toLocaleString()}`
            })
        }
    }
    
    if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(conflict => 
            `考试"${conflict.examTitle}" (${conflict.timeRange}) 与用户 ${conflict.conflictUsers.join(', ')} 冲突`
        ).join('; ')
        
        return {
            hasConflict: true,
            conflictMessage: conflictMessages,
            conflicts: conflicts
        }
    }
    
    return { hasConflict: false }
}
