<template>
	<view class="container">
		<view class="header">
			<text class="title">考试记录详情</text>
		</view>

		<view class="card">
			<uni-list>
				<uni-list-item title="考生姓名" :rightText="detail.user_name" />
				<uni-list-item title="试卷名称" :rightText="detail.paper_name" />
				<uni-list-item title="得分" :rightText="`${detail.score}/${detail.total_score}`" />
				<uni-list-item title="考试用时" :rightText="formatDuration(detail.duration)" />
				<uni-list-item title="考试时间" :rightText="myFormatTime(detail.create_time)" />
			</uni-list>
		</view>

		<view class="card" v-if="detail.answers && detail.answers.length > 0">
			<view class="card-title">答题详情</view>
			<view class="answer-item" v-for="(answer, index) in detail.answers" :key="index">
				<view class="question-title">题目{{ index + 1 }}: {{ answer.question_title || '无标题' }}</view>
				<view class="answer-content">
					<text class="label">用户答案:</text>
					<text>{{ answer.user_answer || '未作答' }}</text>
				</view>
				<view class="answer-content">
					<text class="label">正确答案:</text>
					<text>{{ answer.correct_answer || '无' }}</text>
				</view>
				<view class="answer-content">
					<text class="label">是否正确:</text>
					<text :class="{ 'correct': answer.is_correct, 'wrong': !answer.is_correct }">
						{{ answer.is_correct ? '正确' : '错误' }}
					</text>
				</view>
				<view class="answer-content" v-if="answer.score !== undefined">
					<text class="label">得分:</text>
					<text>{{ answer.score }}分</text>
				</view>
			</view>
		</view>

		<view class="footer">
			<button type="primary" @click="handleBack">返回</button>
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
	} from '@/api/appx-template-exam-answer-records.js'
	import {
		formatTime
	} from '@/utils/tableUtil.js'

	const detail = ref({})
	const loading = ref(false)

	// 获取路由参数
	const route = getCurrentPages()[getCurrentPages().length - 1].route
	const query = ref(uni.getStorageSync(route + '.query') || {})

	// 初始化加载数据
	onMounted(() => {
		fetchData()
	})

	// 获取详情数据
	const fetchData = async () => {
		if (!query.value.id) {
			uni.showToast({
				title: '缺少参数ID',
				icon: 'none'
			})
			return
		}

		loading.value = true
		try {
			const res = await getRecordDetail({
				id: query.value.id
			})
			if (res.code === 200) {
				detail.value = res.data
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.showToast({
				title: '获取详情失败',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}

	// 格式化时间
	const myFormatTime = (timestamp) => {
		return formatTime(timestamp, 'YYYY-MM-DD hh:mm:ss')
	}

	// 格式化考试用时
	const formatDuration = (seconds) => {
		if (!seconds) return '0秒'
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
	}

	// 返回
	const handleBack = () => {
		uni.navigateBack()
	}
</script>

<style scoped lang="scss">
	.container {
		padding: 20rpx;
	}

	.header {
		margin-bottom: 30rpx;

		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.card {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

		.card-title {
			font-size: 32rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
			color: #333;
		}
	}

	.answer-item {
		padding: 20rpx 0;
		border-bottom: 1rpx solid #eee;

		&:last-child {
			border-bottom: none;
		}

		.question-title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 15rpx;
			color: #333;
		}

		.answer-content {
			display: flex;
			margin-bottom: 10rpx;
			font-size: 26rpx;

			.label {
				color: #666;
				margin-right: 15rpx;
				width: 120rpx;
			}

			.correct {
				color: #67C23A;
			}

			.wrong {
				color: #F56C6C;
			}
		}
	}

	.footer {
		margin-top: 40rpx;

		button {
			width: 100%;
		}
	}
</style>