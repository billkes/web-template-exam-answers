
<template>
	<view class="billkes-table-tag">
		<text v-if="tagText" class="tag-text" :style="tagStyle">{{ tagText }}</text>
		<text v-else class="empty-text">-</text>
	</view>
</template>

<script>
	export default {
		name: 'billkes-table-tag',
		props: {
			value: {
				type: [String, Number, Boolean],
				default: ''
			},
			enum: {
				type: Array,
				default: () => []
			}
		},
		computed: {
			tagText() {
				if (!this.enum || this.enum.length === 0) {
					return this.value || '';
				}
				
				const enumItem = this.enum.find(item => item.value === this.value);
				return enumItem ? enumItem.text : (this.value || '');
			},
			tagStyle() {
				// 根据不同的值返回不同的样式
				const value = this.value;
				if (typeof value === 'string') {
					switch (value) {
						case 'single':
							return { backgroundColor: '#e3f2fd', color: '#1976d2' };
						case 'multiple':
							return { backgroundColor: '#f3e5f5', color: '#7b1fa2' };
						case 'draft':
							return { backgroundColor: '#fff3e0', color: '#f57c00' };
						case 'published':
							return { backgroundColor: '#e8f5e8', color: '#388e3c' };
						case 'archived':
							return { backgroundColor: '#fafafa', color: '#616161' };
						default:
							return { backgroundColor: '#f5f5f5', color: '#757575' };
					}
				} else if (typeof value === 'number') {
					switch (value) {
						case 1:
							return { backgroundColor: '#e8f5e8', color: '#388e3c' }; // 简单 - 绿色
						case 2:
							return { backgroundColor: '#fff3e0', color: '#f57c00' }; // 中等 - 橙色
						case 3:
							return { backgroundColor: '#ffebee', color: '#d32f2f' }; // 困难 - 红色
						default:
							return { backgroundColor: '#f5f5f5', color: '#757575' };
					}
				} else if (typeof value === 'boolean') {
					return value 
						? { backgroundColor: '#e8f5e8', color: '#388e3c' } 
						: { backgroundColor: '#ffebee', color: '#d32f2f' };
				}
				
				return { backgroundColor: '#f5f5f5', color: '#757575' };
			}
		}
	}
</script>

<style scoped>
	.billkes-table-tag {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tag-text {
		font-size: 12px;
		padding: 2px 8px;
		border-radius: 12px;
		font-weight: 500;
		white-space: nowrap;
		min-width: 40px;
		text-align: center;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
	}
</style>
