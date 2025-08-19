<template>
	<view class="billkes-form-answer">
		<!-- label（uni-forms 会自动读取 label 并加红点） -->
		<view v-if="label" class="label-box">
			<text class="label-text">{{ label }}</text>
			<text v-if="required" class="required">*</text>
		</view>

		<view class="checkbox-group" :class="{ disabled }">
			<view v-for="item in options" :key="item.value" class="check-item" :class="{
          checked: isChecked(item.value),
          disabled: disabled || readonly
        }" hover-class="hover" hover-stay-time="100" @tap="handleToggle(item.value)">
				<text class="txt">{{ item.label }}</text>
				<view class="box">
					<view v-if="isChecked(item.value)" class="inner" />
				</view>
			</view>
		</view>

		<!-- uni-forms 错误提示占位 -->
		<view v-if="errMsg" class="error-msg">{{ errMsg }}</view>
	</view>
</template>

<script>
	/**
	 * billkes-form-answer   表单多选组件
	 * 适用于 uni-forms
	 * v-model  双向绑定值：number[]
	 */
	export default {
		name: 'BillkesFormAnswer',
		// 关键：声明为 form 表单组件
		behaviors: ['uni://form-field'],
		props: {
			// 已自动注入 value（必传）
			// value: { type: Array, default: () => [] },

			/* 以下属性供 uni-forms 使用 */
			label: {
				type: String,
				default: ''
			},
			required: {
				type: Boolean,
				default: false
			},
			disabled: {
				type: Boolean,
				default: false
			},
			readonly: {
				type: Boolean,
				default: false
			},
			rules: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				options: [{
						label: 'A',
						value: 0
					},
					{
						label: 'B',
						value: 1
					},
					{
						label: 'C',
						value: 2
					},
					{
						label: 'D',
						value: 3
					},
					{
						label: 'E',
						value: 4
					},
					{
						label: 'F',
						value: 5
					},
					{
						label: 'G',
						value: 6
					}
				],
				errMsg: ''
			};
		},
		methods: {
			isChecked(val) {
				return (this.value || []).includes(val);
			},
			handleToggle(val) {
				if (this.disabled || this.readonly) return;

				const arr = [...(this.value || [])];
				const idx = arr.indexOf(val);
				idx > -1 ? arr.splice(idx, 1) : arr.push(val);

				this.$emit('input', arr);
				this.$emit('change', {
					value: arr
				}); // 标准表单组件事件
				// 触发 uni-forms 校验
				this.$nextTick(() => this.$refs.formItem && this.$refs.formItem.onFieldChange());
			}
		}
	};
</script>

<style scoped>
	.billkes-form-answer {
		width: 100%;
	}

	.label-box {
		margin-bottom: 16rpx;
		font-size: 28rpx;
		color: #333;
	}

	.required {
		color: #fa5151;
		margin-left: 4rpx;
	}

	.checkbox-group.disabled {
		opacity: 0.5;
	}

	.check-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
		border: 1rpx solid #e0e0e0;
		border-radius: 8rpx;
		margin-bottom: 16rpx;
		transition: all 0.2s;
	}

	.check-item.hover {
		background: #f5f5f5;
	}

	.check-item.checked {
		border-color: #007aff;
		background: #ecf5ff;
	}

	.check-item.disabled {
		pointer-events: none;
	}

	.txt {
		font-size: 32rpx;
		color: #333;
	}

	.box {
		width: 36rpx;
		height: 36rpx;
		border: 1rpx solid #c0c4cc;
		border-radius: 6rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.inner {
		width: 20rpx;
		height: 20rpx;
		background: #007aff;
		border-radius: 4rpx;
	}

	.error-msg {
		margin-top: 8rpx;
		color: #fa5151;
		font-size: 24rpx;
	}
</style>