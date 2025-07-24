<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-easyinput class="item-content inp" suffixIcon="search" clearable v-model="searchKeyword"
					placeholder="请输入考生姓名或试卷名称" @iconClick="handleSearch"></uni-easyinput>
			</view>
			<button class="filter-add-btn" type="primary" @click="handleAdd">新增</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="120" align="center">考生姓名</uni-th>
				<uni-th width="150" align="center">试卷名称</uni-th>
				<uni-th width="100" align="center">得分</uni-th>
				<uni-th width="100" align="center">总分</uni-th>
				<uni-th width="120" align="center">考试用时</uni-th>
				<uni-th width="180" align="center">考试时间</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.user_name }}</uni-td>
				<uni-td align="center">{{ item.paper_name }}</uni-td>
				<uni-td align="center">{{ item.score }}</uni-td>
				<uni-td align="center">{{ item.total_score }}</uni-td>
				<uni-td align="center">{{ formatDuration(item.duration) }}</uni-td>
				<uni-td align="center">{{ myFormatTime(item.create_time) }}</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
						<button type="primary" size="mini" @click="handleDetail(item._id)">详情</button>
						<button type="warn" size="mini" @click="handleDelete(item._id)">删除</button>
					</view>
				</uni-td>
			</uni-tr>
		</uni-table>

		<!-- 分页 -->
		<uni-pagination :total="total" :current="pageNum" :pageSize="pageSize" @change="handlePageChange" />

		<!-- 新增弹窗 -->
		<uni-popup ref="formPopup" type="dialog">
			<uni-popup-dialog :title="formTitle" mode="base" :before-close="true" @close="closeDialog"
				@confirm="submitForm">
				<uni-forms ref="form" :modelValue="formData" :rules="rules">
					<uni-forms-item label="用户ID" name="user_id">
						<uni-easyinput v-model="formData.user_id" placeholder="请输入用户ID" />
					</uni-forms-item>
					<uni-forms-item label="试卷ID" name="paper_id">
						<uni-easyinput v-model="formData.paper_id" placeholder="请输入试卷ID" />
					</uni-forms-item>
					<uni-forms-item label="得分" name="score">
						<uni-easyinput type="number" v-model="formData.score" placeholder="请输入得分" />
					</uni-forms-item>
					<uni-forms-item label="总分" name="total_score">
						<uni-easyinput type="number" v-model="formData.total_score" placeholder="请输入总分" />
					</uni-forms-item>
					<uni-forms-item label="考试用时(秒)" name="duration">
						<uni-easyinput type="number" v-model="formData.duration" placeholder="请输入考试用时(秒)" />
					</uni-forms-item>
					<uni-forms-item label="答题详情" name="answers">
						<uni-easyinput type="textarea" v-model="formData.answers" placeholder="请输入答题详情(JSON格式)" />
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
		getRecordList,
		addRecord,
		updateRecord,
		getRecordDetail,
		deleteRecord
	} from '@/api/appx-template-exam-answer-records.js'
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
	const formTitle = ref('新增考试记录')
	const formData = ref({
		user_id: '',
		paper_id: '',
		score: 0,
		total_score: 100,
		duration: 0,
		answers: '[]'
	})
	const isEdit = ref(false)

	// 表单验证规则
	const rules = {
		user_id: {
			rules: [{
				required: true,
				errorMessage: '请输入用户ID'
			}]
		},
		paper_id: {
			rules: [{
				required: true,
				errorMessage: '请输入试卷ID'
			}]
		},
		score: {
			rules: [{
				required: true,
				errorMessage: '请输入得分'
			}, {
				pattern: '^[0-9]+(\\.[0-9]{1,2})?$',
				errorMessage: '请输入正确的分数格式'
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
		},
		duration: {
			rules: [{
				required: true,
				errorMessage: '请输入考试用时'
			}, {
				pattern: '^[0-9]+$',
				errorMessage: '请输入整数秒数'
			}]
		},
		answers: {
			rules: [{
				required: true,
				errorMessage: '请输入答题详情'
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
			const res = await getRecordList(params)
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
		formTitle.value = '新增考试记录'
		isEdit.value = false
		formData.value = {
			user_id: '',
			paper_id: '',
			score: 0,
			total_score: 100,
			duration: 0,
			answers: '[]'
		}
		formPopup.value.open()
	}

	// 详情
	const handleDetail = (id) => {
		uni.navigateTo({
			url: `/pages/test/answer-records/detail?id=${id}`
		})
	}

	// 删除
	const handleDelete = async (id) => {
		uni.showModal({
			title: '提示',
			content: '确定要删除该考试记录吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await deleteRecord({
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

			// 处理answers字段，尝试转换为JSON
			try {
				formData.value.answers = JSON.parse(formData.value.answers)
			} catch (e) {
				uni.showToast({
					title: '答题详情必须是有效的JSON格式',
					icon: 'none'
				})
				return
			}

			let result
			if (isEdit.value) {
				result = await updateRecord(formData.value)
			} else {
				result = await addRecord(formData.value)
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

	// 格式化考试用时
	const formatDuration = (seconds) => {
		if (!seconds) return '0秒'
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
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