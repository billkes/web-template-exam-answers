// 模拟数据
export const mockExamData = {
  examSchedule: {
    _id: 'schedule_001',
    exam_id: 'exam_001',
    title: '模拟考试',
    description: '这是一场模拟考试',
    start_time: Date.now() - 3600000, // 1小时前
    end_time: Date.now() + 3600000, // 1小时后
    allowed_users: ['user_001'],
    duration: 60, // 60分钟
    simple_score: 2,
    medium_score: 3,
    difficult_score: 5,
    total_score: 100,
    status: 1, // 进行中
    created_date: Date.now() - 7200000, // 2小时前
    updated_date: Date.now() - 3600000 // 1小时前
  },
  total_full_mark: 100,
  pass_score: 60,
  answers: [
    {
      questions: {
        _id: 'question_001',
        difficulty: 1, // 简单
        title: '以下哪个选项是正确的？',
        type: 'single', // 单选题
        options: ['选项A', '选项B', '选项C', '选项D'],
        answer: [0], // 正确答案是A
        analysis: '这是题目的解析',
        created_date: Date.now() - 7200000, // 2小时前
        updated_date: Date.now() - 3600000 // 1小时前
      },
      exam_schedules: {
        _id: 'schedule_001',
        exam_id: 'exam_001',
        title: '模拟考试',
        description: '这是一场模拟考试',
        start_time: Date.now() - 3600000, // 1小时前
        end_time: Date.now() + 3600000, // 1小时后
        allowed_users: ['user_001'],
        duration: 60, // 60分钟
        simple_score: 2,
        medium_score: 3,
        difficult_score: 5,
        total_score: 100,
        status: 1, // 进行中
        created_date: Date.now() - 7200000, // 2小时前
        updated_date: Date.now() - 3600000 // 1小时前
      },
      full_mark: 2, // 简单题分数
      score: 0, // 初始得分
      is_correct: 0, // 初始未答对
      user_answer: [] // 初始未作答
    },
    {
      questions: {
        _id: 'question_002',
        difficulty: 2, // 中等
        title: '以下哪些选项是正确的？（多选题）',
        type: 'multiple', // 多选题
        options: ['选项A', '选项B', '选项C', '选项D'],
        answer: [0, 2], // 正确答案是A和C
        analysis: '这是题目的解析',
        created_date: Date.now() - 7200000, // 2小时前
        updated_date: Date.now() - 3600000 // 1小时前
      },
      exam_schedules: {
        _id: 'schedule_001',
        exam_id: 'exam_001',
        title: '模拟考试',
        description: '这是一场模拟考试',
        start_time: Date.now() - 3600000, // 1小时前
        end_time: Date.now() + 3600000, // 1小时后
        allowed_users: ['user_001'],
        duration: 60, // 60分钟
        simple_score: 2,
        medium_score: 3,
        difficult_score: 5,
        total_score: 100,
        status: 1, // 进行中
        created_date: Date.now() - 7200000, // 2小时前
        updated_date: Date.now() - 3600000 // 1小时前
      },
      full_mark: 3, // 中等题分数
      score: 0, // 初始得分
      is_correct: 0, // 初始未答对
      user_answer: [] // 初始未作答
    },
    {
      questions: {
        _id: 'question_003',
        difficulty: 3, // 困难
        title: '以下哪个选项是错误的？',
        type: 'single', // 单选题
        options: ['选项A', '选项B', '选项C', '选项D'],
        answer: [3], // 正确答案是D（即选项D是错误的）
        analysis: '这是题目的解析',
        created_date: Date.now() - 7200000, // 2小时前
        updated_date: Date.now() - 3600000 // 1小时前
      },
      exam_schedules: {
        _id: 'schedule_001',
        exam_id: 'exam_001',
        title: '模拟考试',
        description: '这是一场模拟考试',
        start_time: Date.now() - 3600000, // 1小时前
        end_time: Date.now() + 3600000, // 1小时后
        allowed_users: ['user_001'],
        duration: 60, // 60分钟
        simple_score: 2,
        medium_score: 3,
        difficult_score: 5,
        total_score: 100,
        status: 1, // 进行中
        created_date: Date.now() - 7200000, // 2小时前
        updated_date: Date.now() - 3600000 // 1小时前
      },
      full_mark: 5, // 困难题分数
      score: 0, // 初始得分
      is_correct: 0, // 初始未答对
      user_answer: [] // 初始未作答
    }
  ]
};