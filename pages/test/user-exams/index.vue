<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-easyinput class="item-content inp" suffixIcon="search" clearable v-model="searchKeyword"
					placeholder="请输入关键词" @iconClick="handleSearch"></uni-easyinput>
			</view>
			<button class="filter-add-btn" type="primary" @click="handleAdd">新增</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="120" align="center">用户</uni-th>
				<uni-th width="200" align="center">考试名称</uni-th>
				<uni-th width="150" align="center">报名时间</uni-th>
				<uni-th width="100" align="center">状态</uni-th>
				<uni-th width="150" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.user_username || '-' }}</uni-td>
				<uni-td align="center">{{ item.exam_title || '-' }}</uni-td>
				<uni-td align="center">{{ myFormatTime(item.enrolled_time || item.create_time) }}</uni-td>
				<uni-td align="center">
					<!-- // 0-待审核，1-已通过，2-已拒绝" -->
					<uni-tag :text="item.status === 0 ? '待审核' : item.status === 1? '已通过' : '已拒绝'"
						:type="item.status === 0 ? 'warning' : item.status === 1? 'success' : 'error'" />
				</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
						<button class="btn btn-primary" size="mini" @click="handleView(item._id)">
							查看
						</button>
						<button class="btn btn-primary" size="mini" @click="handleEdit(item._id)">
							编辑
						</button>
						<button class="btn btn-warning" size="mini" @click="handleDelete(item._id)">
							删除
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
					<uni-forms-item label="考生" name="user_id">
						<uni-data-select v-model="formData.user_id" :localdata="userList"
							placeholder="请选择考生"></uni-data-select>
					</uni-forms-item>
					<uni-forms-item label="考试" name="exam_id">
						<uni-data-select v-model="formData.exam_id" :localdata="examList"
							placeholder="请选择考试"></uni-data-select>
					</uni-forms-item>
					<uni-forms-item label="报名时间" name="enrolled_time">
						<uni-datetime-picker type="datetime" v-model="formData.enrolled_time" />
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
		getUserExamList,
		getUserExamDetail,
		enrollExam,
		updateUserExam,
		deleteUserExam,
	} from '@/api/appx-template-exam-user-exams.js'
	import {
		getUserList
	} from '@/api/appx-template-exam-users.js'
	import {
		getExamList
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

	// 状态选项
	// 0-待审核，1-已通过，2-已拒绝"
	const statusOptions = ref([{
			value: 2,
			text: '已拒绝'
		},
		{
			value: 1,
			text: '已通过'
		},
		{
			value: 0,
			text: '待审核'
		}
	])

	// 表单相关
	const formPopup = ref(null)
	const form = ref(null)
	const formTitle = ref('新增用户')
	const formData = ref({
		user_id: '',
		exam_id: '',
		enrolled_time: '',
		status: 1
	})
	const isEdit = ref(false)

	const userList = ref([])
	const examList = ref([])

	// 表单验证规则
	const rules = {
		user_id: {
			rules: [{
				required: true,
				errorMessage: '请选择用户'
			}]
		},
		exam_id: {
			rules: [{
				required: true,
				errorMessage: '请选择考试'
			}]
		},
		enrolled_time: {
			rules: [{
				required: true,
				errorMessage: '请选择时间'
			}]
		},
		status: {
			rules: [{
				required: true,
				errorMessage: '请选择状态'
			}]
		}
	}

	// 加载选择数据
	const loadSelectData = async () => {
		try {
			// 加载用户列表
			const userRes = await getUserList()
			if (userRes.code === 200) {
				userList.value = userRes.data.rows.map(user => ({
					value: user._id,
					text: user.username || user.nickname || user._id
				}))
			}

			// 加载考试列表
			const examRes = await getExamList()
			if (examRes.code === 200) {
				examList.value = examRes.data.rows.map(exam => ({
					value: exam._id,
					text: exam.name
				}))
			}
		} catch (error) {
			console.error('加载选择数据失败:', error)
		}
	}

	// 获取数据
	const fetchData = async () => {
		const params = {
			pageNum: pageNum.value,
			pageSize: pageSize.value,
			keyword: searchKeyword.value
		}

		try {
			const res = await getUserExamList(params)
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
		formTitle.value = '新增'
		isEdit.value = false
		formData.value = {
			user_id: '',
			exam_id: '',
			enrolled_time: '',
			status: 1
		}
		formPopup.value.open()
	}

	const handleView = async (id) => {
		uni.navigateTo({
			url: '/pages/test/answer-records/detail?id=' + id
		})
	}

	// 编辑
	const handleEdit = async (id) => {
		try {
			const res = await getUserExamDetail(id)
			if (res.code === 200) {
				formTitle.value = '编辑'
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
				title: '获取详情失败',
				icon: 'none'
			})
		}
	}

	// 删除
	const handleDelete = async (id) => {
		uni.showModal({
			title: '提示',
			content: '确定要删除吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await deleteUserExam(id)
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
				// 编辑时不需要密码字段
				result = await updateUserExam(formData.value)
			} else {
				result = await enrollExam(formData.value)
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

	// 初始化加载数据
	onMounted(() => {
		loadSelectData()
		fetchData()
	})
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
		}
	}
</style>