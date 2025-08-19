<template>
	<view class="billkes-form-select">
		<picker @change="onPickerChange" :value="selectedIndex" :range="displayOptions" :range-key="rangeKey"
			:disabled="disabled">
			<view class="picker-container">
				<input v-model="displayText" class="select-input" :placeholder="placeholder" :disabled="disabled"
					readonly />
				<view v-if="!disabled" class="arrow-icon">▼</view>
			</view>
		</picker>

		<view v-if="showValidation && !isValid" class="validation-error">
			{{ validationMessage }}
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-select',
		props: {
			value: {
				type: [String, Number],
				default: ''
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
			placeholder: {
				type: String,
				default: '请选择'
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
			allowClear: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				isValid: true,
				validationMessage: ''
			}
		},
		computed: {
			displayOptions() {
				if (this.options.length === 0) return [];

				// 如果选项是字符串数组，直接返回
				if (typeof this.options[0] === 'string') {
					return this.options;
				}

				// 如果选项是对象数组，提取显示文本
				return this.options.map(option => option[this.rangeKey] || option);
			},

			selectedIndex() {
				if (this.options.length === 0) return -1;

				// 查找当前值对应的索引
				const index = this.options.findIndex(option => {
					if (typeof option === 'string') {
						return option === this.value;
					} else {
						return option[this.valueKey] === this.value;
					}
				});

				return index >= 0 ? index : -1;
			},

			displayText() {
				if (this.selectedIndex === -1) return '';

				const selectedOption = this.options[this.selectedIndex];
				if (typeof selectedOption === 'string') {
					return selectedOption;
				} else {
					return selectedOption[this.rangeKey] || '';
				}
			}
		},
		watch: {
			value() {
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
			onPickerChange(e) {
				const index = e.detail.value;

				if (index === -1 || index >= this.options.length) {
					this.clear();
					return;
				}

				const selectedOption = this.options[index];
				let selectedValue;

				if (typeof selectedOption === 'string') {
					selectedValue = selectedOption;
				} else {
					selectedValue = selectedOption[this.valueKey];
				}

				this.validate(selectedValue);
				this.$emit('input', selectedValue);
				this.$emit('change', selectedValue);

				// 触发选择事件，传递完整的选项对象
				this.$emit('select', {
					value: selectedValue,
					option: selectedOption,
					index: index
				});
			},

			validate(selectedValue = this.value) {
				if (!this.required && !selectedValue) {
					this.isValid = true;
					this.validationMessage = '';
					return true;
				}

				if (this.required && !selectedValue) {
					this.isValid = false;
					this.validationMessage = '请选择一个选项';
					return false;
				}

				// 检查值是否在选项中
				const exists = this.options.some(option => {
					if (typeof option === 'string') {
						return option === selectedValue;
					} else {
						return option[this.valueKey] === selectedValue;
					}
				});

				if (!exists) {
					this.isValid = false;
					this.validationMessage = '选择的值不在选项列表中';
					return false;
				}

				this.isValid = true;
				this.validationMessage = '';
				return true;
			},

			clear() {
				if (!this.allowClear) return;

				this.$emit('input', '');
				this.$emit('change', '');
				this.$emit('clear');
			},

			reset() {
				this.validate();
			},

			getSelectedOption() {
				if (this.selectedIndex === -1) return null;
				return this.options[this.selectedIndex];
			},

			getSelectedValue() {
				return this.value;
			},

			getSelectedLabel() {
				return this.displayText;
			},

			setValue(value) {
				this.validate(value);
				this.$emit('input', value);
				this.$emit('change', value);
			}
		}
	}
</script>

<style scoped>
	.billkes-form-select {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.picker-container {
		display: flex;
		align-items: center;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #fff;
		min-height: 36px;
	}

	.picker-container:active {
		border-color: #007aff;
	}

	.select-input {
		flex: 1;
		border: none;
		padding: 8px 12px;
		font-size: 14px;
		background-color: transparent;
		cursor: pointer;
	}

	.select-input:disabled {
		background-color: #f5f5f5;
		color: #999;
		cursor: not-allowed;
	}

	.select-input:focus {
		outline: none;
	}

	.arrow-icon {
		padding: 8px 12px;
		font-size: 12px;
		color: #666;
		transition: transform 0.2s;
	}

	.arrow-icon:hover {
		color: #007aff;
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