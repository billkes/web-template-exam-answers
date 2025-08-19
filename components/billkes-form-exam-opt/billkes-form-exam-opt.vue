
<template>
	<view class="billkes-form-exam-opt">
		<view class="options-container">
			<view v-if="options.length === 0" class="empty-state">
				<text class="empty-text">暂无选项</text>
				<button class="add-btn" @click="addOption" type="primary" size="mini">添加选项</button>
			</view>
			
			<view v-else class="options-list">
				<view v-for="(option, index) in options" :key="index" class="option-item">
					<view class="option-header">
						<text class="option-index">选项 {{ String.fromCharCode(65 + index) }}</text>
						<button class="delete-btn" @click="removeOption(index)" type="warn" size="mini">删除</button>
					</view>
					
					<view class="option-content">
						<view class="form-item">
							<text class="form-label">选项内容</text>
							<input v-model="option.text" class="form-input" placeholder="请输入选项内容" />
						</view>
						
						<view class="form-item">
							<text class="form-label">选项值</text>
							<input v-model="option.value" class="form-input" placeholder="请输入选项值" />
						</view>
						
						<view class="form-item">
							<text class="form-label">是否正确答案</text>
							<view class="radio-group">
								<label class="radio-label">
									<radio :checked="option.is_correct === true" @click="setCorrect(index, true)" />
									<text>是</text>
								</label>
								<label class="radio-label">
									<radio :checked="option.is_correct === false" @click="setCorrect(index, false)" />
									<text>否</text>
								</label>
							</view>
						</view>
					</view>
				</view>
				
				<view class="add-more">
					<button class="add-btn" @click="addOption" type="primary" size="mini">继续添加</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-exam-opt',
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
				options: []
			}
		},
		watch: {
			value: {
				handler(newVal) {
					this.options = Array.isArray(newVal) ? newVal : [];
				},
				immediate: true,
				deep: true
			},
			options: {
				handler(newVal) {
					this.$emit('input', newVal);
					this.$emit('change', newVal);
				},
				deep: true
			}
		},
		methods: {
			addOption() {
				const newOption = {
					text: '',
					value: String.fromCharCode(65 + this.options.length),
					is_correct: false
				};
				this.options.push(newOption);
			},
			
			removeOption(index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个选项吗？',
					success: (res) => {
						if (res.confirm) {
							this.options.splice(index, 1);
							// 重新生成选项值
							this.options.forEach((option, idx) => {
								option.value = String.fromCharCode(65 + idx);
							});
						}
					}
				});
			},
			
			setCorrect(index, isCorrect) {
				if (this.options[index]) {
					// 如果是单选题，取消其他选项的正确状态
					if (!this.multiple && isCorrect) {
						this.options.forEach((option, idx) => {
							if (idx !== index) {
								option.is_correct = false;
							}
						});
					}
					this.options[index].is_correct = isCorrect;
				}
			},
			
			validate() {
				if (this.options.length < 2) {
					return {
						valid: false,
						message: '请至少添加两个选项'
					};
				}
				
				for (let i = 0; i < this.options.length; i++) {
					const option = this.options[i];
					if (!option.text) {
						return {
							valid: false,
							message: `选项 ${String.fromCharCode(65 + i)} 的内容不能为空`
						};
					}
					if (!option.value) {
						return {
							valid: false,
							message: `选项 ${String.fromCharCode(65 + i)} 的值不能为空`
						};
					}
				}
				
				// 检查是否至少有一个正确答案
				const hasCorrectAnswer = this.options.some(option => option.is_correct);
				if (!hasCorrectAnswer) {
					return {
						valid: false,
						message: '请至少设置一个正确答案'
					};
				}
				
				// 如果是单选题，检查是否只有一个正确答案
				if (!this.multiple) {
					const correctCount = this.options.filter(option => option.is_correct).length;
					if (correctCount > 1) {
						return {
							valid: false,
							message: '单选题只能有一个正确答案'
						};
					}
				}
				
				return {
					valid: true,
					message: ''
				};
			},
			
			getCorrectAnswers() {
				return this.options
					.filter(option => option.is_correct)
					.map(option => option.value);
			},
			
			clear() {
				this.options = [];
			},
			
			reset() {
				this.options = Array.isArray(this.value) ? [...this.value] : [];
			}
		}
	}
</script>

<style scoped>
	.billkes-form-exam-opt {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.options-container {
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

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.option-item {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background-color: #fff;
		overflow: hidden;
	}

	.option-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background-color: #f5f5f5;
		border-bottom: 1px solid #e0e0e0;
	}

	.option-index {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.delete-btn {
		min-width: 60px;
	}

	.option-content {
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
