<template>
	<view class="container">
		<!-- 顶部操作栏 -->
		<view class="header-actions">
			<view class="search-bar">
				<uni-search-bar v-model="searchKeyword" placeholder="搜索用户、手机号或考试名称" @confirm="handleSearch"
					@clear="handleClear" />
			</view>
			<view class="filter-actions">
				<uni-data-select v-model="statusFilter" :localdata="statusOptions" placeholder="状态筛选"
					@change="handleStatusChange" />
				<uni-data-select v-model="examFilter" :localdata="examOptions" placeholder="考试筛选"
					@change="handleExamChange" />
			</view>
		</view>

		<!-- 统计卡片 -->
		<view class="stat-cards">
			<view class="stat-card">
				<view class="stat-number">{{ statistics.total }}</view>
				<view class="stat-label">总报名数</view>
			</view>
			<view class="stat-card">
				<view class="stat-number">{{ statistics.pending }}</view>
				<view class="stat-label">待审核</view>
			</view>
			<view class="stat-card">
				<view class="stat-number">{{ statistics.approved }}</view>
				<view class="stat-label">已通过</view>
			</view>
			<view class="stat-card">
				<view class="stat-number">{{ statistics.rejected }}</view>
				<view class="stat-label">已拒绝</view>
			</view>
		</view>

		<!-- 数据表格 -->
		<view class="table-container">
			<uni-table ref="table" border stripe empty-text="暂无数据" loading-text="加载中..." :loading="loading">
				<uni-tr>
					<uni-th width="80" align="center">序号</uni-th>
					<uni-th width="120" align="center">用户</uni-th>
					<uni-th width="120" align="center">手机号</uni-th>
					<uni-th width="200" align="center">考试名称</uni-th>
					<uni-th width="150" align="center">报名时间</uni-th>
					<uni-th width="100" align="center">状态</uni-th>
					<uni-th width="150" align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item, index) in tableData" :key="item._id">
					<uni-td align="center">{{ (page.current - 1) * page.size + index + 1 }}</uni-td>
					<uni-td align="center">{{ item.user_info?.username || '-' }}</uni-td>
					<uni-td align="center">{{ item.user_info?.mobile || '-' }}</uni-td>
					<uni-td align="center">{{ item.exam_info?.title || '-' }}</uni-td>
					<uni-td align="center">{{ formatDate(item.enrolled_time) }}</uni-td>
					<uni-td align="center">
						<view :class="['status-tag', getStatusClass(item.status)]">
							{{ getStatusText(item.status) }}
						</view>
					</uni-td>
					<uni-td align="center">
						<view class="action-buttons">
							<button class="btn btn-primary" size="mini" @click="handleView(item)">
								查看
							</button>
							<button class="btn btn-success" size="mini" v-if="item.status === 0"
								@click="handleApprove(item)">
								通过
							</button>
							<button class="btn btn-danger" size="mini" v-if="item.status === 0"
								@click="handleReject(item)">
								拒绝
							</button>
							<button class="btn btn-warning" size="mini" @click="handleCancel(item)">
								取消
							</button>
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
		</view>

		<!-- 分页 -->
		<view class="pagination">
			<uni-pagination :current="page.current" :total="page.total" :page-size="page.size"
				@change="handlePageChange" show-icon />
		</view>

		<!-- 详情弹窗 -->
		<uni-popup ref="detailPopup" type="center">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">报名详情</text>
					<text class="popup-close" @click="closeDetail">×</text>
				</view>
				<view class="popup-body">
					<view class="detail-item">
						<text class="label">用户：</text>
						<text class="value">{{ currentDetail.user_info?.username }}</text>
					</view>
					<view class="detail-item">
						<text class="label">手机号：</text>
						<text class="value">{{ currentDetail.user_info?.mobile }}</text>
					</view>
					<view class="detail-item">
						<text class="label">考试：</text>
						<text class="value">{{ currentDetail.exam_info?.title }}</text>
					</view>
					<view class="detail-item">
						<text class="label">报名时间：</text>
						<text class="value">{{ formatDate(currentDetail.enrolled_time) }}</text>
					</view>
					<view class="detail-item">
						<text class="label">状态：</text>
						<text :class="['status-text', getStatusClass(currentDetail.status)]">
							{{ getStatusText(currentDetail.status) }}
						</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'

	// 表格数据
	const tableData = ref([])
	const loading = ref(false)
	const searchKeyword = ref('')
	const statusFilter = ref('')
	const examFilter = ref('')
	const page = ref({
		current: 1,
		size: 10,
		total: 0
	})
	const statistics = ref({
		total: 0,
		pending: 0,
		approved: 0,
		rejected: 0
	})
	const statusOptions = ref([{
			value: '',
			text: '全部状态'
		},
		{
			value: 0,
			text: '待审核'
		},
		{
			value: 1,
			text: '已通过'
		},
		{
			value: 2,
			text: '已拒绝'
		}
	])
	const examOptions = ref([{
		value: '',
		text: '全部考试'
	}])
	const currentDetail = ref({})

	// 模板引用
	const detailPopup = ref(null)

	// 初始化加载数据
	onMounted(() => {
		loadData()
		loadStatistics()
		loadExamOptions()
	})

	// 获取数据
	const loadData = async () => {
		loading.value = true
		try {
			const params = {
				page: page.value.current,
				pageSize: page.value.size,
				keyword: searchKeyword.value,
				status: statusFilter.value === '' ? undefined : parseInt(statusFilter.value),
				exam_id: examFilter.value === '' ? undefined : examFilter.value
			}

			const res = await uniCloud.callFunction({
				name: 'appx-template-exam-user-exams',
				data: {
					action: 'getEnrollmentList',
					params
				}
			})

			if (res.result.code === 200) {
				tableData.value = res.result.data?.rows || []
				page.value.total = res.result.data?.total || 0
			} else {
				uni.showToast({
					title: res.result.message || '加载失败',
					icon: 'none'
				})
				tableData.value = []
				page.value.total = 0
			}
		} catch (error) {
			console.error('加载数据失败:', error)
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		} finally {
			loading.value = false
		}
	}

	// 获取统计数据
	const loadStatistics = async () => {
		try {
			// 获取统计数据
			const totalRes = await uniCloud.callFunction({
				name: 'appx-template-exam-user-exams',
				data: {
					action: 'getEnrollmentList',
					params: {
						page: 1,
						pageSize: 1
					}
				}
			})

			const pendingRes = await uniCloud.callFunction({
				name: 'appx-template-exam-user-exams',
				data: {
					action: 'getEnrollmentList',
					params: {
						page: 1,
						pageSize: 1,
						status: 0
					}
				}
			})

			const approvedRes = await uniCloud.callFunction({
				name: 'appx-template-exam-user-exams',
				data: {
					action: 'getEnrollmentList',
					params: {
						page: 1,
						pageSize: 1,
						status: 1
					}
				}
			})

			const rejectedRes = await uniCloud.callFunction({
				name: 'appx-template-exam-user-exams',
				data: {
					action: 'getEnrollmentList',
					params: {
						page: 1,
						pageSize: 1,
						status: 2
					}
				}
			})

			statistics.value = {
				total: totalRes.result?.data?.total || 0,
				pending: pendingRes.result?.data?.total || 0,
				approved: approvedRes.result?.data?.total || 0,
				rejected: rejectedRes.result?.data?.total || 0
			}
		} catch (error) {
			console.error('加载统计数据失败:', error)
			// 设置默认值避免页面报错
			statistics.value = {
				total: 0,
				pending: 0,
				approved: 0,
				rejected: 0
			}
		}
	}

	// 加载考试选项
	const loadExamOptions = async () => {
		try {
			const res = await uniCloud.callFunction({
				name: 'appx-template-exam-exams',
				data: {
					action: 'list',
					params: {
						page: 1,
						pageSize: 100
					}
				}
			})

			if (res.result.code === 200) {
				const exams = (res.result.data?.rows || []).map(exam => ({
					value: exam._id,
					text: exam.title
				}))
				examOptions.value = [{
						value: '',
						text: '全部考试'
					},
					...exams
				]
			}
		} catch (error) {
			console.error('加载考试选项失败:', error)
		}
	}

	// 搜索
	const handleSearch = () => {
		page.value.current = 1
		loadData()
	}

	// 清除搜索
	const handleClear = () => {
		searchKeyword.value = ''
		handleSearch()
	}

	// 状态筛选变化
	const handleStatusChange = () => {
		page.value.current = 1
		loadData()
	}

	// 考试筛选变化
	const handleExamChange = () => {
		page.value.current = 1
		loadData()
	}

	// 分页变化
	const handlePageChange = (e) => {
		page.value.current = e.current
		loadData()
	}

	// 查看详情
	const handleView = (item) => {
		currentDetail.value = item
		detailPopup.value.open()
	}

	// 关闭详情弹窗
	const closeDetail = () => {
		detailPopup.value.close()
	}

	// 通过审核
	const handleApprove = (item) => {
		uni.showModal({
			title: '确认通过',
			content: '确定要通过该用户的报名申请吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await uniCloud.callFunction({
							name: 'appx-template-exam-user-exams',
							data: {
								action: 'updateStatus',
								params: {
									id: item._id,
									status: 1
								}
							}
						})

						if (result.result.code === 200) {
							uni.showToast({
								title: '已通过',
								icon: 'success'
							})
							loadData()
							loadStatistics()
						} else {
							uni.showToast({
								title: result.result.message || '操作失败',
								icon: 'none'
							})
						}
					} catch (error) {
						uni.showToast({
							title: '操作失败',
							icon: 'none'
						})
					}
				}
			}
		})
	}

	// 拒绝审核
	const handleReject = (item) => {
		uni.showModal({
			title: '确认拒绝',
			content: '确定要拒绝该用户的报名申请吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await uniCloud.callFunction({
							name: 'appx-template-exam-user-exams',
							data: {
								action: 'updateStatus',
								params: {
									id: item._id,
									status: 2
								}
							}
						})

						if (result.result.code === 200) {
							uni.showToast({
								title: '已拒绝',
								icon: 'success'
							})
							loadData()
							loadStatistics()
						} else {
							uni.showToast({
								title: result.result.message || '操作失败',
								icon: 'none'
							})
						}
					} catch (error) {
						uni.showToast({
							title: '操作失败',
							icon: 'none'
						})
					}
				}
			}
		})
	}

	// 取消报名
	const handleCancel = (item) => {
		uni.showModal({
			title: '确认取消',
			content: '确定要取消该用户的报名吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await uniCloud.callFunction({
							name: 'appx-template-exam-user-exams',
							data: {
								action: 'cancelEnrollment',
								params: {
									user_id: item.user_id,
									exam_id: item.exam_id
								}
							}
						})

						if (result.result.code === 200) {
							uni.showToast({
								title: '已取消',
								icon: 'success'
							})
							loadData()
							loadStatistics()
						} else {
							uni.showToast({
								title: result.result.message || '操作失败',
								icon: 'none'
							})
						}
					} catch (error) {
						uni.showToast({
							title: '操作失败',
							icon: 'none'
						})
					}
				}
			}
		})
	}

	// 格式化日期
	const formatDate = (timestamp) => {
		if (!timestamp) return '-'
		const date = new Date(timestamp)
		return date.toLocaleString('zh-CN')
	}

	// 获取状态文本
	const getStatusText = (status) => {
		const statusMap = {
			0: '待审核',
			1: '已通过',
			2: '已拒绝'
		}
		return statusMap[status] || '未知'
	}

	// 获取状态样式类
	const getStatusClass = (status) => {
		const classMap = {
			0: 'status-pending',
			1: 'status-approved',
			2: 'status-rejected'
		}
		return classMap[status] || ''
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.header-actions {
		background: white;
		padding: 20rpx;
		border-radius: 8rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

		.search-bar {
			margin-bottom: 20rpx;
		}

		.filter-actions {
			display: flex;
			gap: 20rpx;

			.uni-data-select {
				flex: 1;
			}
		}
	}

	.stat-cards {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;

		.stat-card {
			flex: 1;
			background: white;
			padding: 30rpx;
			border-radius: 8rpx;
			text-align: center;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

			.stat-number {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
			}

			.stat-label {
				font-size: 24rpx;
				color: #666;
			}
		}
	}

	.table-container {
		background: white;
		border-radius: 8rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 20rpx;
	}

	.status-tag {
		padding: 4rpx 12rpx;
		border-radius: 4rpx;
		font-size: 22rpx;
		color: white;
		display: inline-block;

		&.status-pending {
			background-color: #ff9800;
		}

		&.status-approved {
			background-color: #4caf50;
		}

		&.status-rejected {
			background-color: #f44336;
		}
	}

	.action-buttons {
		display: flex;
		gap: 10rpx;
		justify-content: center;

		.btn {
			margin: 0;
			padding: 8rpx 16rpx;
			font-size: 22rpx;
			border-radius: 4rpx;

			&.btn-primary {
				background-color: #007bff;
				color: white;
			}

			&.btn-success {
				background-color: #28a745;
				color: white;
			}

			&.btn-danger {
				background-color: #dc3545;
				color: white;
			}

			&.btn-warning {
				background-color: #ffc107;
				color: #212529;
			}
		}
	}

	.pagination {
		display: flex;
		justify-content: center;
		margin-top: 20rpx;
	}

	.popup-content {
		background: white;
		border-radius: 8rpx;
		width: 600rpx;
		max-width: 90vw;

		.popup-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #eee;

			.popup-title {
				font-size: 32rpx;
				font-weight: bold;
			}

			.popup-close {
				font-size: 40rpx;
				color: #999;
				cursor: pointer;
			}
		}

		.popup-body {
			padding: 30rpx;

			.detail-item {
				display: flex;
				margin-bottom: 20rpx;

				.label {
					width: 120rpx;
					color: #666;
					flex-shrink: 0;
				}

				.value {
					flex: 1;
					color: #333;
				}

				.status-text {
					padding: 4rpx 12rpx;
					border-radius: 4rpx;
					font-size: 22rpx;
					color: white;

					&.status-pending {
						background-color: #ff9800;
					}

					&.status-approved {
						background-color: #4caf50;
					}

					&.status-rejected {
						background-color: #f44336;
					}
				}
			}
		}
	}
</style>