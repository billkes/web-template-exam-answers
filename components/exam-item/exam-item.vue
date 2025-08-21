<template>
	<view class="exam-item">
		<view class="exam-header">
			<text class="exam-title">{{ exam.title }}</text>
			<text v-if="showStatus" class="exam-status" :class="getStatusClass(exam.status)">{{ getStatusText(exam.status) }}</text>
		</view>
		
		<view class="exam-details">
			<text class="exam-description">{{ exam.description }}</text>
			<view class="exam-info">
				<text>总分：{{ exam.total_full_mark }}</text>
				<text v-if="exam.total_score !== undefined">得分：{{ exam.total_score }}</text>
				<text>时长：{{ exam.duration }}分钟</text>
			</view>
			<view class="exam-time">
				<text>开始时间：{{ formatTime(exam.start_time) }}</text>
				<text>结束时间：{{ formatTime(exam.end_time) }}</text>
			</view>
		</view>
		
		<view class="exam-actions">
			<slot name="actions">
				<button 
					v-if="exam.status === -1" 
					class="action-btn register-btn" 
					@click="$emit('register', exam.schedule_id)"
				>报名考试</button>
				<button 
					v-else-if="exam.status === 0" 
					class="action-btn start-btn" 
					@click="$emit('continue', exam.record_id)"
				>继续考试</button>
				<button 
					v-else-if="exam.status === 1" 
					class="action-btn review-btn" 
					@click="$emit('review', exam.record_id)"
				>查看结果</button>
				<button 
					v-else 
					class="action-btn start-btn" 
					@click="$emit('start', exam.record_id)"
				>开始考试</button>
			</slot>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'ExamItem',
		props: {
			exam: {
				type: Object,
				required: true
			},
			showStatus: {
				type: Boolean,
				default: true
			}
		},
		methods: {
			// 获取状态文本
			getStatusText(status) {
				switch (status) {
					case -1: return '未开始';
					case 0: return '进行中';
					case 1: return '已完成';
					default: return '未知';
				}
			},
			
			// 获取状态样式类
			getStatusClass(status) {
				switch (status) {
					case -1: return 'status-not-started';
					case 0: return 'status-in-progress';
					case 1: return 'status-completed';
					default: return '';
				}
			},
			
			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			}
		}
	}
</script>

<style scoped>
	.exam-item {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}
	
	.exam-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.exam-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.exam-status {
		font-size: 24rpx;
		padding: 5rpx 15rpx;
		border-radius: 20rpx;
	}
	
	.status-not-started {
		background-color: #f0f0f0;
		color: #999;
	}
	
	.status-in-progress {
		background-color: #e6f7ff;
		color: #1890ff;
	}
	
	.status-completed {
		background-color: #f6ffed;
		color: #52c41a;
	}
	
	.exam-details {
		margin-bottom: 20rpx;
	}
	
	.exam-description {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 15rpx;
		display: block;
	}
	
	.exam-info {
		display: flex;
		justify-content: space-between;
		font-size: 26rpx;
		color: #333;
		margin-bottom: 10rpx;
	}
	
	.exam-time {
		display: flex;
		justify-content: space-between;
		font-size: 24rpx;
		color: #999;
	}
	
	.exam-actions {
		display: flex;
		justify-content: flex-end;
	}
	
	.action-btn {
		font-size: 26rpx;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		margin-left: 20rpx;
	}
	
	.register-btn {
		background-color: #1890ff;
		color: #fff;
	}
	
	.start-btn {
		background-color: #52c41a;
		color: #fff;
	}
	
	.review-btn {
		background-color: #faad14;
		color: #fff;
	}
</style>