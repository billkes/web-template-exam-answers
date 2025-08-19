<template>
	<view class="billkes-form-avatar">
		<view class="avatar-container">
			<image :src="currentAvatar" :mode="mode" :style="{ width: width + 'px', height: height + 'px' }"
				@error="handleError" class="avatar-image"></image>
			<button v-if="editable" class="upload-btn" @click="handleUpload" :disabled="uploading">
				{{ uploading ? '上传中...' : (currentAvatar ? '更换' : '上传') }}
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-avatar',
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
				default: 80
			},
			height: {
				type: Number,
				default: 80
			},
			editable: {
				type: Boolean,
				default: true
			},
			uploadUrl: {
				type: String,
				default: ''
			},
			maxSize: {
				type: Number,
				default: 2048 // KB
			}
		},
		data() {
			return {
				currentAvatar: this.value,
				uploading: false
			}
		},
		watch: {
			value(newVal) {
				this.currentAvatar = newVal;
			}
		},
		methods: {
			handleError() {
				this.currentAvatar = '';
				this.$emit('error');
			},

			async handleUpload() {
				if (this.uploading) return;

				try {
					this.uploading = true;

					// 选择图片
					const res = await uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					});

					const tempFilePath = res.tempFilePaths[0];

					// 检查文件大小
					const fileInfo = await uni.getFileInfo({
						filePath: tempFilePath
					});

					if (fileInfo.size > this.maxSize * 1024) {
						uni.showToast({
							title: `图片大小不能超过${this.maxSize}KB`,
							icon: 'none'
						});
						return;
					}

					// 上传图片
					let uploadResult;
					if (this.uploadUrl) {
						// 使用自定义上传地址
						uploadResult = await uni.uploadFile({
							url: this.uploadUrl,
							filePath: tempFilePath,
							name: 'file'
						});

						const response = JSON.parse(uploadResult.data);
						this.currentAvatar = response.url;
					} else {
						// 使用uniCloud上传
						uploadResult = await uniCloud.uploadFile({
							filePath: tempFilePath,
							cloudPath: `avatar/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
						});

						this.currentAvatar = uploadResult.fileID;
					}

					this.$emit('input', this.currentAvatar);
					this.$emit('change', this.currentAvatar);

					uni.showToast({
						title: '上传成功',
						icon: 'success'
					});

				} catch (error) {
					console.error('上传失败:', error);
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					});
				} finally {
					this.uploading = false;
				}
			},

			clearAvatar() {
				this.currentAvatar = '';
				this.$emit('input', '');
				this.$emit('change', '');
			}
		}
	}
</script>

<style scoped>
	.billkes-form-avatar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.avatar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.avatar-image {
		border-radius: 50%;
		background-color: #f5f5f5;
		border: 2px solid #e0e0e0;
	}

	.upload-btn {
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 6px 12px;
		font-size: 12px;
		min-width: 60px;
	}

	.upload-btn:disabled {
		background-color: #ccc;
	}
</style>