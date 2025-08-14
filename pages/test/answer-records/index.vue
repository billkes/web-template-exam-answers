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
				<uni-th width="200" align="center">题目内容</uni-th>
				<uni-th width="80" align="center">得分</uni-th>
				<uni-th width="100" align="center">是否正确</uni-th>
				<uni-th width="180" align="center">答题时间</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.user_name || item.user_id }}</uni-td>
				<uni-td align="center">{{ item.exam_name || item.paper_id }}</uni-td>
				<uni-td align="center">{{ item.question_content || item.question_id }}</uni-td>
				<uni-td align="center">{{ item.score }}</uni-td>
				<uni-td align="center">
					<text :style="{ color: Number(item.is_correct) === 1 ? '#52c41a' : '#ff4d4f' }">
						{{ Number(item.is_correct) === 1 ? '正确' : '错误' }}
					</text>
				</uni-td>
				<uni-td align="center">{{ myFormatTime(item.answer_time || item.create_time) }}</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
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
					<uni-forms-item label="考生" name="user_id">
						<uni-data-select v-model="formData.user_id" :localdata="userList"
							placeholder="请选择考生"></uni-data-select>
					</uni-forms-item>
					<uni-forms-item label="试卷" name="paper_id">
						<uni-data-select v-model="formData.paper_id" :localdata="examList"
							placeholder="请选择试卷"></uni-data-select>
					</uni-forms-item>
					<uni-forms-item label="题目" name="question_id">
						<uni-data-select v-model="formData.question_id" :localdata="questionList"
							placeholder="请选择题目"></uni-data-select>
					</uni-forms-item>
					<uni-forms-item label="得分" name="score">
						<uni-easyinput type="number" v-model="formData.score" placeholder="请输入得分" />
					</uni-forms-item>
					<uni-forms-item label="是否正确" name="is_correct">
						<uni-data-checkbox v-model="formData.is_correct"
							:localdata="correctOptions"></uni-data-checkbox>
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
		getUserList
	} from '@/api/appx-template-exam-users.js'
	import {
		getQuestionList
	} from '@/api/appx-template-exam-questions.js'
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

	// 表单相关
	const formPopup = ref(null)
	const form = ref(null)
	const formTitle = ref('新增考试记录')
	const formData = ref({
		user_id: '',
		paper_id: '',
		question_id: '',
		score: 0,
		is_correct: 0,
	})
	const isEdit = ref(false)

	// 选择列表
	const userList = ref([])
	const examList = ref([])
	const questionList = ref([])
	const correctOptions = ref([{
			value: 1,
			text: '正确'
		},
		{
			value: 0,
			text: '错误'
		}
	])

	// 表单验证规则
	const rules = {
		user_id: {
			rules: [{
				required: true,
				errorMessage: '请选择考生'
			}]
		},
		paper_id: {
			rules: [{
				required: true,
				errorMessage: '请选择试卷'
			}]
		},
		question_id: {
			rules: [{
				required: true,
				errorMessage: '请选择题目'
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
	}

	// 初始化加载数据
	onMounted(() => {
		fetchData()
		loadSelectData()
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

	// 加载选择数据
	const loadSelectData = async () => {
		try {
			// 加载用户列表
			const userRes = await getUserList()
			if (userRes.code === 200) {
				userList.value = userRes.data.list.map(user => ({
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

			// 加载题目列表
			const questionRes = await getQuestionList()
			if (questionRes.code === 200) {
				questionList.value = questionRes.data.list.map(question => ({
					value: question._id,
					text: question.content.substring(0, 30) + (question.content.length > 30 ? '...' :
						'')
				}))
			}
		} catch (error) {
			console.error('加载选择数据失败:', error)
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
			question_id: '',
			score: 0,
			is_correct: 0,
		}
		formPopup.value.open()
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

			// 构建提交数据
			const submitData = {
				...formData.value,
				exam_id: formData.value.paper_id, // 将paper_id映射为exam_id
				is_correct: Number(formData.value.is_correct) === 1
			}

			let result
			if (isEdit.value) {
				result = await updateRecord(submitData)
			} else {
				result = await addRecord(submitData)
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