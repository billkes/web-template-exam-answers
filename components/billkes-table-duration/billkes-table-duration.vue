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
			},
			unit: {
				type: String,
				default: 's',
				validator: v => ['s', 'm'].includes(v)
			}
		},
		computed: {
			// 统一转为秒
			duration() {
				if (this.unit === 'm') return this.value * 60;
				return this.value || 0;
			},
			formattedDuration() {
				const totalSeconds = this.duration;

				const hours = Math.floor(totalSeconds / 3600);
				const minutes = Math.floor((totalSeconds % 3600) / 60);
				const seconds = totalSeconds % 60;

				if (hours) {
					return `${hours}小时${minutes}分钟${seconds}秒`;
				}
				if (minutes) {
					return `${minutes}分钟${seconds}秒`;
				}
				return `${seconds}秒`;
			}
		}
	};
</script>

<style scoped>
	.billkes-table-duration {
		display: flex;
		align-items: center;
		justify-content: center;
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