<template>
	<view class="billkes-table-user-list">
		<view v-if="displayUsers.length > 0" class="user-list">
			<text v-for="(user, index) in displayUsers" :key="index" class="user-item">
				{{ user }}
				<text v-if="index < displayUsers.length - 1" class="separator">{{ separator }}</text>
			</text>
			<text v-if="hasMore" class="more-text">等{{ totalCount }}人</text>
		</view>
		<text v-else class="empty-text">-</text>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-user-list',
		props: {
			value: {
				type: Array,
				default: () => []
			},
			collection: {
				type: String,
				default: ''
			},
			field: {
				type: String,
				default: 'nickname'
			},
			separator: {
				type: String,
				default: ', '
			},
			maxDisplay: {
				type: Number,
				default: 3
			}
		},
		data() {
			return {
				displayUsers: [],
				totalCount: 0,
				hasMore: false
			}
		},
		watch: {
			value: {
				handler(newVal) {
					this.loadUsers();
				},
				immediate: true
			}
		},
		methods: {
			async loadUsers() {
				if (!this.value || this.value.length === 0) {
					this.displayUsers = [];
					this.totalCount = 0;
					this.hasMore = false;
					return;
				}

				this.totalCount = this.value.length;

				if (this.collection && this.field) {
					try {
						// 这里应该调用云函数获取用户信息
						// 暂时使用占位符
						this.displayUsers = this.value.slice(0, this.maxDisplay).map(() => '用户');
						this.hasMore = this.value.length > this.maxDisplay;
					} catch (error) {
						console.error('加载用户信息失败:', error);
						this.displayUsers = this.value.slice(0, this.maxDisplay);
						this.hasMore = this.value.length > this.maxDisplay;
					}
				} else {
					this.displayUsers = this.value.slice(0, this.maxDisplay);
					this.hasMore = this.value.length > this.maxDisplay;
				}
			}
		}
	}
</script>

<style scoped>
	.billkes-table-user-list {
		display: flex;
		align-items: center;
	}

	.user-list {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.user-item {
		font-size: 14px;
		color: #333;
	}

	.separator {
		margin: 0 4px;
		color: #999;
	}

	.more-text {
		font-size: 12px;
		color: #999;
		margin-left: 4px;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
	}
</style>