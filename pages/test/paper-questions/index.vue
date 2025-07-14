<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-data-select class="item-content" v-model="currentPaper" :localdata="paperOptions"
					placeholder="请选择试卷" />
			</view>
			<button class="filter-add-btn" type="primary" @click="handleAddQuestion"
				:disabled="!currentPaper">添加题目</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据" v-if="currentPaper">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="150" align="center">题目内容</uni-th>
				<uni-th width="100" align="center">题目类型</uni-th>
				<uni-th width="80" align="center">分值</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ index + 1 }}</uni-td>
				<uni-td align="center">{{ item.question_detail?.content || '题目已删除' }}</uni-td>
				<uni-td align="center">{{ getQuestionTypeText(item.question_detail?.type) }}</uni-td>
				<uni-td align="center">{{ item.question_detail?.score || 0 }}</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
						<button type="warn" size="mini" @click="handleDelete(item._id)">移除</button>
						<button type="default" size="mini" @click="handleSort(item, 'up')"
							:disabled="index === 0">上移</button>
						<button type="default" size="mini" @click="handleSort(item, 'down')"
							:disabled="index === tableData.length - 1">下移</button>
					</view>
				</uni-td>
			</uni-tr>
		</uni-table>

		<!-- 添加题目弹窗 -->
		<uni-popup ref="questionPopup" type="dialog">
			<uni-popup-dialog title="添加题目到试卷" mode="base" :before-close="true" @close="closeQuestionDialog"
				@confirm="submitQuestions">
				<view class="popup-content">
					<uni-table border stripe>
						<uni-tr>
							<uni-th width="60" align="center">选择</uni-th>
							<uni-th width="150" align="center">题目内容</uni-th>
							<uni-th width="100" align="center">题目类型</uni-th>
							<uni-th width="80" align="center">分值</uni-th>
						</uni-tr>
						<uni-tr v-for="(item, index) in questionList" :key="item._id">
							<uni-td align="center">
								<checkbox :value="item._id" :checked="selectedQuestions.includes(item._id)"
									@click="toggleQuestion(item._id)" />
							</uni-td>
							<uni-td align="center">{{ item.content }}</uni-td>
							<uni-td align="center">{{ getQuestionTypeText(item.type) }}</uni-td>
							<uni-td align="center">{{ item.score }}</uni-td>
						</uni-tr>
					</uni-table>
					<uni-pagination :total="questionTotal" :current="questionPageNum" :pageSize="questionPageSize"
						@change="handleQuestionPageChange" />
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		watch
	} from 'vue'
	import {
		getPaperSettingsList,
	} from '@/api/testPaperSettings.js'
	import {
		getPaperQuestionList,
		batchAddPaperQuestions,
		deletePaperQuestion,
		updatePaperQuestion
	} from '@/api/testPaperQuestions.js'

	// 试卷选择
	const currentPaper = ref('')
	const paperOptions = ref([])

	// 表格数据
	const tableData = ref([])

	// 题目选择相关
	const questionPopup = ref(null)
	const questionList = ref([])
	const questionTotal = ref(0)
	const questionPageNum = ref(1)
	const questionPageSize = ref(10)
	const selectedQuestions = ref([])

	// 初始化加载数据
	onMounted(async () => {
		await fetchPaperList()
	})

	// 获取试卷列表
	const fetchPaperList = async () => {
		try {
			const res = await getPaperSettingsList({
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

	// 监听试卷选择变化
	watch(currentPaper, (newVal) => {
		if (newVal) {
			fetchPaperQuestions()
		} else {
			tableData.value = []
		}
	})

	// 获取试卷题目列表
	const fetchPaperQuestions = async () => {
		try {
			const res = await getPaperQuestionList({
				paper_id: currentPaper.value
			})
			if (res.code === 200) {
				tableData.value = res.data.rows
			}
		} catch (error) {
			uni.showToast({
				title: '获取试卷题目失败',
				icon: 'none'
			})
		}
	}

	// 获取题目列表
	const fetchQuestionList = async () => {
		try {
			const res = await getQuestionList({
				pageNum: questionPageNum.value,
				pageSize: questionPageSize.value
			})
			if (res.code === 200) {
				questionList.value = res.data.rows
				questionTotal.value = res.data.total
			}
		} catch (error) {
			uni.showToast({
				title: '获取题目列表失败',
				icon: 'none'
			})
		}
	}

	// 添加题目按钮点击
	const handleAddQuestion = async () => {
		selectedQuestions.value = []
		questionPageNum.value = 1
		await fetchQuestionList()
		questionPopup.value.open()
	}

	// 题目分页变化
	const handleQuestionPageChange = (e) => {
		questionPageNum.value = e.current
		fetchQuestionList()
	}

	// 切换题目选择
	const toggleQuestion = (id) => {
		const index = selectedQuestions.value.indexOf(id)
		if (index === -1) {
			selectedQuestions.value.push(id)
		} else {
			selectedQuestions.value.splice(index, 1)
		}
	}

	// 提交题目选择
	const submitQuestions = async () => {
		if (selectedQuestions.value.length === 0) {
			uni.showToast({
				title: '请至少选择一个题目',
				icon: 'none'
			})
			return
		}

		try {
			const res = await batchAddPaperQuestions({
				paper_id: currentPaper.value,
				question_ids: selectedQuestions.value
			})
			if (res.code === 200) {
				uni.showToast({
					title: '添加成功',
					icon: 'success'
				})
				questionPopup.value.close()
				fetchPaperQuestions()
			}
		} catch (error) {
			uni.showToast({
				title: '添加题目失败',
				icon: 'none'
			})
		}
	}

	// 关闭题目弹窗
	const closeQuestionDialog = () => {
		questionPopup.value.close()
	}

	// 删除题目
	const handleDelete = async (id) => {
		uni.showModal({
			title: '提示',
			content: '确定要从试卷中移除该题目吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await deletePaperQuestion(id)
						if (result.code === 200) {
							uni.showToast({
								title: '移除成功',
								icon: 'success'
							})
							fetchPaperQuestions()
						}
					} catch (error) {
						uni.showToast({
							title: '移除失败',
							icon: 'none'
						})
					}
				}
			}
		})
	}

	// 题目排序
	const handleSort = async (item, direction) => {
		const currentIndex = tableData.value.findIndex(i => i._id === item._id)
		if (currentIndex === -1) return

		const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
		if (newIndex < 0 || newIndex >= tableData.value.length) return

		// 交换排序值
		const tempSort = tableData.value[currentIndex].sort
		tableData.value[currentIndex].sort = tableData.value[newIndex].sort
		tableData.value[newIndex].sort = tempSort

		// 更新数据库
		try {
			await Promise.all([
				updatePaperQuestion({
					_id: tableData.value[currentIndex]._id,
					sort: tableData.value[currentIndex].sort
				}),
				updatePaperQuestion({
					_id: tableData.value[newIndex]._id,
					sort: tableData.value[newIndex].sort
				})
			])
			fetchPaperQuestions()
		} catch (error) {
			uni.showToast({
				title: '排序失败',
				icon: 'none'
			})
		}
	}

	// 获取题目类型文本
	const getQuestionTypeText = (type) => {
		switch (type) {
			case 'single_choice':
				return '单选题'
			case 'multiple_choice':
				return '多选题'
			default:
				return type || '未知'
		}
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