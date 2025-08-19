<template>
	<view class="billkes-form-exam-questions">
		<uni-forms ref="form" :model="formData" :rules="rules">
			<!-- 题目标题 -->
			<uni-forms-item label="题目标题" name="title" required>
				<uni-easyinput 
					v-model="formData.title" 
					placeholder="请输入题目标题"
					:clearable="true"
				/>
			</uni-forms-item>
			
			<!-- 题目类型 -->
			<uni-forms-item label="题目类型" name="type" required>
				<uni-data-select 
					v-model="formData.type" 
					:localdata="typeOptions"
					placeholder="请选择题目类型"
					:clear="false"
					@change="handleTypeChange"
				/>
			</uni-forms-item>
			
			<!-- 题目选项 -->
			<uni-forms-item label="选项" name="options" required>
				<billkes-form-exam-opt 
					v-model="formData.options"
					:question-type="formData.type"
					@change="handleOptionsChange"
				/>
			</uni-forms-item>
			
			<!-- 答案 -->
			<uni-forms-item label="答案" name="answer" required>
				<uni-easyinput 
					v-model="formData.answer" 
					placeholder="请输入题目答案"
					:clearable="true"
				/>
			</uni-forms-item>
			
			<!-- 解析 -->
			<uni-forms-item label="解析" name="analysis">
				<uni-easyinput 
					v-model="formData.analysis" 
					type="textarea"
					placeholder="请输入题目解析"
					:clearable="true"
				/>
			</uni-forms-item>
			
			<!-- 难度 -->
			<uni-forms-item label="难度" name="difficulty" required>
				<uni-data-select 
					v-model="formData.difficulty" 
					:localdata="difficultyOptions"
					placeholder="请选择题目难度"
					:clear="false"
				/>
			</uni-forms-item>
			
			<!-- 科目 -->
			<uni-forms-item label="科目" name="subject">
				<uni-easyinput 
					v-model="formData.subject" 
					placeholder="请输入所属科目"
					:clearable="true"
				/>
			</uni-forms-item>
			
			<!-- 标签 -->
			<uni-forms-item label="标签" name="tags">
				<billkes-form-tags 
					v-model="formData.tags"
					placeholder="请输入题目标签"
				/>
			</uni-forms-item>
		</uni-forms>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-exam-questions',
		props: {
			modelValue: {
				type: Object,
				default: () => ({})
			},
			// 是否多选模式
			multiple: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				formData: {
					title: '',
					type: 'single',
					options: [],
					answer: '',
					analysis: '',
					difficulty: 1,
					subject: '',
					tags: []
				},
				rules: {
					title: {
						rules: [{
							required: true,
							errorMessage: '请输入题目标题'
						}]
					},
					type: {
						rules: [{
							required: true,
							errorMessage: '请选择题目类型'
						}]
					},
					options: {
						rules: [{
							required: true,
							errorMessage: '请设置题目选项'
						}, {
							validateFunction: (rule, value, data, callback) => {
								if (!Array.isArray(value) || value.length < 2) {
									callback('至少需要设置2个选项')
								} else {
									callback()
								}
							}
						}]
					},
					answer: {
						rules: [{
							required: true,
							errorMessage: '请输入题目答案'
						}]
					},
					difficulty: {
						rules: [{
							required: true,
							errorMessage: '请选择题目难度'
						}]
					}
				},
				typeOptions: [
					{ value: 'single', text: '单选题' },
					{ value: 'multiple', text: '多选题' }
				],
				difficultyOptions: [
					{ value: 1, text: '简单' },
					{ value: 2, text: '中等' },
					{ value: 3, text: '困难' }
				]
			}
		},
		watch: {
			modelValue: {
				handler(newVal) {
					if (newVal) {
						this.formData = { ...this.formData, ...newVal }
					}
				},
				immediate: true,
				deep: true
			},
			formData: {
				handler(newVal) {
					this.$emit('update:modelValue', newVal)
				},
				deep: true
			}
		},
		methods: {
			// 处理题目类型变化
			handleTypeChange(value) {
				// 当题目类型变化时，重置选项和答案
				if (value !== this.formData.type) {
					this.formData.options = []
					this.formData.answer = ''
				}
			},
			
			// 处理选项变化
			handleOptionsChange(options) {
				// 当选项变化时，如果答案不在选项中，清空答案
				if (Array.isArray(options) && options.length > 0) {
					const optionValues = options.map(opt => opt.value)
					if (this.formData.answer && !optionValues.includes(this.formData.answer)) {
						this.formData.answer = ''
					}
				}
			},
			
			// 验证表单
			validate() {
				return new Promise((resolve, reject) => {
					this.$refs.form.validate().then(res => {
						resolve(res)
					}).catch(err => {
						reject(err)
					})
				})
			},
			
			// 清空表单
			clear() {
				this.formData = {
					title: '',
					type: 'single',
					options: [],
					answer: '',
					analysis: '',
					difficulty: 1,
					subject: '',
					tags: []
				}
				this.$refs.form.clearValidate()
			},
			
			// 重置表单
			reset() {
				if (this.modelValue) {
					this.formData = { ...this.formData, ...this.modelValue }
				} else {
					this.clear()
				}
			}
		}
	}
</script>

<style scoped>
	.billkes-form-exam-questions {
		padding: 10px;
	}
	
	/* 表单项间距 */
	:deep(.uni-forms-item) {
		margin-bottom: 15px;
	}
	
	/* 标签样式 */
	:deep(.uni-forms-item__label) {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}
	
	/* 输入框样式 */
	:deep(.uni-easyinput) {
		background-color: #f8f8f8;
		border-radius: 4px;
	}
	
	/* 选择器样式 */
	:deep(.uni-data-select) {
		background-color: #f8f8f8;
		border-radius: 4px;
	}
</style>
