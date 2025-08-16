import { callFunction } from '@/js_sdk/uni-admin/request.js'

/**
 * 用户考试关联API服务
 */
export default {
	/**
	 * 用户报名考试
	 * @param {Object} params - 报名参数
	 * @param {string} params.user_id - 用户ID
	 * @param {string} params.exam_id - 考试ID
	 * @param {number} params.status - 状态(可选)
	 * @returns {Promise} 报名结果
	 */
	enrollUser(params) {
		return callFunction('appx-template-exam-user-exams', {
			action: 'enroll',
			params
		})
	},

	/**
	 * 取消报名
	 * @param {Object} params - 取消参数
	 * @param {string} params.user_id - 用户ID
	 * @param {string} params.exam_id - 考试ID
	 * @returns {Promise} 取消结果
	 */
	cancelEnrollment(params) {
		return callFunction('appx-template-exam-user-exams', {
			action: 'cancelEnrollment',
			params
		})
	},

	/**
	 * 更新报名状态
	 * @param {Object} params - 更新参数
	 * @param {string} params.id - 报名记录ID
	 * @param {number} params.status - 新状态(0:待审核,1:已通过,2:已拒绝)
	 * @returns {Promise} 更新结果
	 */
	updateStatus(params) {
		return callFunction('appx-template-exam-user-exams', {
			action: 'updateStatus',
			params
		})
	},

	/**
	 * 获取用户的所有考试
	 * @param {Object} params - 查询参数
	 * @param {string} params.user_id - 用户ID
	 * @param {number} params.page - 页码
	 * @param {number} params.pageSize - 每页数量
	 * @param {number} params.status - 状态筛选(可选)
	 * @returns {Promise} 考试列表
	 */
	getUserExams(params) {
		return callFunction('appx-template-exam-user-exams', {
			action: 'getUserExams',
			params
		})
	},

	/**
	 * 获取考试的所有用户
	 * @param {Object} params - 查询参数
	 * @param {string} params.exam_id - 考试ID
	 * @param {number} params.page - 页码
	 * @param {number} params.pageSize - 每页数量
	 * @param {number} params.status - 状态筛选(可选)
	 * @returns {Promise} 用户列表
	 */
	getExamUsers(params) {
		return callFunction('appx-template-exam-user-exams', {
			action: 'getExamUsers',
			params
		})
	},

	/**
	 * 获取报名列表(带分页和搜索)
	 * @param {Object} params - 查询参数
	 * @param {string} params.keyword - 搜索关键词
	 * @param {number} params.page - 页码
	 * @param {number} params.pageSize - 每页数量
	 * @param {number} params.status - 状态筛选(可选)
	 * @param {string} params.exam_id - 考试ID筛选(可选)
	 * @param {string} params.user_id - 用户ID筛选(可选)
	 * @returns {Promise} 报名列表
	 */
	getEnrollmentList(params) {
		return callFunction('appx-template-exam-user-exams', {
			action: 'getEnrollmentList',
			params
		})
	},

	/**
	 * 检查用户是否已报名考试
	 * @param {Object} params - 查询参数
	 * @param {string} params.user_id - 用户ID
	 * @param {string} params.exam_id - 考试ID
	 * @returns {Promise} 检查结果
	 */
	checkEnrollment(params) {
		return callFunction('appx-template-exam-user-exams', {
			action: 'checkEnrollment',
			params
		})
	}
}