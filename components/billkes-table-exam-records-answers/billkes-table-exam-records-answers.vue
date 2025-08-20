<template>
	<view class="billkes-table-answers-summary">
		<view v-if="summary" class="summary-content">
			<text class="summary-text">{{ summary }}</text>
		</view>
		<text v-else class="empty-text">-</text>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-answers-summary',
		props: {
			value: {
				type: Array,
				default: () => []
			}
		},
		computed: {
			summary() {
				if (!this.value || this.value.length === 0) {
					return '';
				}

				const total = this.value.length;
				const correct = this.value.filter(answer => answer.is_correct).length;
				const incorrect = total - correct;

				if (correct === 0) {
					return `全错(${total}题)`;
				} else if (incorrect === 0) {
					return `全对(${total}题)`;
				} else {
					return `对${correct}题/错${incorrect}题`;
				}
			}
		}
	}
</script>

<style scoped>
	.billkes-table-answers-summary {
		display: flex;
		align-items: center;
	}

	.summary-content {
		display: flex;
		align-items: center;
	}

	.summary-text {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
	}
</style>