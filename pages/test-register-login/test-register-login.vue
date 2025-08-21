<template>
	<view class="container">
		<view class="header">
			<text class="header-title">用户注册登录测试</text>
			<text class="header-subtitle">测试uni-id-co云对象的注册、登录和用户信息功能</text>
		</view>

		<view class="form-section">
			<view class="section-header">
				<text class="section-title">用户注册</text>
				<text class="section-desc">创建一个新的用户账户</text>
			</view>
			
			<view class="input-group">
				<uni-easyinput 
					v-model="registerData.username" 
					placeholder="请输入用户名" 
					class="form-input"
					:inputBorder="false"
				/>
				<uni-easyinput 
					v-model="registerData.password" 
					placeholder="请输入密码" 
					type="password"
					class="form-input"
					:inputBorder="false"
				/>
			</view>
			
			<view class="captcha-section">
				<view class="captcha-input-container">
					<uni-easyinput 
						v-model="captcha" 
						placeholder="请输入图形验证码" 
						class="form-input captcha-input"
						:inputBorder="false"
					/>
					<view class="captcha-container">
						<uni-easyinput 
							v-model="captchaScene" 
							placeholder="验证码场景" 
							class="form-input scene-input"
							:inputBorder="false"
						/>
						<button @click="refreshCaptcha" class="captcha-refresh-btn" size="mini">刷新</button>
					</view>
				</view>
				<image 
					:src="captchaUrl" 
					mode="widthFix" 
					class="captcha-image" 
					@click="refreshCaptcha"
				></image>
				<text class="captcha-tip">点击图片可刷新验证码</text>
			</view>
			
			<button @click="handleRegister" class="form-button primary" type="primary">注册</button>
		</view>

		<view class="form-section">
			<view class="section-header">
				<text class="section-title">用户登录</text>
				<text class="section-desc">使用现有账户登录</text>
			</view>
			
			<view class="input-group">
				<uni-easyinput 
					v-model="loginData.username" 
					placeholder="请输入用户名" 
					class="form-input"
					:inputBorder="false"
				/>
				<uni-easyinput 
					v-model="loginData.password" 
					placeholder="请输入密码" 
					type="password"
					class="form-input"
					:inputBorder="false"
				/>
			</view>
			
			<button @click="handleLogin" class="form-button primary" type="primary">登录</button>
		</view>

		<view class="form-section">
			<view class="section-header">
				<text class="section-title">获取用户信息</text>
				<text class="section-desc">获取当前登录用户的信息</text>
			</view>
			<button @click="handleGetUserInfo" class="form-button secondary" type="default">获取用户信息</button>
		</view>

		<view class="result-section">
			<view class="section-header">
				<text class="section-title">操作结果</text>
				<text class="section-desc">显示操作的返回结果</text>
			</view>
			<view class="result-content">
				<scroll-view 
					class="result-scroll" 
					scroll-y="true"
				>
					<text class="result-text">{{ result }}</text>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入uni-app组件
	import uniEasyinput from '@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue';
	import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';
	
	export default {
		components: {
			uniEasyinput,
			uniIcons
		},
		data() {
			return {
				registerData: {
					username: '',
					password: ''
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
						this.result = '刷新验证码失败: ' + res.message;
					}
				} catch (error) {
					this.result = '刷新验证码失败: ' + error.message;
				}
			},

			// 注册
			async handleRegister() {
				try {
					// 添加验证码到注册数据
					const registerParams = {
						...this.registerData,
						captcha: this.captcha
					};
					
					// 直接调用云对象，使用registerUser方法
					const uniIdCo = uniCloud.importObject('uni-id-co');
					const res = await uniIdCo.registerUser(registerParams);
					this.result = JSON.stringify(res, null, 2);
					
					// 如果注册成功，刷新验证码
					if (res.code === 0) {
						this.refreshCaptcha();
					}
				} catch (error) {
					this.result = '注册失败: ' + error.message;
				}
			},

			// 登录
			async handleLogin() {
				try {
					// 直接调用云对象，使用login方法
					const uniIdCo = uniCloud.importObject('uni-id-co');
					const res = await uniIdCo.login(this.loginData);
					this.result = JSON.stringify(res, null, 2);
					
					// 如果登录成功，保存token
					if (res.code === 0 && res.token) {
						this.token = res.token;
						uni.setStorageSync('uni_id_token', res.token);
					}
				} catch (error) {
					this.result = '登录失败: ' + error.message;
				}
			},

			// 获取用户信息
			async handleGetUserInfo() {
				try {
					// 使用保存的token或从本地存储获取token
					const token = this.token || uni.getStorageSync('uni_id_token');
					
					if (!token) {
						this.result = '请先登录';
						return;
					}
					
					// 直接调用云对象，使用getAccountInfo方法
					const uniIdCo = uniCloud.importObject('uni-id-co', {
						// 在调用时设置token
						customUI: {
							'uni-id-token': token
						}
					});
					const res = await uniIdCo.getAccountInfo();
					this.result = JSON.stringify(res, null, 2);
				} catch (error) {
					this.result = '获取用户信息失败: ' + error.message;
				}
			}
		}
	}
</script>

<style>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.header {
		text-align: center;
		margin-bottom: 30rpx;
		padding: 40rpx 20rpx;
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.header-title {
		font-size: 48rpx;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
		font-weight: bold;
	}

	.header-subtitle {
		font-size: 28rpx;
		color: #666;
		display: block;
	}

	.form-section {
		margin-bottom: 30rpx;
		padding: 30rpx;
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.section-header {
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 36rpx;
		color: #333;
		margin-bottom: 10rpx;
		display: block;
		font-weight: bold;
	}

	.section-desc {
		font-size: 24rpx;
		color: #999;
		display: block;
	}

	.input-group {
		margin-bottom: 30rpx;
	}

	.form-input {
		margin-bottom: 20rpx;
	}

	.captcha-section {
		margin-bottom: 30rpx;
	}

	.captcha-input-container {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}

	.captcha-container {
		display: flex;
		gap: 20rpx;
		align-items: center;
	}

	.captcha-input {
		flex: 1;
	}

	.scene-input {
		flex: 2;
	}

	.captcha-refresh-btn {
		flex: 1;
		padding: 24rpx;
		background-color: #666;
		color: white;
		border: none;
		border-radius: 12rpx;
		font-size: 24rpx;
	}

	.captcha-image {
		width: 100%;
		height: 160rpx;
		margin: 20rpx 0;
		border: 2rpx solid #ddd;
		border-radius: 12rpx;
	}

	.captcha-tip {
		font-size: 20rpx;
		color: #999;
		text-align: center;
		display: block;
		margin-top: 10rpx;
	}

	.form-button {
		width: 100%;
		padding: 24rpx;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s;
		margin-top: 20rpx;
	}

	.primary {
		background-color: #007AFF;
		color: white;
	}

	.primary:hover {
		background-color: #0056cc;
	}

	.secondary {
		background-color: #34C759;
		color: white;
	}

	.secondary:hover {
		background-color: #24883f;
	}

	.result-section {
		padding: 30rpx;
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.result-content {
		background-color: #f8f8f8;
		border-radius: 12rpx;
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