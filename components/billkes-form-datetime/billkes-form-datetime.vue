<template>
	<view class="billkes-form-datetime">
		<view class="datetime-container">
			<picker mode="date" :value="currentDate" @change="onDateChange" :start="startDate" :end="endDate"
				:disabled="disabled">
				<view class="picker-view">
					<input v-model="displayDate" class="datetime-input" :placeholder="datePlaceholder"
						:disabled="disabled" readonly />
				</view>
			</picker>

			<picker v-if="showTime" mode="time" :value="currentTime" @change="onTimeChange" :start="startTime"
				:end="endTime" :disabled="disabled">
				<view class="picker-view">
					<input v-model="displayTime" class="datetime-input" :placeholder="timePlaceholder"
						:disabled="disabled" readonly />
				</view>
			</picker>
		</view>

		<view v-if="showPreview && currentDateTime" class="preview">
			<text class="preview-label">预览：</text>
			<text class="preview-text">{{ formattedDateTime }}</text>
		</view>

		<view v-if="showValidation && !isValid" class="validation-error">
			{{ validationMessage }}
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-datetime',
		props: {
			value: {
				type: [String, Number, Date],
				default: ''
			},
			mode: {
				type: String,
				default: 'datetime', // date, time, datetime
			},
			datePlaceholder: {
				type: String,
				default: '选择日期'
			},
			timePlaceholder: {
				type: String,
				default: '选择时间'
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
			disabled: {
				type: Boolean,
				default: false
			},
			startDate: {
				type: String,
				default: ''
			},
			endDate: {
				type: String,
				default: ''
			},
			startTime: {
				type: String,
				default: ''
			},
			endTime: {
				type: String,
				default: ''
			},
			format: {
				type: String,
				default: 'YYYY-MM-DD HH:mm:ss' // 自定义格式
			}
		},
		data() {
			return {
				currentDate: '',
				currentTime: '',
				isValid: true,
				validationMessage: ''
			}
		},
		computed: {
			showTime() {
				return this.mode === 'time' || this.mode === 'datetime';
			},

			showDate() {
				return this.mode === 'date' || this.mode === 'datetime';
			},

			displayDate() {
				return this.currentDate || '';
			},

			displayTime() {
				return this.currentTime || '';
			},

			currentDateTime() {
				if (!this.currentDate) return '';

				if (this.mode === 'date') {
					return this.currentDate;
				} else if (this.mode === 'time') {
					return this.currentTime;
				} else {
					return `${this.currentDate} ${this.currentTime || '00:00:00'}`;
				}
			},

			formattedDateTime() {
				if (!this.currentDateTime) return '';

				// 简单的格式化，可以根据需要扩展
				const date = new Date(this.currentDateTime);
				if (isNaN(date.getTime())) return this.currentDateTime;

				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				const seconds = String(date.getSeconds()).padStart(2, '0');

				if (this.mode === 'date') {
					return `${year}-${month}-${day}`;
				} else if (this.mode === 'time') {
					return `${hours}:${minutes}:${seconds}`;
				} else {
					return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
				}
			}
		},
		watch: {
			value(newVal) {
				this.parseDateTime(newVal);
			}
		},
		created() {
			this.parseDateTime(this.value);
		},
		methods: {
			parseDateTime(value) {
				if (!value) {
					this.currentDate = '';
					this.currentTime = '';
					return;
				}

				let date;

				if (typeof value === 'number') {
					// 时间戳
					date = new Date(value);
				} else if (typeof value === 'string') {
					// 字符串
					date = new Date(value);
				} else if (value instanceof Date) {
					// Date对象
					date = value;
				} else {
					this.currentDate = '';
					this.currentTime = '';
					return;
				}

				if (isNaN(date.getTime())) {
					this.currentDate = '';
					this.currentTime = '';
					return;
				}

				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				const seconds = String(date.getSeconds()).padStart(2, '0');

				this.currentDate = `${year}-${month}-${day}`;
				this.currentTime = `${hours}:${minutes}:${seconds}`;
			},

			onDateChange(e) {
				this.currentDate = e.detail.value;
				this.emitChange();
			},

			onTimeChange(e) {
				this.currentTime = e.detail.value;
				this.emitChange();
			},

			emitChange() {
				const dateTime = this.currentDateTime;

				this.validate(dateTime);
				this.$emit('input', dateTime);
				this.$emit('change', dateTime);
			},

			validate(dateTime) {
				if (!this.required && !dateTime) {
					this.isValid = true;
					this.validationMessage = '';
					return true;
				}

				if (this.required && !dateTime) {
					this.isValid = false;
					this.validationMessage = '请选择日期时间';
					return false;
				}

				// 检查日期格式
				const date = new Date(dateTime);
				if (isNaN(date.getTime())) {
					this.isValid = false;
					this.validationMessage = '日期时间格式不正确';
					return false;
				}

				this.isValid = true;
				this.validationMessage = '';
				return true;
			},

			clear() {
				this.currentDate = '';
				this.currentTime = '';
				this.emitChange();
			},

			reset() {
				this.parseDateTime(this.value);
			},

			getTimestamp() {
				if (!this.currentDateTime) return null;
				return new Date(this.currentDateTime).getTime();
			},

			getDateObject() {
				if (!this.currentDateTime) return null;
				return new Date(this.currentDateTime);
			}
		}
	}
</script>

<style scoped>
	.billkes-form-datetime {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.datetime-container {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.picker-view {
		flex: 1;
	}

	.datetime-input {
		width: 100%;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 14px;
		min-height: 36px;
		box-sizing: border-box;
		background-color: #fff;
		cursor: pointer;
	}

	.datetime-input:disabled {
		background-color: #f5f5f5;
		color: #999;
		cursor: not-allowed;
	}

	.datetime-input:focus {
		outline: none;
		border-color: #007aff;
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