<template>
	<view class="billkes-table-options">
		<view v-if="displayOptions.length > 0" class="options-list">
			<view v-for="(option, index) in displayOptions" :key="index" class="option-item">
				<text class="option-label">{{ getOptionLabel(index) }}.</text>
				<text class="option-text">{{ option }}</text>
			</view>
			<text v-if="hasMore" class="more-text">等{{ totalCount }}个选项</text>
		</view>
		<text v-else class="empty-text">-</text>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-options',
		props: {
			value: {
				type: Array,
				default: () => []
			},
			maxDisplay: {
				type: Number,
				default: 3
			}
		},
		data() {
			return {
				displayOptions: [],
				totalCount: 0,
				hasMore: false
			}
		},
		watch: {
			value: {
				handler(newVal) {
					this.loadOptions();
				},
				immediate: true
			}
		},
		methods: {
			loadOptions() {
				if (!this.value || this.value.length === 0) {
					this.displayOptions = [];
					this.totalCount = 0;
					this.hasMore = false;
					return;
				}

				this.totalCount = this.value.length;
				this.displayOptions = this.value.slice(0, this.maxDisplay);
				this.hasMore = this.value.length > this.maxDisplay;
			},
			getOptionLabel(index) {
				const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
				return labels[index] || String.fromCharCode(65 + index);
			}
		}
	}
</script>

<style scoped>
	.billkes-table-options {
		display: flex;
		align-items: flex-start;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.option-item {
		display: flex;
		align-items: flex-start;
		gap: 4px;
	}

	.option-label {
		font-size: 14px;
		color: #666;
		font-weight: 500;
		min-width: 20px;
	}

	.option-text {
		font-size: 14px;
		color: #333;
		flex: 1;
	}

	.more-text {
		font-size: 12px;
		color: #999;
		margin-top: 4px;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
	}
</style>