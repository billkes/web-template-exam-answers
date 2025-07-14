<template>
	<view class="container">
		<view class="header">
			<text class="title">考试记录详情</text>
			<text class="sub-title">{{ recordData.paper_detail?.name || '试卷已删除' }}</text>
		</view>

		<view class="info-card">
			<view class="info-item">
				<text class="label">考生姓名：</text>
				<text class="value">{{ recordData.user_detail?.name || '用户已删除' }}</text>
			</view>
			<view class="info-item">
				<text class="label">考试时间：</text>
				<text class="value">{{ myFormatTime(recordData.start_time) }} -
					{{ recordData.submit_time ? myFormatTime(recordData.submit_time) : '未完成' }}</text>
			</view>
			<view class="info-item">
				<text class="label">考试用时：</text>
				<text class="value">{{ formatDuration(recordData.time_used) }}</text>
			</view>
			<view class="info-item">
				<text class="label">得分：</text>
				<text class="value">{{ recordData.score }}</text>
			</view>
			<view class="info-item">
				<text class="label">是否通过：</text>
				<uni-tag :text="recordData.is_passed ? '通过' : '未通过'"
					:type="recordData.is_passed ? 'success' : 'error'" />
			</view>
		</view>

		<view class="question-list">
			<view class="section-title">答题详情</view>
			<view class="question-item" v-for="(answer, index) in recordData.answers" :key="index">
				<view class="question-header">
					<text class="question-index">第{{ index + 1 }}题</text>
					<text class="question-type">{{ getQuestionTypeText(answer.question_detail?.type) }}</text>
					<text class="question-score">({{ answer.question_detail?.score || 0 }}分)</text>
					<uni-tag :text="answer.is_correct ? '正确' : '错误'" :type="answer.is_correct ? 'success' : 'error'"
						size="small" />
				</view>
				<view class="question-content">{{ answer.question_detail?.content || '题目已删除' }}</view>

				<!-- 显示选项（如果是选择题） -->
				<view class="options-section"
					v-if="answer.question_detail?.type === 'single_choice' || answer.question_detail?.type === 'multiple_choice'">
					<view class="option-item" v-for="(option, optIndex) in answer.question_detail?.options"
						:key="optIndex">
						<text class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</text>
						<text class="option-content">{{ option }}</text>
					</view>
				</view>

				<view class="answer-section">
					<text class="answer-label">正确答案：</text>
					<text
						class="correct-answer">{{ formatAnswer(answer.question_detail?.answer, answer.question_detail?.type) }}</text>
				</view>
				<view class="answer-section">
					<text class="answer-label">考生答案：</text>
					<text class="user-answer" :class="{ 'wrong-answer': !answer.is_correct }">
						{{ formatAnswer(answer.user_answer, answer.question_detail?.type) }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		getRecordDetail
	} from '@/api/testRecords.js'
	import {
		formatTime
	} from '@/utils/tableUtil.js'

	const recordData = ref({
		paper_detail: {},
		user_detail: {},
		answers: []
	})

	// 初始化加载数据
	onMounted(async () => {
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		const id = currentPage.options?.id
		if (id) {
			await fetchRecordDetail(id)
		} else {
			uni.showToast({
				title: '无效的记录ID',
				icon: 'none'
			})
			uni.navigateBack()
		}
	})

	// 获取记录详情
	const fetchRecordDetail = async (id) => {
		try {
			uni.showLoading({
				title: '加载中...'
			})
			const res = await getRecordDetail({
				id
			})
			if (res.code === 200) {
				recordData.value = res.data
			} else {
				uni.showToast({
					title: res.message || '获取详情失败',
					icon: 'none'
				})
				uni.navigateBack()
			}
		} catch (error) {
			uni.showToast({
				title: '获取详情失败',
				icon: 'none'
			})
			uni.navigateBack()
		} finally {
			uni.hideLoading()
		}
	}

	// 格式化时间
	const myFormatTime = (timestamp) => {
		if (!timestamp) return '-'
		return formatTime(timestamp, 'YYYY-MM-DD hh:mm:ss')
	}

	// 格式化考试用时
	const formatDuration = (seconds) => {
		if (!seconds) return '-'
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}分${secs}秒`
	}

	// 获取题目类型文本
	const getQuestionTypeText = (type) => {
		switch (type) {
			case 'single_choice':
				return '单选题'
			case 'multiple_choice':
				return '多选题'
			default:
				return type || '未知'
		}
	}

	// 格式化答案
	const formatAnswer = (answer, type) => {
		if (!answer) return '未作答'
		if (type === 'multiple_choice') {
			return answer.split(',').map(a => String.fromCharCode(65 + parseInt(a))).join('、')
		}
		if (type === 'single_choice') {
			return String.fromCharCode(65 + parseInt(answer))
		}
		return answer
	}
</script>

<style scoped>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.header {
		margin-bottom: 30rpx;
		text-align: center;
	}

	.title {
		font-size: 20px;
		font-weight: bold;
		display: block;
		margin-bottom: 10rpx;
	}

	.sub-title {
		font-size: 16px;
		color: #666;
	}

	.info-card {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.info-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		font-size: 14px;
	}

	.label {
		width: 150rpx;
		color: #666;
		font-weight: bold;
	}

	.value {
		flex: 1;
	}

	.section-title {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 20rpx;
		padding-bottom: 10rpx;
		border-bottom: 1px solid #eee;
		color: #333;
	}

	.question-item {
		margin-bottom: 30rpx;
		padding: 25rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.question-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		flex-wrap: wrap;
	}

	.question-index {
		font-weight: bold;
		margin-right: 15rpx;
		color: #333;
	}

	.question-type {
		margin-right: 15rpx;
		color: #666;
		font-size: 12px;
	}

	.question-score {
		margin-right: 15rpx;
		color: #f56c6c;
		font-size: 12px;
	}

	.question-content {
		margin-bottom: 20rpx;
		font-size: 15px;
		line-height: 1.6;
	}

	.options-section {
		margin: 15rpx 0;
		padding: 15rpx;
		background-color: #f9f9f9;
		border-radius: 8rpx;
	}

	.option-item {
		display: flex;
		margin-bottom: 10rpx;
		font-size: 14px;
	}

	.option-label {
		font-weight: bold;
		margin-right: 10rpx;
		color: #409eff;
	}

	.option-content {
		flex: 1;
	}

	.answer-section {
		display: flex;
		margin-top: 10rpx;
		font-size: 14px;
	}

	.answer-label {
		font-weight: bold;
		color: #666;
		margin-right: 10rpx;
	}

	.correct-answer {
		color: #67c23a;
		font-weight: bold;
	}

	.user-answer {
		color: #409eff;
		font-weight: bold;
	}

	.wrong-answer {
		color: #f56c6c;
	}
</style>