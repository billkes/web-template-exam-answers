<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-easyinput class="item-content inp" suffixIcon="search" clearable v-model="searchKeyword"
					placeholder="请输入考试名称" @iconClick="handleSearch"></uni-easyinput>
			</view>
			<button class="filter-add-btn" type="primary" @click="handleAdd">新增</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="200" align="center">考试名称</uni-th>
				<uni-th width="120" align="center">考试状态</uni-th>
				<uni-th width="150" align="center">开始时间</uni-th>
				<uni-th width="150" align="center">结束时间</uni-th>
				<uni-th width="100" align="center">时长(分钟)</uni-th>
				<uni-th width="100" align="center">总分</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.name }}</uni-td>
				<uni-td align="center">
					<uni-tag :text="formatStatus(item.status)" :type="getStatusType(item.status)" />
				</uni-td>
				<uni-td align="center">{{ myFormatTime(item.start_time) }}</uni-td>
				<uni-td align="center">{{ myFormatTime(item.end_time) }}</uni-td>
				<uni-td align="center">{{ item.duration }}</uni-td>
				<uni-td align="center">{{ item.total_score }}</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
						<button type="primary" size="mini" @click="handleEdit(item._id)">编辑</button>
						<button type="warn" size="mini" @click="handleDelete(item._id)">删除</button>
						<button type="default" size="mini" @click="handleChangeStatus(item._id, item.status)">
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
					<uni-forms-item label="考试名称" name="name">
						<uni-easyinput v-model="formData.name" placeholder="请输入考试名称" />
					</uni-forms-item>
					<uni-forms-item label="开始时间" name="start_time">
						<uni-datetime-picker type="datetime" v-model="formData.start_time" />
					</uni-forms-item>
					<uni-forms-item label="结束时间" name="end_time">
						<uni-datetime-picker type="datetime" v-model="formData.end_time" />
					</uni-forms-item>
					<uni-forms-item label="考试时长(分钟)" name="duration">
						<uni-easyinput type="number" v-model="formData.duration" placeholder="请输入考试时长" />
					</uni-forms-item>
					<uni-forms-item label="总分" name="total_score">
						<uni-easyinput type="number" v-model="formData.total_score" placeholder="请输入总分" />
					</uni-forms-item>
					<uni-forms-item label="考试说明" name="description">
						<uni-easyinput type="textarea" v-model="formData.description" placeholder="请输入考试说明" />
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
		createExam,
		updateExam,
		deleteExam,
		getExamList,
		getExam,
		changeExamStatus
	} from '@/api/appx-template-exam-exams.js'
	import {
		formatTime
	} from '@/utils/tableUtil.js'

	// 表格数据
	const tableData = ref([])
	const total = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(10)
	const searchKeyword = ref('')

	// 表单相关
	const formPopup = ref(null)
	const form = ref(null)
	const formTitle = ref('新增考试')
	const formData = ref({
		name: '',
		start_time: '',
		end_time: '',
		duration: 60,
		total_score: 100,
		description: '',
		status: 1
	})
	const isEdit = ref(false)

	// 表单验证规则
	const rules = {
		name: {
			rules: [{
				required: true,
				errorMessage: '请输入考试名称'
			}]
		},
		start_time: {
			rules: [{
				required: true,
				errorMessage: '请选择开始时间'
			}]
		},
		end_time: {
			rules: [{
				required: true,
				errorMessage: '请选择结束时间'
			}, {
				validateFunction: (rule, value, data, callback) => {
					if (new Date(value) <= new Date(data.start_time)) {
						callback('结束时间必须晚于开始时间')
					} else {
						callback()
					}
				}
			}]
		},
		duration: {
			rules: [{
				required: true,
				errorMessage: '请输入考试时长'
			}, {
				pattern: '^[0-9]+$',
				errorMessage: '请输入整数分钟数'
			}]
		},
		total_score: {
			rules: [{
				required: true,
				errorMessage: '请输入总分'
			}, {
				pattern: '^[0-9]+(\\.[0-9]{1,2})?$',
				errorMessage: '请输入正确的分数格式'
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
			const res = await getExamList(params)
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
		formTitle.value = '新增考试'
		isEdit.value = false
		formData.value = {
			name: '',
			start_time: '',
			end_time: '',
			duration: 60,
			total_score: 100,
			description: '',
			status: 1
		}
		formPopup.value.open()
	}

	// 编辑
	const handleEdit = async (id) => {
		try {
			const res = await getExam({
				id
			})
			if (res.code === 200) {
				formTitle.value = '编辑考试'
				isEdit.value = true
				formData.value = res.data
				formPopup.value.open()
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.showToast({
				title: '获取考试详情失败',
				icon: 'none'
			})
		}
	}

	// 删除
	const handleDelete = async (id) => {
		uni.showModal({
			title: '提示',
			content: '确定要删除该考试吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await deleteExam({
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

	// 修改状态
	const handleChangeStatus = async (id, currentStatus) => {
		const newStatus = currentStatus === 1 ? 0 : 1
		uni.showModal({
			title: '提示',
			content: `确定要${newStatus === 1 ? '启用' : '禁用'}该考试吗？`,
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await changeExamStatus({
							id,
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
				result = await updateExam(formData.value)
			} else {
				result = await createExam(formData.value)
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

	// 格式化状态
	const formatStatus = (status) => {
		return status === 1 ? '启用' : '禁用'
	}

	// 获取状态标签类型
	const getStatusType = (status) => {
		return status === 1 ? 'success' : 'error'
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