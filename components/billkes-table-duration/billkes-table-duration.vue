<template>
	<view class="billkes-table-duration">
		<text v-if="duration > 0" class="duration-text">{{ formattedDuration }}</text>
		<text v-else class="empty-text">-</text>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-duration',
		props: {
			value: {
				type: Number,
				default: 0
			}
		},
		computed: {
			duration() {
				return this.value || 0;
			},
			formattedDuration() {
				const totalSeconds = this.duration;
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
		}
	}
</script>

<style scoped>
	.billkes-table-duration {
		display: flex;
		align-items: center;
	}

	.duration-text {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
	}
</style>