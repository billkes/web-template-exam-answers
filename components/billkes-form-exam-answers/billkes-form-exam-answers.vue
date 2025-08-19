
<template>
	<view class="billkes-form-exam-answers">
		<view class="answers-container">
			<view v-if="answers.length === 0" class="empty-state">
				<text class="empty-text">暂无答题记录</text>
				<button class="add-btn" @click="addAnswer" type="primary" size="mini">添加答案</button>
			</view>
			
			<view v-else class="answers-list">
				<view v-for="(answer, index) in answers" :key="index" class="answer-item">
					<view class="answer-header">
						<text class="answer-index">题目 {{ index + 1 }}</text>
						<button class="delete-btn" @click="removeAnswer(index)" type="warn" size="mini">删除</button>
					</view>
					
					<view class="answer-content">
						<view class="form-item">
							<text class="form-label">题目ID</text>
							<input v-model="answer.question_id" class="form-input" placeholder="请输入题目ID" />
						</view>
						
						<view class="form-item">
							<text class="form-label">用户答案</text>
							<input v-model="answer.user_answer" class="form-input" placeholder="请输入用户答案" />
						</view>
						
						<view class="form-item">
							<text class="form-label">是否正确</text>
							<view class="radio-group">
								<label class="radio-label">
									<radio :checked="answer.is_correct === true" @click="setCorrect(index, true)" />
									<text>正确</text>
								</label>
								<label class="radio-label">
									<radio :checked="answer.is_correct === false" @click="setCorrect(index, false)" />
									<text>错误</text>
								</label>
							</view>
						</view>
						
						<view class="form-item">
							<text class="form-label">得分</text>
							<input v-model.number="answer.score" type="number" class="form-input" placeholder="请输入得分" />
						</view>
					</view>
				</view>
				
				<view class="add-more">
					<button class="add-btn" @click="addAnswer" type="primary" size="mini">继续添加</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-exam-answers',
		props: {
			value: {
				type: Array,
				default: () => []
			},
			multiple: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				answers: []
			}
		},
		watch: {
			value: {
				handler(newVal) {
					this.answers = Array.isArray(newVal) ? newVal : [];
				},
				immediate: true,
				deep: true
			},
			answers: {
				handler(newVal) {
					this.$emit('input', newVal);
					this.$emit('change', newVal);
				},
				deep: true
			}
		},
		methods: {
			addAnswer() {
				const newAnswer = {
					question_id: '',
					user_answer: '',
					is_correct: false,
					score: 0
				};
				this.answers.push(newAnswer);
			},
			
			removeAnswer(index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这条答题记录吗？',
					success: (res) => {
						if (res.confirm) {
							this.answers.splice(index, 1);
						}
					}
				});
			},
			
			setCorrect(index, isCorrect) {
				if (this.answers[index]) {
					this.answers[index].is_correct = isCorrect;
				}
			},
			
			validate() {
				if (this.answers.length === 0) {
					return {
						valid: false,
						message: '请至少添加一条答题记录'
					};
				}
				
				for (let i = 0; i < this.answers.length; i++) {
					const answer = this.answers[i];
					if (!answer.question_id) {
						return {
							valid: false,
							message: `第 ${i + 1} 条记录的题目ID不能为空`
						};
					}
					if (!answer.user_answer) {
						return {
							valid: false,
							message: `第 ${i + 1} 条记录的用户答案不能为空`
						};
					}
				}
				
				return {
					valid: true,
					message: ''
				};
			},
			
			clear() {
				this.answers = [];
			},
			
			reset() {
				this.answers = Array.isArray(this.value) ? [...this.value] : [];
			}
		}
	}
</script>

<style scoped>
	.billkes-form-exam-answers {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.answers-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		border: 2px dashed #ddd;
		border-radius: 8px;
		background-color: #fafafa;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
		margin-bottom: 12px;
	}

	.answers-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.answer-item {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background-color: #fff;
		overflow: hidden;
	}

	.answer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background-color: #f5f5f5;
		border-bottom: 1px solid #e0e0e0;
	}

	.answer-index {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.delete-btn {
		min-width: 60px;
	}

	.answer-content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-label {
		font-size: 12px;
		color: #666;
		font-weight: 500;
	}

	.form-input {
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 14px;
		background-color: #fff;
		min-height: 36px;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: #007aff;
	}

	.radio-group {
		display: flex;
		gap: 16px;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 14px;
		color: #333;
	}

	.add-more {
		display: flex;
		justify-content: center;
		padding: 8px 0;
	}

	.add-btn {
		min-width: 100px;
	}
</style>
