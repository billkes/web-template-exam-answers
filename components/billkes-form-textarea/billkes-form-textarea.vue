<template>
	<view class="billkes-form-textarea">
		<view class="textarea-container">
			<textarea v-model="currentValue" class="textarea-input" :placeholder="placeholder" :disabled="disabled"
				:maxlength="maxlength" :autoHeight="autoHeight" :showConfirmBar="showConfirmBar" @input="onInput"
				@blur="onBlur" @focus="onFocus" @confirm="onConfirm"></textarea>

			<view v-if="showCounter" class="char-counter">
				<text :class="{ 'warning': isNearLimit, 'error': isAtLimit }">
					{{ currentLength }}/{{ maxlength }}
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
		name: 'billkes-form-textarea',
		props: {
			value: {
				type: String,
				default: ''
			},
			placeholder: {
				type: String,
				default: '请输入内容'
			},
			maxlength: {
				type: Number,
				default: 500
			},
			minlength: {
				type: Number,
				default: 0
			},
			showCounter: {
				type: Boolean,
				default: true
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
			autoHeight: {
				type: Boolean,
				default: false
			},
			showConfirmBar: {
				type: Boolean,
				default: false
			},
			trim: {
				type: Boolean,
				default: false
			},
			warningThreshold: {
				type: Number,
				default: 0.8 // 80%时显示警告
			}
		},
		data() {
			return {
				currentValue: this.value,
				isValid: true,
				validationMessage: ''
			}
		},
		computed: {
			currentLength() {
				return (this.currentValue || '').length;
			},

			isNearLimit() {
				return this.currentLength >= this.maxlength * this.warningThreshold;
			},

			isAtLimit() {
				return this.currentLength >= this.maxlength;
			}
		},
		watch: {
			value(newVal) {
				this.currentValue = newVal;
				this.validate();
			}
		},
		created() {
			this.validate();
		},
		methods: {
			onInput(e) {
				let value = e.detail.value;

				if (this.trim) {
					value = value.trim();
				}

				this.currentValue = value;
				this.validate();
				this.$emit('input', value);
				this.$emit('change', value);
			},

			onBlur(e) {
				let value = e.detail.value;

				if (this.trim) {
					value = value.trim();
					this.currentValue = value;
				}

				this.validate();
				this.$emit('blur', value);
			},

			onFocus(e) {
				this.$emit('focus', e.detail.value);
			},

			onConfirm(e) {
				let value = e.detail.value;

				if (this.trim) {
					value = value.trim();
				}

				this.$emit('confirm', value);
			},

			validate(value = this.currentValue) {
				if (!this.required && !value) {
					this.isValid = true;
					this.validationMessage = '';
					return true;
				}

				if (this.required && !value) {
					this.isValid = false;
					this.validationMessage = '内容不能为空';
					return false;
				}

				if (value.length < this.minlength) {
					this.isValid = false;
					this.validationMessage = `内容至少需要${this.minlength}个字符`;
					return false;
				}

				if (value.length > this.maxlength) {
					this.isValid = false;
					this.validationMessage = `内容不能超过${this.maxlength}个字符`;
					return false;
				}

				this.isValid = true;
				this.validationMessage = '';
				return true;
			},

			clear() {
				this.currentValue = '';
				this.$emit('input', '');
				this.$emit('change', '');
				this.$emit('clear');
			},

			reset() {
				this.currentValue = this.value;
				this.validate();
			},

			focus() {
				// 通过ref获取textarea元素并聚焦
				// 在实际使用中需要配合ref使用
				this.$emit('focus-request');
			},

			blur() {
				// 通过ref获取textarea元素并失焦
				// 在实际使用中需要配合ref使用
				this.$emit('blur-request');
			},

			getValue() {
				return this.currentValue;
			},

			setValue(value) {
				this.currentValue = value;
				this.validate();
				this.$emit('input', value);
				this.$emit('change', value);
			},

			getWordCount() {
				// 计算字数（中文字符算1个，英文字符算0.5个）
				const text = this.currentValue || '';
				let wordCount = 0;

				for (let i = 0; i < text.length; i++) {
					const char = text[i];
					if (/[一-龥]/.test(char)) {
						wordCount += 1; // 中文字符
					} else {
						wordCount += 0.5; // 英文字符
					}
				}

				return Math.round(wordCount);
			}
		}
	}
</script>

<style scoped>
	.billkes-form-textarea {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.textarea-container {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.textarea-input {
		width: 100%;
		min-height: 80px;
		max-height: 200px;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 14px;
		line-height: 1.5;
		resize: vertical;
		box-sizing: border-box;
		background-color: #fff;
	}

	.textarea-input:focus {
		outline: none;
		border-color: #007aff;
	}

	.textarea-input:disabled {
		background-color: #f5f5f5;
		color: #999;
		cursor: not-allowed;
	}

	.char-counter {
		display: flex;
		justify-content: flex-end;
		font-size: 12px;
		color: #666;
	}

	.char-counter .warning {
		color: #ff9500;
	}

	.char-counter .error {
		color: #ff4444;
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