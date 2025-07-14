'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const collection = db.collection('appx-template-exam-answer-records');

exports.main = async (event, context) => {
  const { action, params } = event;
  
  try {
    switch (action) {
      case 'list':
        return await getRecordList(params);
      case 'detail':
        return await getRecordDetail(params.id);
      case 'add':
        return await addRecord(params);
      case 'update':
        return await updateRecord(params);
      case 'userPaperRecords':
        return await getUserPaperRecords(params.user_id, params.paper_id, params.limit);
      default:
        return {
          code: 400,
          message: '无效的操作类型'
        };
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      code: 500,
      message: '服务器内部错误',
      error: error.message
    };
  }
};

// 获取考试记录列表
async function getRecordList(params = {}) {
  const { 
    user_id, 
    exam_id, 
    question_id, 
    is_correct, 
    page = 1, 
    pageSize = 10,
    sortField = 'answer_time',
    sortOrder = 'desc'
  } = params;
  
  const where = {};
  if (user_id) where.user_id = user_id;
  if (exam_id) where.exam_id = exam_id;
  if (question_id) where.question_id = question_id;
  if (is_correct !== undefined) where.is_correct = is_correct;
  
  const res = await collection
    .where(where)
    .orderBy(sortField, sortOrder)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
    
  const countRes = await collection.where(where).count();
  
  return {
    code: 200,
    data: {
      list: res.data,
      total: countRes.total,
      page,
      pageSize
    }
  };
}

// 获取考试记录详情
async function getRecordDetail(id) {
  if (!id) {
    return {
      code: 400,
      message: '记录ID不能为空'
    };
  }
  
  const res = await collection.doc(id).get();
  
  if (!res.data || res.data.length === 0) {
    return {
      code: 404,
      message: '记录不存在'
    };
  }
  
  return {
    code: 200,
    data: res.data[0]
  };
}

// 添加考试记录
async function addRecord(data) {
  if (!data.user_id || !data.exam_id || !data.question_id) {
    return {
      code: 400,
      message: '缺少必填字段'
    };
  }
  
  // 处理answer字段
  if (Array.isArray(data.answer)) {
    data.answer = JSON.stringify(data.answer);
  }
  
  // 设置默认值
  data.answer_time = Date.now();
  
  const res = await collection.add(data);
  
  return {
    code: 200,
    data: {
      id: res.id
    },
    message: '添加成功'
  };
}

// 更新考试记录
async function updateRecord(data) {
  if (!data._id) {
    return {
      code: 400,
      message: '记录ID不能为空'
    };
  }
  
  const id = data._id;
  delete data._id;
  
  // 处理answer字段
  if (data.answer && Array.isArray(data.answer)) {
    data.answer = JSON.stringify(data.answer);
  }
  
  const res = await collection.doc(id).update(data);
  
  if (res.updated === 0) {
    return {
      code: 404,
      message: '记录不存在或未更新'
    };
  }
  
  return {
    code: 200,
    message: '更新成功'
  };
}

// 获取用户某试卷的考试记录
async function getUserPaperRecords(user_id, paper_id, limit = 5) {
  if (!user_id || !paper_id) {
    return {
      code: 400,
      message: '用户ID和试卷ID不能为空'
    };
  }
  
  const res = await collection
    .where({
      user_id,
      exam_id: paper_id
    })
    .orderBy('answer_time', 'desc')
    .limit(limit)
    .get();
    
  return {
    code: 200,
    data: res.data
  };
}