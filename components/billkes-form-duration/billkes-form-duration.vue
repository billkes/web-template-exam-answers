<template>
	<view class="billkes-form-duration">
		<view class="duration-input-container">
			<view class="input-group">
				<input v-model.number="hours" type="number" class="duration-input" :placeholder="'小时'"
					@input="updateDuration" min="0" max="23" />
				<text class="unit-label">小时</text>
			</view>

			<view class="input-group">
				<input v-model.number="minutes" type="number" class="duration-input" :placeholder="'分钟'"
					@input="updateDuration" min="0" max="59" />
				<text class="unit-label">分钟</text>
			</view>

			<view class="input-group">
				<input v-model.number="seconds" type="number" class="duration-input" :placeholder="'秒'"
					@input="updateDuration" min="0" max="59" />
				<text class="unit-label">秒</text>
			</view>
		</view>

		<view v-if="showPreview && totalSeconds > 0" class="preview">
			<text class="preview-label">预览：</text>
			<text class="preview-text">{{ formattedDuration }}</text>
		</view>

		<view v-if="showValidation && !isValid" class="validation-error">
			{{ validationMessage }}
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-duration',
		props: {
			value: {
				type: Number,
				default: 0
			},
			showPreview: {
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
			minDuration: {
				type: Number,
				default: 0
			},
			maxDuration: {
				type: Number,
				default: 86400 // 24小时
			}
		},
		data() {
			return {
				hours: 0,
				minutes: 0,
				seconds: 0,
				isValid: true,
				validationMessage: ''
			}
		},
		computed: {
			totalSeconds() {
				return (this.hours || 0) * 3600 + (this.minutes || 0) * 60 + (this.seconds || 0);
			},

			formattedDuration() {
				const totalSeconds = this.totalSeconds;
				const hours = Math.floor(totalSeconds / 3600);
				const minutes = Math.floor((totalSeconds % 3600) / 60);
				const seconds = totalSeconds % 60;

				if (hours > 0) {
					return `${hours}小时${minutes}分钟${seconds}秒`;
				} else if (minutes > 0) {
					return `${minutes}分钟${seconds}秒`;
				} else {
					return `${seconds}秒`;
				}
			}
		},
		watch: {
			value(newVal) {
				this.parseDuration(newVal);
			}
		},
		created() {
			this.parseDuration(this.value);
		},
		methods: {
			parseDuration(totalSeconds) {
				const hours = Math.floor(totalSeconds / 3600);
				const minutes = Math.floor((totalSeconds % 3600) / 60);
				const seconds = totalSeconds % 60;

				this.hours = hours;
				this.minutes = minutes;
				this.seconds = seconds;
			},

			updateDuration() {
				// 限制输入范围
				if (this.hours > 23) this.hours = 23;
				if (this.minutes > 59) this.minutes = 59;
				if (this.seconds > 59) this.seconds = 59;

				if (this.hours < 0) this.hours = 0;
				if (this.minutes < 0) this.minutes = 0;
				if (this.seconds < 0) this.seconds = 0;

				const totalSeconds = this.totalSeconds;

				this.validate(totalSeconds);
				this.$emit('input', totalSeconds);
				this.$emit('change', totalSeconds);
			},

			validate(totalSeconds) {
				if (!this.required && totalSeconds === 0) {
					this.isValid = true;
					this.validationMessage = '';
					return true;
				}

				if (this.required && totalSeconds === 0) {
					this.isValid = false;
					this.validationMessage = '时长不能为空';
					return false;
				}

				if (totalSeconds < this.minDuration) {
					this.isValid = false;
					this.validationMessage = `时长不能少于${this.formatSeconds(this.minDuration)}`;
					return false;
				}

				if (totalSeconds > this.maxDuration) {
					this.isValid = false;
					this.validationMessage = `时长不能超过${this.formatSeconds(this.maxDuration)}`;
					return false;
				}

				this.isValid = true;
				this.validationMessage = '';
				return true;
			},

			formatSeconds(totalSeconds) {
				const hours = Math.floor(totalSeconds / 3600);
				const minutes = Math.floor((totalSeconds % 3600) / 60);
				const seconds = totalSeconds % 60;

				if (hours > 0) {
					return `${hours}小时${minutes}分钟${seconds}秒`;
				} else if (minutes > 0) {
					return `${minutes}分钟${seconds}秒`;
				} else {
					return `${seconds}秒`;
				}
			},

			clear() {
				this.hours = 0;
				this.minutes = 0;
				this.seconds = 0;
				this.updateDuration();
			},

			reset() {
				this.parseDuration(this.value);
			}
		}
	}
</script>

<style scoped>
	.billkes-form-duration {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.duration-input-container {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	.duration-input {
		width: 60px;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 8px;
		font-size: 14px;
		text-align: center;
		min-height: 36px;
		box-sizing: border-box;
	}

	.duration-input:focus {
		outline: none;
		border-color: #007aff;
	}

	.unit-label {
		font-size: 12px;
		color: #666;
		white-space: nowrap;
	}

	.preview {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 4px;
	}

	.preview-label {
		font-size: 12px;
		color: #666;
	}

	.preview-text {
		font-size: 12px;
		color: #007aff;
		font-weight: 500;
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