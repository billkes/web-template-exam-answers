<template>
	<view class="billkes-table-exams-questions">
		<text v-if="count > 0" class="count-text">{{ count }}题</text>
		<text v-else class="empty-text">-</text>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-exams-questions',
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
	.billkes-table-exams-questions {
		display: flex;
		align-items: center;
		justify-content: center;
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