<template>
	<view class="exam-page">
		<view class="exam-header" v-if="examData">
			<text class="exam-title">{{ examData.examSchedule.title }}</text>
			<view class="exam-info">
				<text>总分：{{ examData.total_full_mark }}</text>
				<text>及格分：{{ examData.pass_score }}</text>
				<text>时长：{{ examData.examSchedule.duration }}分钟</text>
			</view>
			<view class="timer">
				<text class="time-text">剩余时间：{{ formatTime(remainingTime) }}</text>
			</view>
		</view>
		
		<view class="question-section" v-if="examData && currentQuestion">
			<view class="question-progress">
				<text>第 {{ currentIndex + 1 }} 题 / 共 {{ examData.answers.length }} 题</text>
			</view>
			
			<view class="question-content">
				<view class="question-title">
					<text class="question-number">{{ currentIndex + 1 }}.</text>
					<text>{{ currentQuestion.questions.title }}</text>
				</view>
				
				<view class="question-options">
					<view 
						v-for="(option, index) in currentQuestion.questions.options" 
						:key="index" 
						class="option-item"
						:class="{ selected: isOptionSelected(index) }"
						@click="selectOption(index)"
					>
						<view class="option-prefix">
							<text>{{ getOptionLabel(index) }}.</text>
						</view>
						<view class="option-content">
							<text>{{ option }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="question-actions">
				<button 
					class="nav-btn prev-btn" 
					:disabled="currentIndex === 0" 
					@click="prevQuestion"
				>
					上一题
				</button>
				
				<button 
					v-if="currentIndex < examData.answers.length - 1" 
					class="nav-btn next-btn" 
					@click="nextQuestion"
				>
					下一题
				</button>
				
				<button 
					v-else 
					class="nav-btn submit-btn" 
					@click="submitExam"
				>
					交卷
				</button>
			</view>
		</view>
		
		<view class="loading" v-if="loading">
			<text>加载中...</text>
		</view>
		
		<view class="error" v-if="error">
			<text>{{ error }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				examId: '',
				examData: null,
				currentIndex: 0,
				remainingTime: 0,
				timer: null,
				loading: false,
				error: ''
			}
		},
		computed: {
			currentQuestion() {
				if (!this.examData || !this.examData.answers || this.currentIndex >= this.examData.answers.length) {
					return null;
				}
				return this.examData.answers[this.currentIndex];
			}
		},
		onLoad(options) {
			if (options.id) {
				this.examId = options.id;
				this.loadExamData();
			} else {
				this.error = '考试ID不能为空';
			}
		},
		onUnload() {
			// 清除定时器
			if (this.timer) {
				clearInterval(this.timer);
			}
		},
		methods: {
			// 加载考试数据
			async loadExamData() {
				this.loading = true;
				try {
					// 判断是开始考试还是继续考试
					const action = this.isNewExam() ? 'startExam' : 'continueExam';
					
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: action,
							params: {
								id: this.examId
							}
						}
					});
					
					if (res.result.code === 0) {
						this.examData = res.result.examData;
						this.startTimer();
					} else {
						this.error = res.result.message;
					}
				} catch (error) {
					console.error('加载考试数据失败:', error);
					this.error = '加载考试数据失败';
				} finally {
					this.loading = false;
				}
			},
			
			// 判断是否是新考试
			isNewExam() {
				// 这里可以根据考试状态判断，实际开发中可能需要更复杂的逻辑
				return true;
			},
			
			// 开始计时器
			startTimer() {
				if (!this.examData || !this.examData.examSchedule) return;
				
				// 计算剩余时间（秒）
				const endTime = this.examData.examSchedule.end_time;
				const now = Date.now();
				this.remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
				
				// 启动定时器
				this.timer = setInterval(() => {
					this.remainingTime--;
					if (this.remainingTime <= 0) {
						this.submitExam();
					}
				}, 1000);
			},
			
			// 格式化时间
			formatTime(seconds) {
				const h = Math.floor(seconds / 3600);
				const m = Math.floor((seconds % 3600) / 60);
				const s = seconds % 60;
				
				if (h > 0) {
					return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
				}
				return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
			},
			
			// 获取选项标签
			getOptionLabel(index) {
				return String.fromCharCode(65 + index); // A, B, C, D...
			},
			
			// 判断选项是否被选中
			isOptionSelected(index) {
				if (!this.currentQuestion || !this.currentQuestion.user_answer) {
					return false;
				}
				return this.currentQuestion.user_answer.includes(index);
			},
			
			// 选择选项
			async selectOption(index) {
				if (!this.currentQuestion) return;
				
				const questionType = this.currentQuestion.questions.type;
				let newUserAnswer = [];
				
				if (questionType === 'single') {
					// 单选题
					newUserAnswer = [index];
				} else if (questionType === 'multiple') {
					// 多选题
					const currentAnswer = this.currentQuestion.user_answer || [];
					if (currentAnswer.includes(index)) {
						// 取消选择
						newUserAnswer = currentAnswer.filter(i => i !== index);
					} else {
						// 添加选择
						newUserAnswer = [...currentAnswer, index];
					}
				}
				
				// 更新本地数据
				this.examData.answers[this.currentIndex].user_answer = newUserAnswer;
				
				// 调用云函数保存答案
				await this.saveAnswer(newUserAnswer);
			},
			
			// 保存答案
			async saveAnswer(userAnswer) {
				try {
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'answerQuestion',
							params: {
								id: this.examId,
								index: this.currentIndex,
								user_answer: userAnswer
							}
						}
					});
					
					if (res.result.code !== 0) {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('保存答案失败:', error);
					uni.showToast({
						title: '保存答案失败',
						icon: 'none'
					});
				}
			},
			
			// 上一题
			prevQuestion() {
				if (this.currentIndex > 0) {
					this.currentIndex--;
				}
			},
			
			// 下一题
			nextQuestion() {
				if (this.currentIndex < this.examData.answers.length - 1) {
					this.currentIndex++;
				}
			},
			
			// 交卷
			async submitExam() {
				// 停止计时器
				if (this.timer) {
					clearInterval(this.timer);
				}
				
				try {
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'submitExam',
							params: {
								id: this.examId
							}
						}
					});
					
					if (res.result.code === 0) {
						uni.showModal({
							title: '交卷成功',
							content: `您的得分：${res.result.total_score}分，用时：${this.formatTime(res.result.time_spent)}`,
							showCancel: false,
							success: () => {
								uni.navigateBack();
							}
						});
					} else {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('交卷失败:', error);
					uni.showToast({
						title: '交卷失败',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style>
	.exam-page {
		padding: 20rpx;
	}
	
	.exam-header {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}
	
	.exam-title {
		font-size: 36rpx;
		font-weight: bold;
		display: block;
		margin-bottom: 15rpx;
	}
	
	.exam-info {
		display: flex;
		justify-content: space-between;
		font-size: 26rpx;
		color: #666;
		margin-bottom: 15rpx;
	}
	
	.timer {
		text-align: center;
	}
	
	.time-text {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff4d4f;
	}
	
	.question-section {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}
	
	.question-progress {
		text-align: center;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 30rpx;
	}
	
	.question-title {
		font-size: 32rpx;
		margin-bottom: 30rpx;
		line-height: 1.5;
	}
	
	.question-number {
		font-weight: bold;
		margin-right: 10rpx;
	}
	
	.question-options {
		margin-bottom: 40rpx;
	}
	
	.option-item {
		display: flex;
		align-items: flex-start;
		padding: 20rpx;
		margin-bottom: 20rpx;
		border: 2rpx solid #e8e8e8;
		border-radius: 10rpx;
		background-color: #fafafa;
	}
	
	.option-item.selected {
		border-color: #1890ff;
		background-color: #e6f7ff;
	}
	
	.option-prefix {
		font-weight: bold;
		margin-right: 20rpx;
		min-width: 40rpx;
	}
	
	.option-content {
		flex: 1;
		font-size: 28rpx;
		line-height: 1.4;
	}
	
	.question-actions {
		display: flex;
		justify-content: space-between;
	}
	
	.nav-btn {
		flex: 1;
		font-size: 28rpx;
		padding: 20rpx;
		margin: 0 10rpx;
		border-radius: 10rpx;
	}
	
	.prev-btn {
		background-color: #f0f0f0;
		color: #333;
	}
	
	.next-btn {
		background-color: #1890ff;
		color: #fff;
	}
	
	.submit-btn {
		background-color: #52c41a;
		color: #fff;
	}
	
	.loading, .error {
		text-align: center;
		padding: 50rpx 0;
		font-size: 28rpx;
	}
	
	.error {
		color: #ff4d4f;
	}
</style>