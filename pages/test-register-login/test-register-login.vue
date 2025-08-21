<template>
	<view class="container">
		<view class="form-section">
			<h2>用户注册</h2>
			<input v-model="registerData.username" placeholder="用户名" />
			<input v-model="registerData.password" placeholder="密码" password />
			<input v-model="registerData.email" placeholder="邮箱" />
			<button @click="handleRegister">注册</button>
		</view>

		<view class="form-section">
			<h2>用户登录</h2>
			<input v-model="loginData.username" placeholder="用户名" />
			<input v-model="loginData.password" placeholder="密码" password />
			<button @click="handleLogin">登录</button>
		</view>

		<view class="form-section">
			<h2>获取用户信息</h2>
			<input v-model="userId" placeholder="用户ID（可选，不填则获取当前用户）" />
			<button @click="handleGetUserInfo">获取用户信息</button>
		</view>

		<view class="result-section">
			<h2>操作结果</h2>
			<text>{{ result }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				registerData: {
					username: '',
					password: '',
					email: ''
				},
				loginData: {
					username: '',
					password: ''
				},
				userId: '',
				result: ''
			}
		},
		methods: {
			// 注册
			async handleRegister() {
				try {
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'register',
							params: this.registerData
						}
					});
					this.result = JSON.stringify(res.result);
				} catch (error) {
					this.result = '注册失败: ' + error.message;
				}
			},

			// 登录
			async handleLogin() {
				try {
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'login',
							params: this.loginData
						}
					});
					this.result = JSON.stringify(res.result);
				} catch (error) {
					this.result = '登录失败: ' + error.message;
				}
			},

			// 获取用户信息
			async handleGetUserInfo() {
				try {
					const params = this.userId ? { uid: this.userId } : {};
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'getUserInfo',
							params
						}
					});
					this.result = JSON.stringify(res.result);
				} catch (error) {
					this.result = '获取用户信息失败: ' + error.message;
				}
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
	}

	.form-section {
		margin-bottom: 30px;
	}

	.form-section input {
		width: 100%;
		margin-bottom: 10px;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.form-section button {
		width: 100%;
		padding: 10px;
		background-color: #007AFF;
		color: white;
		border: none;
		border-radius: 4px;
	}

	.result-section {
		margin-top: 20px;
		padding: 15px;
		background-color: #f0f0f0;
		border-radius: 4px;
	}
</style>