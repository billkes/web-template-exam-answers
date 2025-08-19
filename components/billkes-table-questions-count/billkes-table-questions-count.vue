<template>
	<view class="billkes-table-questions-count">
		<text v-if="count > 0" class="count-text">{{ count }}题</text>
		<text v-else class="empty-text">-</text>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-questions-count',
		props: {
			value: {
				type: Array,
				default: () => []
			}
		},
		computed: {
			count() {
				return Array.isArray(this.value) ? this.value.length : 0;
			}
		}
	}
</script>

<style scoped>
	.billkes-table-questions-count {
		display: flex;
		align-items: center;
	}

	.count-text {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
	}
</style>