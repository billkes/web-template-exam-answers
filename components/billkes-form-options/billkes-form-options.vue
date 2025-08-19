<template>
	<view class="billkes-form-options">
		<view class="options-container">
			<view v-for="(option, index) in currentOptions" :key="index" class="option-item">
				<view class="option-header">
					<text class="option-label">{{ getOptionLabel(index) }}.</text>
					<view class="option-input-container">
						<input v-model="currentOptions[index]" class="option-input"
							:placeholder="`选项${getOptionLabel(index)}`" @input="emitChange" maxlength="200" />
					</view>
					<view v-if="editable && currentOptions.length > minOptions" class="option-actions">
						<text class="remove-btn" @click="removeOption(index)">×</text>
					</view>
				</view>
			</view>

			<view v-if="editable && currentOptions.length < maxOptions" class="add-option">
				<button class="add-btn" @click="addOption" :disabled="currentOptions.length >= maxOptions">
					+ 添加选项
				</button>
			</view>
		</view>

		<view v-if="showValidation && !isValid" class="validation-error">
			{{ validationMessage }}
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-options',
		props: {
			value: {
				type: Array,
				default: () => []
			},
			editable: {
				type: Boolean,
				default: true
			},
			minOptions: {
				type: Number,
				default: 2
			},
			maxOptions: {
				type: Number,
				default: 8
			},
			required: {
				type: Boolean,
				default: true
			},
			showValidation: {
				type: Boolean,
				default: false
			},
			allowEmpty: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				currentOptions: [...this.value],
				isValid: true,
				validationMessage: ''
			}
		},
		watch: {
			value(newVal) {
				this.currentOptions = [...newVal];
				this.validate();
			}
		},
		methods: {
			addOption() {
				if (this.currentOptions.length >= this.maxOptions) return;

				this.currentOptions.push('');
				this.emitChange();
			},

			removeOption(index) {
				if (this.currentOptions.length <= this.minOptions) return;

				this.currentOptions.splice(index, 1);
				this.emitChange();
			},

			emitChange() {
				this.validate();
				this.$emit('input', this.currentOptions);
				this.$emit('change', this.currentOptions);
			},

			getOptionLabel(index) {
				const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
				return labels[index] || String.fromCharCode(65 + index);
			},

			validate() {
				if (!this.required) {
					this.isValid = true;
					this.validationMessage = '';
					return true;
				}

				// 检查最小数量
				if (this.currentOptions.length < this.minOptions) {
					this.isValid = false;
					this.validationMessage = `至少需要${this.minOptions}个选项`;
					return false;
				}

				// 检查是否允许空值
				if (!this.allowEmpty) {
					const hasEmptyOption = this.currentOptions.some(option => !option || !option.trim());
					if (hasEmptyOption) {
						this.isValid = false;
						this.validationMessage = '选项内容不能为空';
						return false;
					}
				}

				// 检查重复选项
				const trimmedOptions = this.currentOptions.map(option => option ? option.trim() : '');
				const uniqueOptions = [...new Set(trimmedOptions)];
				if (uniqueOptions.length !== trimmedOptions.length) {
					this.isValid = false;
					this.validationMessage = '选项内容不能重复';
					return false;
				}

				this.isValid = true;
				this.validationMessage = '';
				return true;
			},

			clearAll() {
				this.currentOptions = [];
				this.emitChange();
			},

			reset() {
				this.currentOptions = [...this.value];
				this.validate();
			}
		}
	}
</script>

<style scoped>
	.billkes-form-options {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.options-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.option-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.option-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.option-label {
		font-size: 14px;
		color: #666;
		font-weight: 500;
		min-width: 24px;
		text-align: center;
	}

	.option-input-container {
		flex: 1;
	}

	.option-input {
		width: 100%;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 14px;
		min-height: 36px;
		box-sizing: border-box;
	}

	.option-input:focus {
		outline: none;
		border-color: #007aff;
	}

	.option-actions {
		display: flex;
		align-items: center;
	}

	.remove-btn {
		font-size: 18px;
		color: #999;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.remove-btn:hover {
		color: #ff4444;
		background-color: #ffeeee;
	}

	.add-option {
		display: flex;
		justify-content: flex-start;
		margin-top: 8px;
	}

	.add-btn {
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 8px 16px;
		font-size: 14px;
		min-width: 80px;
	}

	.add-btn:disabled {
		background-color: #ccc;
	}

	.validation-error {
		color: #ff4444;
		font-size: 12px;
		margin-top: 4px;
		padding: 4px 8px;
		background-color: #ffeeee;
		border-radius: 4px;
	}
</style>