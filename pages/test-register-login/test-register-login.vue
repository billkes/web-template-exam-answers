<template>
	<view class="container">
		<view class="header">
			<text class="header-title">用户注册登录测试</text>
			<text class="header-subtitle">测试自定义云函数的注册、登录和用户信息功能</text>
		</view>

		<uni-card spacing="10px" margin="10px" title="创建一个新的用户账户">
			<uni-forms>
				<uni-forms-item label="用户名" required>
					<uni-easyinput v-model="registerData.username" placeholder="请输入用户名" prefix-icon="person"
						:inputBorder="true" />
				</uni-forms-item>
				<uni-forms-item label="密码" required>
					<uni-easyinput v-model="registerData.password" placeholder="请输入密码" type="password"
						prefix-icon="locked" :inputBorder="true" />
				</uni-forms-item>
				<uni-forms-item label="邮箱">
					<uni-easyinput v-model="registerData.email" placeholder="请输入邮箱" prefix-icon="email"
						:inputBorder="true" />
				</uni-forms-item>
				<uni-forms-item label="昵称">
					<uni-easyinput v-model="registerData.nickname" placeholder="请输入昵称" prefix-icon="personadd"
						:inputBorder="true" />
				</uni-forms-item>
			</uni-forms>

			<view class="captcha-section">
				<uni-forms-item label="图形验证码" required>
					<view class="captcha-row">
						<uni-easyinput v-model="captcha" placeholder="请输入图形验证码" :inputBorder="true"
							class="captcha-input" />
						<image :src="captchaUrl" mode="widthFix" class="captcha-image" @click="refreshCaptcha"></image>
					</view>
				</uni-forms-item>

				<uni-forms-item label="验证码场景">
					<view class="scene-row">
						<uni-easyinput v-model="captchaScene" placeholder="验证码场景" :inputBorder="true"
							class="scene-input" />
					</view>
				</uni-forms-item>
			</view>

			<button @click="handleRegister" class="form-button" type="primary">
				注册
			</button>
		</uni-card>

		<uni-card spacing="10px" margin="10px" title="使用现有账户登录">
			<uni-forms>
				<uni-forms-item label="用户名" required>
					<uni-easyinput v-model="loginData.username" placeholder="请输入用户名" prefix-icon="person"
						:inputBorder="true" />
				</uni-forms-item>
				<uni-forms-item label="密码" required>
					<uni-easyinput v-model="loginData.password" placeholder="请输入密码" type="password" prefix-icon="locked"
						:inputBorder="true" />
				</uni-forms-item>
			</uni-forms>

			<button @click="handleLogin" class="form-button" type="primary">
				登录
			</button>
		</uni-card>

		<uni-card spacing="10px" margin="10px" title="获取当前登录用户的信息">
			<button @click="handleGetUserInfo" class="form-button" type="default">
				获取用户信息
			</button>
		</uni-card>

		<uni-card spacing="10px" margin="10px" title="显示操作的返回结果">
			<view class="result-content">
				<scroll-view class="result-scroll" scroll-y="true">
					<text class="result-text">{{ result || '暂无操作结果' }}</text>
				</scroll-view>
			</view>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				registerData: {
					username: '',
					password: '',
					email: '',
					nickname: ''
				},
				loginData: {
					username: '',
					password: ''
				},
				captcha: '',
				captchaScene: 'register',
				captchaUrl: '',
				result: '',
				token: '' // 保存token
			}
		},
		created() {
			// 页面加载时刷新验证码
			this.refreshCaptcha();
		},
		methods: {
			// 刷新验证码
			async refreshCaptcha() {
				try {
					const uniIdCo = uniCloud.importObject('uni-id-co');
					const res = await uniIdCo.createCaptcha({
						scene: this.captchaScene
					});
					if (res.code === 0) {
						this.captchaUrl = res.captchaBase64;
					} else {
						uni.showToast({
							title: '刷新验证码失败',
							icon: 'none',
							duration: 2000
						});
						this.result = '刷新验证码失败: ' + res.message;
					}
				} catch (error) {
					uni.showToast({
						title: '刷新验证码失败',
						icon: 'none',
						duration: 2000
					});
					this.result = '刷新验证码失败: ' + error.message;
				}
			},

			// 注册
			async handleRegister() {
				if (!this.registerData.username || !this.registerData.password || !this.captcha) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none',
						duration: 2000
					});
					return;
				}

				try {
					// 添加验证码到注册数据
					const registerParams = {
						...this.registerData,
						captcha: this.captcha,
						clientInfo: uni.getSystemInfoSync()
					};

					// 调用我们自定义的云函数
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'register',
							params: registerParams
						}
					});

					this.result = JSON.stringify(res.result, null, 2);

					// 如果注册成功，刷新验证码
					if (res.result.code === 0) {
						uni.showToast({
							title: '注册成功',
							icon: 'success',
							duration: 2000
						});
						this.refreshCaptcha();
					} else {
						uni.showToast({
							title: res.result.message || '注册失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					uni.showToast({
						title: '注册失败',
						icon: 'none',
						duration: 2000
					});
					this.result = '注册失败: ' + error.message;
				}
			},

			// 登录
			async handleLogin() {
				if (!this.loginData.username || !this.loginData.password) {
					uni.showToast({
						title: '请填写用户名和密码',
						icon: 'none',
						duration: 2000
					});
					return;
				}

				try {
					// 调用我们自定义的云函数
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'login',
							params: this.loginData
						}
					});

					this.result = JSON.stringify(res.result, null, 2);

					// 如果登录成功，保存token
					if (res.result.code === 0 && res.result.token) {
						this.token = res.result.token;
						uni.setStorageSync('uni_id_token', res.result.token);
						uni.showToast({
							title: '登录成功',
							icon: 'success',
							duration: 2000
						});
					} else {
						uni.showToast({
							title: res.result.message || '登录失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					uni.showToast({
						title: '登录失败',
						icon: 'none',
						duration: 2000
					});
					this.result = '登录失败: ' + error.message;
				}
			},

			// 获取用户信息
			async handleGetUserInfo() {
				try {
					// 使用保存的token或从本地存储获取token
					const token = this.token || uni.getStorageSync('uni_id_token');

					if (!token) {
						uni.showToast({
							title: '请先登录',
							icon: 'none',
							duration: 2000
						});
						this.result = '请先登录';
						return;
					}

					// 调用我们自定义的云函数
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'getUserInfo',
							params: {}
						},
						headers: {
							'uni-id-token': token
						}
					});

					this.result = JSON.stringify(res.result, null, 2);

					if (res.result.code !== 0) {
						uni.showToast({
							title: res.result.message || '获取用户信息失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none',
						duration: 2000
					});
					this.result = '获取用户信息失败: ' + error.message;
				}
			}
		}
	}
</script>

<style>
	.container {
		padding: 10rpx;
		min-height: 100vh;
	}

	.header {
		text-align: center;
		margin: 20rpx 10rpx;
		padding: 30rpx 20rpx;
		border-radius: 10rpx;
	}

	.header-title {
		font-size: 36rpx;
		color: #333;
		margin-bottom: 10rpx;
		display: block;
		font-weight: bold;
	}

	.header-subtitle {
		font-size: 24rpx;
		color: #666;
		display: block;
	}

	.section-header {
		margin-bottom: 10rpx;
	}

	.section-desc {
		font-size: 24rpx;
		color: #999;
		display: block;
		margin-top: 5rpx;
	}

	.captcha-section {
		margin: 20rpx 0;
	}

	.captcha-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.captcha-input {
		flex: 1;
	}

	.captcha-image {
		width: 200rpx;
		height: 80rpx;
		border-radius: 8rpx;
	}

	.scene-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.scene-input {
		flex: 1;
	}

	.captcha-refresh-btn {
		white-space: nowrap;
	}

	.form-button {
		margin-top: 20rpx;
	}

	.result-content {
		border-radius: 8rpx;
		padding: 20rpx;
		min-height: 200rpx;
	}

	.result-scroll {
		max-height: 300rpx;
	}

	.result-text {
		font-size: 24rpx;
		color: #333;
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>