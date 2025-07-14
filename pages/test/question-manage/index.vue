<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-easyinput class="item-content inp" suffixIcon="search" clearable v-model="searchContent"
					placeholder="请输入题目内容" @iconClick="handleSearch"></uni-easyinput>
			</view>
			<view class="filter-item">
				<uni-data-select class="item-content" v-model="searchType" :localdata="questionTypes"
					placeholder="题目类型" />
			</view>
			<view class="filter-item">
				<uni-data-select class="item-content" v-model="searchDifficulty" :localdata="difficultyLevels"
					placeholder="难度" />
			</view>
			<button class="filter-add-btn" type="primary" @click="handleAdd">新增</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="150" align="center">题目内容</uni-th>
				<uni-th width="100" align="center">题目类型</uni-th>
				<uni-th width="80" align="center">分值</uni-th>
				<uni-th width="80" align="center">难度</uni-th>
				<uni-th width="180" align="center">创建时间</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.content }}</uni-td>
				<uni-td align="center">{{ getQuestionTypeText(item.type) }}</uni-td>
				<uni-td align="center">{{ item.score }}</uni-td>
				<uni-td align="center">{{ item.difficulty }}</uni-td>
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
					<uni-forms-item label="题目类型" name="type" required>
						<uni-data-select v-model="formData.type" :localdata="questionTypes" />
					</uni-forms-item>
					<uni-forms-item label="题目内容" name="content" required>
						<uni-easyinput type="textarea" v-model="formData.content" placeholder="请输入题目内容" />
					</uni-forms-item>
					<uni-forms-item label="选项" v-if="formData.type !== 'fill_blank'" required>
						<view class="option-item" v-for="(option, idx) in formData.options" :key="idx">
							<uni-easyinput v-model="formData.options[idx]" :placeholder="'请输入选项' + (idx + 1)" />
							<button size="mini" type="warn" @click="removeOption(idx)"
								v-if="formData.options.length > 1">删除</button>
						</view>
						<button type="default" size="mini" @click="addOption">添加选项</button>
					</uni-forms-item>
					<uni-forms-item label="正确答案" name="answer" required>
						<uni-easyinput v-model="formData.answer"
							:placeholder="formData.type === 'single_choice' ? '请输入正确答案(如A)' : '请输入正确答案(多个答案用逗号分隔,如A,B)'" />
					</uni-forms-item>
					<uni-forms-item label="分值" name="score" required>
						<uni-number-box v-model="formData.score" :min="0" :step="0.5" />
					</uni-forms-item>
					<uni-forms-item label="难度" name="difficulty" required>
						<uni-number-box v-model="formData.difficulty" :min="1" :max="5" />
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
		getQuestionList,
		addQuestion,
		updateQuestion,
		deleteQuestion
	} from '@/api/testQuestions.js'
	import {
		formatTime
	} from '@/utils/tableUtil.js'

	// 表格数据
	const tableData = ref([])
	const total = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(10)
	const searchContent = ref('')
	const searchType = ref('')
	const searchDifficulty = ref('')

	// 题目类型选项
	const questionTypes = [{
			value: 'single_choice',
			text: '单选题'
		},
		{
			value: 'multiple_choice',
			text: '多选题'
		}
	]

	// 难度级别
	const difficultyLevels = [{
			value: 1,
			text: '1星'
		},
		{
			value: 2,
			text: '2星'
		},
		{
			value: 3,
			text: '3星'
		},
		{
			value: 4,
			text: '4星'
		},
		{
			value: 5,
			text: '5星'
		}
	]

	// 表单相关
	const formPopup = ref(null)
	const form = ref(null)
	const formTitle = ref('新增题目')
	const formData = ref({
		type: 'single_choice',
		content: '',
		options: ['', ''],
		answer: '',
		score: 1,
		difficulty: 3
	})
	const isEdit = ref(false)

	// 表单验证规则
	const rules = {
		type: {
			rules: [{
				required: true,
				errorMessage: '请选择题目类型'
			}]
		},
		content: {
			rules: [{
				required: true,
				errorMessage: '请输入题目内容'
			}]
		},
		answer: {
			rules: [{
				required: true,
				errorMessage: '请输入正确答案'
			}]
		},
		score: {
			rules: [{
					required: true,
					errorMessage: '请输入分值'
				},
				{
					minimum: 0,
					errorMessage: '分值不能为负数'
				}
			]
		},
		difficulty: {
			rules: [{
					required: true,
					errorMessage: '请选择难度'
				},
				{
					minimum: 1,
					maximum: 5,
					errorMessage: '难度等级为1-5'
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
			content: searchContent.value,
			type: searchType.value,
			difficulty: searchDifficulty.value
		}

		try {
			const res = await getQuestionList(params)
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

	// 添加选项
	const addOption = () => {
		formData.value.options.push('')
	}

	// 删除选项
	const removeOption = (index) => {
		formData.value.options.splice(index, 1)
	}

	// 新增
	const handleAdd = () => {
		formTitle.value = '新增题目'
		isEdit.value = false
		formData.value = {
			type: 'single_choice',
			content: '',
			options: ['', ''],
			answer: '',
			score: 1,
			difficulty: 3
		}
		formPopup.value.open()
	}

	// 编辑
	const handleEdit = (row) => {
		formTitle.value = '编辑题目'
		isEdit.value = true
		formData.value = {
			...row,
			options: [...row.options] || ['', '']
		}
		formPopup.value.open()
	}

	// 删除
	const handleDelete = async (id) => {
		uni.showModal({
			title: '提示',
			content: '确定要删除该题目吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await deleteQuestion({
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
				result = await updateQuestion(formData.value)
			} else {
				result = await addQuestion(formData.value)
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
		return formatTime(timestamp, 'YYYY-MM-DD hh:mm')
	}

	// 获取题目类型文本
	const getQuestionTypeText = (type) => {
		const option = questionTypes.find(item => item.value === type)
		return option ? option.text : type
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