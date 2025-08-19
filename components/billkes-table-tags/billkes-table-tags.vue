<template>
	<view class="billkes-table-tags">
		<view v-if="displayTags.length > 0" class="tag-list">
			<text v-for="(tag, index) in displayTags" :key="index" class="tag-item">
				{{ tag }}
				<text v-if="index < displayTags.length - 1" class="separator">{{ separator }}</text>
			</text>
			<text v-if="hasMore" class="more-text">等{{ totalCount }}个</text>
		</view>
		<text v-else class="empty-text">-</text>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-tags',
		props: {
			value: {
				type: Array,
				default: () => []
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
				displayTags: [],
				totalCount: 0,
				hasMore: false
			}
		},
		watch: {
			value: {
				handler(newVal) {
					this.loadTags();
				},
				immediate: true
			}
		},
		methods: {
			loadTags() {
				if (!this.value || this.value.length === 0) {
					this.displayTags = [];
					this.totalCount = 0;
					this.hasMore = false;
					return;
				}

				this.totalCount = this.value.length;
				this.displayTags = this.value.slice(0, this.maxDisplay);
				this.hasMore = this.value.length > this.maxDisplay;
			}
		}
	}
</script>

<style scoped>
	.billkes-table-tags {
		display: flex;
		align-items: center;
	}

	.tag-list {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.tag-item {
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