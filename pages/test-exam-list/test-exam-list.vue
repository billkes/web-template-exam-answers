<template>
	<view class="exam-list-page">
		<view class="header">
			<text class="title">考试列表</text>
			<button class="query-btn" @click="loadMyExams">查询我的考试</button>
		</view>
		
		<view class="exam-list">
			<view v-if="loadingMyExams" class="loading-text">
				<text>加载中...</text>
			</view>
			<view v-else-if="examList.length === 0" class="empty-state">
				<text>暂无考试记录</text>
			</view>
			
			<view v-else>
				<exam-item 
					v-for="(exam, index) in examList" 
					:key="index" 
					:exam="exam"
					@register="registerExam"
					@start="startOrContinueExam"
					@continue="startOrContinueExam"
					@review="reviewExam"
				/>
			</view>
		</view>
		
		<view class="random-exam-section">
			<view class="section-header">
				<text class="section-title">随机考试</text>
				<button class="query-btn" @click="loadRandomExams">查询随机考试</button>
			</view>
			
			<view class="random-exam-list">
				<view v-if="loadingRandomExams" class="loading-text">
					<text>加载中...</text>
				</view>
				<view v-else-if="randomExamList.length === 0" class="empty-state">
					<text>暂无随机考试</text>
				</view>
				
				<view v-else>
					<exam-item 
						v-for="(exam, index) in randomExamList" 
						:key="index" 
						:exam="exam"
						:show-status="false"
					>
						<template #actions>
							<button class="action-btn register-btn" @click="registerRandomExam(exam.schedule_id)">报名考试</button>
						</template>
					</exam-item>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import ExamItem from '@/components/exam-item/exam-item.vue';
	
	export default {
		components: {
			ExamItem
		},
		data() {
			return {
				examList: [],
				randomExamList: [],
				loadingMyExams: false,
				loadingRandomExams: false
			}
		},
		onLoad() {
			// 页面加载时不再自动查询
		},
		methods: {
			// 加载我的考试列表
			async loadMyExams() {
				this.loadingMyExams = true;
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
				} finally {
					this.loadingMyExams = false;
				}
			},
			
			// 加载随机考试列表
			async loadRandomExams() {
				this.loadingRandomExams = true;
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
				} finally {
					this.loadingRandomExams = false;
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
			
			// 开始/继续考试
			startOrContinueExam(recordId) {
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
			}
		}
	}
</script>

<style>
	.exam-list-page {
		padding: 20rpx;
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
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
	
	.query-btn {
		font-size: 26rpx;
		background-color: #1890ff;
		color: white;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
	}
	
	.empty-state {
		text-align: center;
		padding: 50rpx 0;
		color: #999;
	}
	
	.loading-text {
		text-align: center;
		padding: 20rpx;
		color: #999;
	}
</style>