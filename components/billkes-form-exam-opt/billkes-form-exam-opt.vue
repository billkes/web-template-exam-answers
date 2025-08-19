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
						<view class="option-actions">
							
							<button class="delete-btn" @click="removeOption(index)" type="warn" size="mini">删除</button>
						</view>
					</view>
					
					<view class="option-content">
						<view class="form-item">
							<text class="form-label">选项内容</text>
							<input 
								v-model="options[index]" 
								class="form-input" 
								placeholder="请输入选项内容"
								@input="handleOptionInput(index, $event)"
							/>
						</view>
					</view>
				</view>
				
				<view class="add-more">
					<button class="add-btn" @click="addOption" type="primary" size="mini">继续添加</button>
				</view>
			</view>
		</view>
		
		<!-- 正确答案预览 -->
		<view v-if="correctAnswers.length > 0" class="correct-preview">
			<text class="preview-label">正确答案：</text>
			<view class="correct-answers">
				<text 
					v-for="answer in correctAnswers" 
					:key="answer"
					class="answer-tag"
				>
					{{ getOptionLabel(answer) }}
				</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-exam-opt',
		props: {
			modelValue: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				options: [],
				correctAnswers: []
			}
		},
		watch: {
			modelValue: {
				handler(newVal) {
					this.options = Array.isArray(newVal) ? [...newVal] : []
				},
				immediate: true,
				deep: true
			},
			options: {
				handler(newVal) {
					this.$emit('update:modelValue', newVal)
					this.$emit('change', newVal)
				},
				deep: true
			}
		},
		methods: {
			// 添加选项
			addOption() {
				this.options.push('')
				// 自动聚焦到新添加的选项
				this.$nextTick(() => {
					const inputs = document.querySelectorAll('.form-input')
					if (inputs.length > 0) {
						inputs[inputs.length - 1].focus()
					}
				})
			},
			
			// 删除选项
			removeOption(index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个选项吗？',
					success: (res) => {
						if (res.confirm) {
							const removedOption = this.options[index]
							this.options.splice(index, 1)
							// 如果删除的是正确答案，从正确答案中移除
							this.correctAnswers = this.correctAnswers.filter(answer => answer !== removedOption)
						}
					}
				})
			},
			
			
			// 处理选项输入
			handleOptionInput(index, event) {
				const newValue = event.target.value
				const oldValue = this.options[index]
				
				// 如果选项内容发生变化，更新正确答案中的对应项
				if (oldValue && newValue !== oldValue) {
					const correctIndex = this.correctAnswers.indexOf(oldValue)
					if (correctIndex > -1) {
						this.correctAnswers[correctIndex] = newValue
					}
				}
			},
			
			// 获取选项标签
			getOptionLabel(option) {
				const index = this.options.indexOf(option)
				return index >= 0 ? String.fromCharCode(65 + index) : option
			},
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
	
	.option-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	
	.correct-toggle {
		display: flex;
		align-items: center;
	}
	
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: #333;
	}
	
	.delete-btn {
		min-width: 60px;
	}
	
	.option-content {
		padding: 16px;
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
	
	
	.add-more {
		display: flex;
		justify-content: center;
		padding: 8px 0;
	}
	
	.add-btn {
		min-width: 100px;
	}
	
	.correct-preview {
		margin-top: 12px;
		padding: 12px;
		background-color: #f6ffed;
		border: 1px solid #b7eb8f;
		border-radius: 4px;
	}
	
	.preview-label {
		font-size: 12px;
		color: #52c41a;
		font-weight: 500;
		margin-bottom: 8px;
		display: block;
	}
	
	.correct-answers {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	
	.answer-tag {
		font-size: 12px;
		color: #1890ff;
		background-color: #e6f7ff;
		padding: 2px 8px;
		border-radius: 2px;
		border: 1px solid #91d5ff;
		font-weight: 500;
	}
</style>
