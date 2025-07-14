<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-data-select class="item-content" v-model="searchPaper" :localdata="paperOptions"
					placeholder="选择试卷" />
			</view>
			<view class="filter-item">
				<uni-data-select class="item-content" v-model="searchUser" :localdata="userOptions"
					placeholder="选择用户" />
			</view>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="150" align="center">试卷名称</uni-th>
				<uni-th width="120" align="center">考生姓名</uni-th>
				<uni-th width="120" align="center">考试时间</uni-th>
				<uni-th width="100" align="center">用时</uni-th>
				<uni-th width="80" align="center">得分</uni-th>
				<uni-th width="100" align="center">是否通过</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.paper_detail?.name || '试卷已删除' }}</uni-td>
				<uni-td align="center">{{ item.user_detail?.name || '用户已删除' }}</uni-td>
				<uni-td align="center">{{ myFormatTime(item.start_time) }}</uni-td>
				<uni-td align="center">{{ formatDuration(item.time_used) }}</uni-td>
				<uni-td align="center">{{ item.score }}</uni-td>
				<uni-td align="center">
					<uni-tag :text="item.is_passed ? '通过' : '未通过'" :type="item.is_passed ? 'success' : 'error'" />
				</uni-td>
				<uni-td align="center">
					<button type="primary" size="mini" @click="handleDetail(item._id)">详情</button>
				</uni-td>
			</uni-tr>
		</uni-table>

		<!-- 分页 -->
		<uni-pagination :total="total" :current="pageNum" :pageSize="pageSize" @change="handlePageChange" />
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		getRecordList,
		getRecordDetail,
		getUserPaperRecords
	} from '@/api/testRecords.js'
	import {
		formatTime
	} from '@/utils/tableUtil.js'

	// 表格数据
	const tableData = ref([])
	const total = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(10)

	// 搜索条件
	const searchPaper = ref('')
	const searchUser = ref('')
	const paperOptions = ref([])
	const userOptions = ref([])

	// 初始化加载数据
	onMounted(async () => {
		await fetchPaperList()
		await fetchUserList()
		fetchData()
	})

	// 获取试卷列表
	const fetchPaperList = async () => {
		try {
			const res = await getPaperList({
				pageSize: 1000
			})
			if (res.code === 200) {
				paperOptions.value = res.data.rows.map(item => ({
					value: item._id,
					text: item.name
				}))
			}
		} catch (error) {
			uni.showToast({
				title: '获取试卷列表失败',
				icon: 'none'
			})
		}
	}

	// 获取用户列表
	const fetchUserList = async () => {
		try {
			const res = await getUserList({
				pageSize: 1000
			})
			if (res.code === 200) {
				userOptions.value = res.data.rows.map(item => ({
					value: item._id,
					text: item.name
				}))
			}
		} catch (error) {
			uni.showToast({
				title: '获取用户列表失败',
				icon: 'none'
			})
		}
	}

	// 获取数据
	const fetchData = async () => {
		const params = {
			pageNum: pageNum.value,
			pageSize: pageSize.value,
			paper_id: searchPaper.value,
			user_id: searchUser.value
		}

		try {
			const res = await getRecordList(params)
			if (res.code === 200) {
				tableData.value = res.data.rows
				total.value = res.data.total
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

	// 查看详情
	const handleDetail = (id) => {
		uni.navigateTo({
			url: `/pages/test/exam-records/detail?id=${id}`
		})
	}

	// 格式化时间
	const myFormatTime = (timestamp) => {
		return formatTime(timestamp, 'YYYY-MM-DD hh:mm')
	}

	// 格式化考试用时
	const formatDuration = (seconds) => {
		if (!seconds) return '-'
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}分${secs}秒`
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
		}
	}

	.option-item {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;

		button {
			margin-left: 10rpx;
		}
	}
</style>