<template>
	<view class="billkes-table-avatar">
		<image :src="value" :mode="mode" :style="{ width: width + 'px', height: height + 'px' }" @error="handleError">
		</image>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-avatar',
		props: {
			value: {
				type: String,
				default: ''
			},
			mode: {
				type: String,
				default: 'aspectFit'
			},
			width: {
				type: Number,
				default: 40
			},
			height: {
				type: Number,
				default: 40
			}
		},
		methods: {
			handleError() {
				// 图片加载失败时的处理
				this.$emit('error');
			}
		}
	}
</script>

<style scoped>
	.billkes-table-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.billkes-table-avatar image {
		border-radius: 50%;
		background-color: #f5f5f5;
	}
</style>