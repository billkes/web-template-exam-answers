<template>
	<view class="billkes-form-checkbox">
		<view class="checkbox-container">
			<view v-for="(option, index) in options" :key="index" class="checkbox-item" @click="toggleOption(index)">
				<view class="checkbox-box" :class="{ 
						'checked': isChecked(option), 
						'disabled': disabled 
					}">
					<text v-if="isChecked(option)" class="checkmark">✓</text>
				</view>
				<text class="checkbox-label" :class="{ 'disabled': disabled }">
					{{ getOptionLabel(option) }}
				</text>
			</view>
		</view>

		<view v-if="showValidation && !isValid" class="validation-error">
			{{ validationMessage }}
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-checkbox',
		props: {
			value: {
				type: Array,
				default: () => []
			},
			options: {
				type: Array,
				default: () => []
			},
			rangeKey: {
				type: String,
				default: 'label'
			},
			valueKey: {
				type: String,
				default: 'value'
			},
			showValidation: {
				type: Boolean,
				default: false
			},
			required: {
				type: Boolean,
				default: false
			},
			disabled: {
				type: Boolean,
				default: false
			},
			minSelected: {
				type: Number,
				default: 0
			},
			maxSelected: {
				type: Number,
				default: Infinity
			}
		},
		data() {
			return {
				currentValues: [...this.value],
				isValid: true,
				validationMessage: ''
			}
		},
		watch: {
			value(newVal) {
				this.currentValues = [...newVal];
				this.validate();
			},
			options() {
				this.validate();
			}
		},
		created() {
			this.validate();
		},
		methods: {
			toggleOption(index) {
				if (this.disabled) return;

				const option = this.options[index];
				const optionValue = this.getOptionValue(option);
				const currentIndex = this.currentValues.indexOf(optionValue);

				if (currentIndex === -1) {
					// 添加选项
					if (this.currentValues.length >= this.maxSelected) {
						uni.showToast({
							title: `最多只能选择${this.maxSelected}项`,
							icon: 'none'
						});
						return;
					}
					this.currentValues.push(optionValue);
				} else {
					// 移除选项
					if (this.currentValues.length <= this.minSelected) {
						uni.showToast({
							title: `至少需要选择${this.minSelected}项`,
							icon: 'none'
						});
						return;
					}
					this.currentValues.splice(currentIndex, 1);
				}

				this.emitChange();
			},

			isChecked(option) {
				const optionValue = this.getOptionValue(option);
				return this.currentValues.includes(optionValue);
			},

			getOptionValue(option) {
				if (typeof option === 'string') {
					return option;
				} else {
					return option[this.valueKey];
				}
			},

			getOptionLabel(option) {
				if (typeof option === 'string') {
					return option;
				} else {
					return option[this.rangeKey] || option[this.valueKey];
				}
			},

			emitChange() {
				this.validate();
				this.$emit('input', this.currentValues);
				this.$emit('change', this.currentValues);

				// 触发选择事件，传递选中的选项对象
				const selectedOptions = this.options.filter(option =>
					this.currentValues.includes(this.getOptionValue(option))
				);
				this.$emit('select', {
					values: this.currentValues,
					options: selectedOptions
				});
			},

			validate(values = this.currentValues) {
				if (!this.required && values.length === 0) {
					this.isValid = true;
					this.validationMessage = '';
					return true;
				}

				if (this.required && values.length === 0) {
					this.isValid = false;
					this.validationMessage = '请至少选择一个选项';
					return false;
				}

				if (values.length < this.minSelected) {
					this.isValid = false;
					this.validationMessage = `至少需要选择${this.minSelected}项`;
					return false;
				}

				if (values.length > this.maxSelected) {
					this.isValid = false;
					this.validationMessage = `最多只能选择${this.maxSelected}项`;
					return false;
				}

				this.isValid = true;
				this.validationMessage = '';
				return true;
			},

			selectAll() {
				if (this.disabled) return;

				const allValues = this.options.map(option => this.getOptionValue(option));
				this.currentValues = allValues.slice(0, this.maxSelected);
				this.emitChange();
			},

			clearAll() {
				if (this.disabled) return;

				this.currentValues = [];
				this.emitChange();
			},

			reset() {
				this.currentValues = [...this.value];
				this.validate();
			},

			getSelectedValues() {
				return [...this.currentValues];
			},

			getSelectedOptions() {
				return this.options.filter(option =>
					this.currentValues.includes(this.getOptionValue(option))
				);
			},

			setValues(values) {
				this.currentValues = [...values];
				this.emitChange();
			}
		}
	}
</script>

<style scoped>
	.billkes-form-checkbox {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.checkbox-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.checkbox-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
		cursor: pointer;
	}

	.checkbox-box {
		width: 18px;
		height: 18px;
		border: 2px solid #ddd;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.checkbox-box.checked {
		background-color: #007aff;
		border-color: #007aff;
	}

	.checkbox-box.disabled {
		background-color: #f5f5f5;
		border-color: #e0e0e0;
		cursor: not-allowed;
	}

	.checkbox-box.disabled.checked {
		background-color: #ccc;
		border-color: #ccc;
	}

	.checkmark {
		color: white;
		font-size: 12px;
		font-weight: bold;
		line-height: 1;
	}

	.checkbox-label {
		font-size: 14px;
		color: #333;
		flex: 1;
	}

	.checkbox-label.disabled {
		color: #999;
		cursor: not-allowed;
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