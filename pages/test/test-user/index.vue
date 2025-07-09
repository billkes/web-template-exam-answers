<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<uni-easyinput class="inp" suffixIcon="search" clearable v-model="searchName" placeholder="请输入姓名"
				@iconClick="handleSearch"></uni-easyinput>
			<button type="primary" @click="handleAdd">新增</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="120" align="center">姓名</uni-th>
				<uni-th width="180" align="center">身份证号</uni-th>
				<uni-th width="120" align="center">手机号</uni-th>
				<uni-th width="180" align="center">创建时间</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.name }}</uni-td>
				<uni-td align="center">{{ item.id_card }}</uni-td>
				<uni-td align="center">{{ item.phone }}</uni-td>
				<uni-td align="center">{{ myFormatTime(item.create_time) }}</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
						<button type="primary" size="mini" @click="handleEdit(item)">编辑</button>
						<button type="warn" size="mini" @click="handleDelete(item._id)">删除</button>
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
					<uni-forms-item label="姓名" name="name">
						<uni-easyinput v-model="formData.name" placeholder="请输入姓名" />
					</uni-forms-item>
					<uni-forms-item label="身份证号" name="id_card">
						<uni-easyinput v-model="formData.id_card" placeholder="请输入身份证号" />
					</uni-forms-item>
					<uni-forms-item label="手机号" name="phone">
						<uni-easyinput v-model="formData.phone" placeholder="请输入手机号" />
					</uni-forms-item>
					<uni-forms-item label="密码" name="pwd">
						<uni-easyinput type="password" v-model="formData.pwd" placeholder="请输入密码" />
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
		getUserList,
		addUser,
		updateUser,
		deleteUser
	} from '@/api/testUser.js'
	import {
		formatTime
	} from '@/utils/tableUtil.js'

	// 表格数据
	const tableData = ref([])
	const total = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(10)
	const searchName = ref('')

	// 表单相关
	const formPopup = ref(null)
	const form = ref(null)
	const formTitle = ref('新增用户')
	const formData = ref({
		name: '',
		id_card: '',
		phone: '',
		pwd: ''
	})
	const isEdit = ref(false)

	// 表单验证规则
	const rules = {
		name: {
			rules: [{
					required: true,
					errorMessage: '请输入姓名'
				},
				{
					minLength: 2,
					maxLength: 20,
					errorMessage: '姓名长度在2-20个字符之间'
				}
			]
		},
		id_card: {
			rules: [{
					required: true,
					errorMessage: '请输入身份证号'
				},
				{
					pattern: '^\\d{17}[\\dXx]$',
					errorMessage: '身份证号格式不正确'
				}
			]
		},
		phone: {
			rules: [{
					required: true,
					errorMessage: '请输入手机号'
				},
				{
					pattern: '^1[3-9]\\d{9}$',
					errorMessage: '手机号格式不正确'
				}
			]
		},
		pwd: {
			rules: [{
					required: true,
					errorMessage: '请输入密码'
				},
				{
					minLength: 6,
					errorMessage: '密码长度不能少于6位'
				}
			]
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
			name: searchName.value
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
		console.log('搜索');
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
			name: '',
			id_card: '',
			phone: '',
			pwd: ''
		}
		formPopup.value.open()
	}

	// 编辑
	const handleEdit = (row) => {
		formTitle.value = '编辑用户'
		isEdit.value = true
		formData.value = {
			...row
		}
		formPopup.value.open()
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
				result = await updateUser(formData.value)
			} else {
				result = await addUser(formData.value)
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

<style scoped>
	.container {
		padding: 20rpx;
	}

	.search-bar {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.search-bar button {
		margin-left: 20rpx;
	}

	::v-deep .search-bar .inp .uni-easyinput__content {
		width: 400rpx;
	}

	.action-buttons button {
		margin: 0 5rpx;
	}

	.uni-table {
		margin-bottom: 20rpx;
	}
</style>