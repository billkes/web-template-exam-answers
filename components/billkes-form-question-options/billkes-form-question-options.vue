<template>
	<view class="billkes-form-question-options">
		<view class="options-container">
			<view v-if="options.length === 0" class="empty-state">
				<text class="empty-text">暂无选项</text>
				<button class="add-btn" @click="addOption" type="primary" size="mini">添加选项</button>
			</view>

			<view v-else class="options-list">
				<view v-for="(option, index) in options" :key="index" class="option-item">
					<view class="option-header">
						<text class="option-index">选项 {{ String.fromCharCode(65 + index) }}</text>
						<view class="right">
							<button class="confirm-btn" @click="confirmOption(index)" type="primary"
								size="mini">确认</button>
							<button class="delete-btn" @click="removeOption(index)" type="warn" size="mini">删除</button>
						</view>
					</view>

					<view class="option-content">
						<view class="form-item">
							<text class="form-label">选项</text>
							<uni-easyinput errorMessage v-model="options[index]" placeholder="请输入内容"></uni-easyinput>
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
		name: 'billkes-form-question-options',
		props: {
			modelValue: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				options: []
			}
		},
		watch: {
			modelValue: {
				handler(newVal) {
					this.options = Array.isArray(newVal) ? newVal : [];
				},
				immediate: true,
				deep: true
			}
		},
		methods: {
			addOption() {
				this.options.push('');
				this.confirmOption()
			},

			confirmOption(index) {
				this.$emit('update:modelValue', this.options)
				this.$emit('change', this.options)
			},

			removeOption(index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这条答题记录吗？',
					success: (res) => {
						if (res.confirm) {
							this.options.splice(index, 1);
							this.confirmOption()
						}
					}
				});
			},
		}
	}
</script>

<style scoped>
	.billkes-form-question-options {
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
		padding: 8px 10px;
		background-color: #f5f5f5;
		border-bottom: 1px solid #e0e0e0;
	}

	.option-index {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.right {
		display: flex;
		align-items: center;
	}

	.confirm-btn {
		min-width: 60px;
		margin: 0;
		margin-right: 10px;
	}

	.delete-btn {
		min-width: 60px;
		margin: 0;
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

	.add-btn {
		min-width: 100px;
		margin: 0;
	}
</style>