<template>
	<view class="billkes-form-tags">
		<view class="tags-container">
			<view class="tags-list">
				<view v-for="(tag, index) in currentTags" :key="index" class="tag-item">
					<text class="tag-text">{{ tag }}</text>
					<text v-if="editable" class="tag-remove" @click="removeTag(index)">×</text>
				</view>
			</view>

			<view v-if="editable" class="tag-input-container">
				<input v-model="newTag" class="tag-input" :placeholder="placeholder" @keyup.enter="addTag"
					@blur="addTag" maxlength="20" />
				<button class="add-btn" @click="addTag" :disabled="!newTag.trim()">
					添加
				</button>
			</view>
		</view>

		<view v-if="showSuggestions && suggestions.length > 0" class="suggestions">
			<view v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item"
				@click="selectSuggestion(suggestion)">
				{{ suggestion }}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-tags',
		props: {
			value: {
				type: Array,
				default: () => []
			},
			editable: {
				type: Boolean,
				default: true
			},
			placeholder: {
				type: String,
				default: '输入标签后按回车'
			},
			maxTags: {
				type: Number,
				default: 10
			},
			allowDuplicates: {
				type: Boolean,
				default: false
			},
			suggestions: {
				type: Array,
				default: () => []
			},
			showSuggestions: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				currentTags: [...this.value],
				newTag: ''
			}
		},
		watch: {
			value(newVal) {
				this.currentTags = [...newVal];
			}
		},
		methods: {
			addTag() {
				if (!this.newTag.trim()) return;

				const tag = this.newTag.trim();

				// 检查是否已存在
				if (!this.allowDuplicates && this.currentTags.includes(tag)) {
					uni.showToast({
						title: '标签已存在',
						icon: 'none'
					});
					return;
				}

				// 检查最大数量
				if (this.currentTags.length >= this.maxTags) {
					uni.showToast({
						title: `最多只能添加${this.maxTags}个标签`,
						icon: 'none'
					});
					return;
				}

				this.currentTags.push(tag);
				this.newTag = '';
				this.emitChange();
			},

			removeTag(index) {
				this.currentTags.splice(index, 1);
				this.emitChange();
			},

			selectSuggestion(suggestion) {
				if (!this.allowDuplicates && this.currentTags.includes(suggestion)) {
					uni.showToast({
						title: '标签已存在',
						icon: 'none'
					});
					return;
				}

				if (this.currentTags.length >= this.maxTags) {
					uni.showToast({
						title: `最多只能添加${this.maxTags}个标签`,
						icon: 'none'
					});
					return;
				}

				this.currentTags.push(suggestion);
				this.emitChange();
			},

			emitChange() {
				this.$emit('input', this.currentTags);
				this.$emit('change', this.currentTags);
			},

			clearAll() {
				this.currentTags = [];
				this.emitChange();
			}
		}
	}
</script>

<style scoped>
	.billkes-form-tags {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.tags-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}

	.tag-item {
		display: flex;
		align-items: center;
		background-color: #f0f0f0;
		border-radius: 16px;
		padding: 4px 8px;
		gap: 4px;
	}

	.tag-text {
		font-size: 12px;
		color: #333;
	}

	.tag-remove {
		font-size: 14px;
		color: #999;
		cursor: pointer;
		padding: 0 2px;
	}

	.tag-remove:hover {
		color: #ff4444;
	}

	.tag-input-container {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.tag-input {
		flex: 1;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 6px 8px;
		font-size: 12px;
		min-height: 32px;
	}

	.tag-input:focus {
		outline: none;
		border-color: #007aff;
	}

	.add-btn {
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 6px 12px;
		font-size: 12px;
		min-width: 48px;
	}

	.add-btn:disabled {
		background-color: #ccc;
	}

	.suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 4px;
	}

	.suggestion-item {
		background-color: #f8f8f8;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 12px;
		color: #666;
		cursor: pointer;
	}

	.suggestion-item:hover {
		background-color: #e8f4fd;
		border-color: #007aff;
		color: #007aff;
	}
</style>