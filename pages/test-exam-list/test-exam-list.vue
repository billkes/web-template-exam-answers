<template>
	<view class="exam-list-page">
		<view class="header">
			<text class="title">考试列表</text>
		</view>
		
		<view class="exam-list">
			<view v-if="examList.length === 0" class="empty-state">
				<text>暂无考试记录</text>
			</view>
			
			<view v-else>
				<view class="exam-item" v-for="(exam, index) in examList" :key="index">
					<view class="exam-header">
						<text class="exam-title">{{ exam.title }}</text>
						<text class="exam-status" :class="getStatusClass(exam.status)">{{ getStatusText(exam.status) }}</text>
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
						<button v-if="exam.status === -1" class="action-btn register-btn" @click="registerExam(exam.schedule_id)">报名考试</button>
						<button v-else-if="exam.status === 0" class="action-btn start-btn" @click="startExam(exam.record_id)">继续考试</button>
						<button v-else-if="exam.status === 1" class="action-btn review-btn" @click="reviewExam(exam.record_id)">查看结果</button>
						<button v-else class="action-btn start-btn" @click="startExam(exam.record_id)">开始考试</button>
					</view>
				</view>
			</view>
		</view>
		
		<view class="random-exam-section">
			<view class="section-header">
				<text class="section-title">随机考试</text>
				<text class="refresh-btn" @click="loadRandomExams">刷新</text>
			</view>
			
			<view class="random-exam-list">
				<view v-if="randomExamList.length === 0" class="empty-state">
					<text>暂无随机考试</text>
				</view>
				
				<view v-else>
					<view class="exam-item" v-for="(exam, index) in randomExamList" :key="index">
						<view class="exam-header">
							<text class="exam-title">{{ exam.title }}</text>
						</view>
						
						<view class="exam-details">
							<text class="exam-description">{{ exam.description }}</text>
							<view class="exam-info">
								<text>总分：{{ exam.total_full_mark }}</text>
								<text>时长：{{ exam.duration }}分钟</text>
							</view>
							<view class="exam-time">
								<text>开始时间：{{ formatTime(exam.start_time) }}</text>
								<text>结束时间：{{ formatTime(exam.end_time) }}</text>
							</view>
						</view>
						
						<view class="exam-actions">
							<button class="action-btn register-btn" @click="registerRandomExam(exam.schedule_id)">报名考试</button>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				examList: [],
				randomExamList: []
			}
		},
		onLoad() {
			this.loadMyExams();
			this.loadRandomExams();
		},
		methods: {
			// 加载我的考试列表
			async loadMyExams() {
				try {
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'getMyExamList',
							params: {}
						}
					});
					
					if (res.result.code === 0) {
						this.examList = res.result.examList;
					} else {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载我的考试列表失败:', error);
					uni.showToast({
						title: '加载考试列表失败',
						icon: 'none'
					});
				}
			},
			
			// 加载随机考试列表
			async loadRandomExams() {
				try {
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'getRandomExamList',
							params: {
								limit: 10
							}
						}
					});
					
					if (res.result.code === 0) {
						this.randomExamList = res.result.examList;
					} else {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载随机考试列表失败:', error);
					uni.showToast({
						title: '加载随机考试列表失败',
						icon: 'none'
					});
				}
			},
			
			// 报名考试
			async registerExam(scheduleId) {
				try {
					// 这里需要获取当前用户ID，实际开发中应该从用户信息中获取
					const userId = uni.getStorageSync('user_id');
					if (!userId) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						});
						return;
					}
					
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'registerExam',
							params: {
								exam_schedules_id: scheduleId,
								user_id: userId
							}
						}
					});
					
					if (res.result.code === 0) {
						uni.showToast({
							title: '报名成功',
							icon: 'success'
						});
						// 重新加载考试列表
						this.loadMyExams();
					} else {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('报名考试失败:', error);
					uni.showToast({
						title: '报名考试失败',
						icon: 'none'
					});
				}
			},
			
			// 报名随机考试
			registerRandomExam(scheduleId) {
				this.registerExam(scheduleId);
			},
			
			// 开始考试
			startExam(recordId) {
				uni.navigateTo({
					url: `/pages/test-answer/test-answer?id=${recordId}`
				});
			},
			
			// 继续考试
			continueExam(recordId) {
				uni.navigateTo({
					url: `/pages/test-answer/test-answer?id=${recordId}`
				});
			},
			
			// 查看考试结果
			reviewExam(recordId) {
				// 这里可以跳转到考试结果页面
				uni.showToast({
					title: '查看考试结果功能待实现',
					icon: 'none'
				});
			},
			
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

<style>
	.exam-list-page {
		padding: 20rpx;
	}
	
	.header {
		margin-bottom: 30rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
	}
	
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
	
	.random-exam-section {
		margin-top: 50rpx;
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.refresh-btn {
		font-size: 26rpx;
		color: #1890ff;
	}
	
	.empty-state {
		text-align: center;
		padding: 50rpx 0;
		color: #999;
	}
</style>