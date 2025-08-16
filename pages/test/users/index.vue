<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-easyinput class="item-content inp" suffixIcon="search" clearable v-model="searchKeyword"
					placeholder="请输入用户名或手机号" @iconClick="handleSearch"></uni-easyinput>
			</view>
			<button class="filter-add-btn" type="primary" @click="handleAdd">新增用户</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="120" align="center">用户名</uni-th>
				<uni-th width="120" align="center">手机号</uni-th>
				<uni-th width="150" align="center">注册时间</uni-th>
				<uni-th width="120" align="center">状态</uni-th>
				<uni-th width="180" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.username }}</uni-td>
				<uni-td align="center">{{ item.mobile || '-' }}</uni-td>
				<uni-td align="center">{{ myFormatTime(item.create_time) }}</uni-td>
				<uni-td align="center">
					<uni-tag :text="item.status === 1 ? '正常' : '禁用'" :type="item.status === 1 ? 'success' : 'error'" />
				</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
						<button type="primary" size="mini" @click="handleEdit(item._id)">编辑</button>
						<button type="warn" size="mini" @click="handleDelete(item._id)">删除</button>
						<button type="default" size="mini" @click="handleResetPwd(item._id)">重置密码</button>
						<button type="default" size="mini" @click="handleToggleStatus(item._id, item.status)">
							{{ item.status === 1 ? '禁用' : '启用' }}
						</button>
					</view>
				</uni-td>
			</uni-tr>
		</uni-table>

		<!-- 分页 -->
		<uni-pagination :total="total" :current="pageNum" :pageSize="pageSize" @change="handlePageChange" />

		<!-- 新增/编辑弹窗 -->
		<uni-popup ref="formPopup" type="dialog">
			<uni-popup-dialog :title="formTitle" mode="base" :before-close="true" @close="closeDialog"
				@confirm="submitForm">
				<uni-forms ref="form" :modelValue="formData" :rules="rules">
					<uni-forms-item label="用户名" name="username">
						<uni-easyinput v-model="formData.username" placeholder="请输入用户名" />
					</uni-forms-item>
					<uni-forms-item label="手机号" name="mobile">
						<uni-easyinput v-model="formData.mobile" placeholder="请输入手机号" />
					</uni-forms-item>
					<uni-forms-item label="密码" name="password" v-if="!isEdit">
						<uni-easyinput type="password" v-model="formData.password" placeholder="请输入密码" />
					</uni-forms-item>
					<uni-forms-item label="状态" name="status">
						<uni-data-select v-model="formData.status" :localdata="statusOptions"
							placeholder="请选择状态"></uni-data-select>
					</uni-forms-item>
				</uni-forms>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		registerUser,
		updateUser,
		deleteUser,
		getUserList,
		resetPassword,
		getUserInfo
	} from '@/api/appx-template-exam-users.js'
	import {
		formatTime
	} from '@/utils/tableUtil.js'

	// 表格数据
	const tableData = ref([])
	const total = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(10)
	const searchKeyword = ref('')

	// 状态选项
	const statusOptions = ref([{
			value: 1,
			text: '正常'
		},
		{
			value: 0,
			text: '禁用'
		}
	])

	// 表单相关
	const formPopup = ref(null)
	const form = ref(null)
	const formTitle = ref('新增用户')
	const formData = ref({
		username: '',
		mobile: '',
		password: '',
		status: 1
	})
	const isEdit = ref(false)

	// 表单验证规则
	const rules = {
		username: {
			rules: [{
				required: true,
				errorMessage: '请输入用户名'
			}, {
				minLength: 2,
				maxLength: 10,
				errorMessage: '用户名长度在2-10个字符之间'
			}]
		},
		mobile: {
			rules: [{
				required: true,
				errorMessage: '请输入手机号'
			}, {
				pattern: '^1[3-9]\\d{9}$',
				errorMessage: '请输入正确的手机号格式'
			}]
		},
		password: {
			rules: [{
				required: true,
				errorMessage: '请输入密码'
			}, {
				minLength: 6,
				maxLength: 20,
				errorMessage: '密码长度在6-20个字符之间'
			}]
		},
		status: {
			rules: [{
				required: true,
				errorMessage: '请选择状态'
			}]
		}
	}

	// 初始化加载数据
	onMounted(() => {
		fetchData()
	})

	// 获取数据
	const fetchData = async () => {
		const params = {
			pageNum: pageNum.value,
			pageSize: pageSize.value,
			keyword: searchKeyword.value
		}

		try {
			const res = await getUserList(params)
			if (res.code === 200) {
				tableData.value = res.data.rows
				total.value = res.data.total
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.showToast({
				title: '获取数据失败',
				icon: 'none'
			})
		}
	}

	// 搜索
	const handleSearch = () => {
		pageNum.value = 1
		fetchData()
	}

	// 分页变化
	const handlePageChange = (e) => {
		pageNum.value = e.current
		fetchData()
	}

	// 新增
	const handleAdd = () => {
		formTitle.value = '新增用户'
		isEdit.value = false
		formData.value = {
			username: '',
			mobile: '',
			password: '',
			status: 1
		}
		formPopup.value.open()
	}

	// 编辑
	const handleEdit = async (id) => {
		try {
			const res = await getUserInfo({
				id
			})
			if (res.code === 200) {
				formTitle.value = '编辑用户'
				isEdit.value = true
				formData.value = {
					...res.data,
					_id: id
				}
				formPopup.value.open()
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		} catch (error) {
			console.log(error);
			uni.showToast({
				title: '获取用户详情失败',
				icon: 'none'
			})
		}
	}

	// 删除
	const handleDelete = async (id) => {
		uni.showModal({
			title: '提示',
			content: '确定要删除该用户吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await deleteUser({
							id
						})
						if (result.code === 200) {
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})
							fetchData()
						} else {
							uni.showToast({
								title: result.message,
								icon: 'none'
							})
						}
					} catch (error) {
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						})
					}
				}
			}
		})
	}

	// 重置密码
	const handleResetPwd = async (id) => {
		uni.showModal({
			title: '提示',
			content: '确定要重置该用户的密码吗？重置后密码将恢复为默认值',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await resetPassword({
							id
						})
						if (result.code === 200) {
							uni.showToast({
								title: '密码重置成功',
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: result.message,
								icon: 'none'
							})
						}
					} catch (error) {
						uni.showToast({
							title: '密码重置失败',
							icon: 'none'
						})
					}
				}
			}
		})
	}

	// 切换状态
	const handleToggleStatus = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1
		uni.showModal({
			title: '提示',
			content: `确定要${newStatus === 1 ? '启用' : '禁用'}该用户吗？`,
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await updateUser({
							_id: id,
							status: newStatus
						})
						if (result.code === 200) {
							uni.showToast({
								title: '状态修改成功',
								icon: 'success'
							})
							fetchData()
						} else {
							uni.showToast({
								title: result.message,
								icon: 'none'
							})
						}
					} catch (error) {
						uni.showToast({
							title: '状态修改失败',
							icon: 'none'
						})
					}
				}
			}
		})
	}

	// 关闭弹窗
	const closeDialog = () => {
		formPopup.value.close()
	}

	// 提交表单
	const submitForm = async () => {
		try {
			await form.value.validate()

			let result
			if (isEdit.value) {
				// 编辑时不需要密码字段
				const {
					password,
					...updateData
				} = formData.value
				result = await updateUser(updateData)
			} else {
				result = await registerUser(formData.value)
			}

			if (result.code === 200) {
				uni.showToast({
					title: isEdit.value ? '更新成功' : '添加成功',
					icon: 'success'
				})
				formPopup.value.close()
				fetchData()
			} else {
				uni.showToast({
					title: result.message,
					icon: 'none'
				})
			}
		} catch (error) {
			console.error(error)
		}
	}

	// 格式化时间
	const myFormatTime = (timestamp) => {
		return formatTime(timestamp, 'YYYY-MM-DD hh:mm:ss')
	}
</script>

<style scoped lang="scss">
	.container {
		padding: 20rpx;
	}

	.search-bar {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.filter-item {
			display: flex;
			margin-right: 20rpx;

			.item-content {
				width: 300rpx;

				&.inp {
					flex: unset;
					height: 35px;

					::v-deep .uni-easyinput__content-input {
						height: 33px;
					}
				}
			}
		}

		.filter-add-btn {
			height: 35px;
			margin: 0;
			font-size: 14px;
			line-height: 35px;
		}
	}

	.uni-table {
		margin-bottom: 20rpx;

		.action-buttons button {
			margin: 0 5rpx;
			margin-bottom: 5rpx;
		}
	}
</style>