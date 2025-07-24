<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-easyinput class="item-content inp" suffixIcon="search" clearable v-model="searchKeyword"
					placeholder="请输入题目内容或类型" @iconClick="handleSearch"></uni-easyinput>
			</view>
			<button class="filter-add-btn" type="primary" @click="handleAdd">新增</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="150" align="center">题目内容</uni-th>
				<uni-th width="100" align="center">题目类型</uni-th>
				<uni-th width="120" align="center">所属考试</uni-th>
				<uni-th width="100" align="center">分值</uni-th>
				<uni-th width="180" align="center">创建时间</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.content }}</uni-td>
				<uni-td align="center">{{ formatQuestionType(item.type) }}</uni-td>
				<uni-td align="center">{{ item.exam_name }}</uni-td>
				<uni-td align="center">{{ item.score }}</uni-td>
				<uni-td align="center">{{ myFormatTime(item.create_time) }}</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
						<button type="primary" size="mini" @click="handleEdit(item._id)">编辑</button>
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
					<uni-forms-item label="题目内容" name="content">
						<uni-easyinput type="textarea" v-model="formData.content" placeholder="请输入题目内容" />
					</uni-forms-item>
					<uni-forms-item label="题目类型" name="type">
						<uni-data-select v-model="formData.type" :localdata="questionTypes"
							placeholder="请选择题目类型"></uni-data-select>
					</uni-forms-item>
					<uni-forms-item label="所属考试ID" name="exam_id">
						<uni-easyinput v-model="formData.exam_id" placeholder="请输入所属考试ID" />
					</uni-forms-item>
					<uni-forms-item label="分值" name="score">
						<uni-easyinput type="number" v-model="formData.score" placeholder="请输入分值" />
					</uni-forms-item>
					<uni-forms-item label="选项(JSON)" name="options"
						v-if="formData.type === 'single' || formData.type === 'multiple'">
						<uni-easyinput type="textarea" v-model="formData.options" placeholder="请输入选项(JSON格式)" />
					</uni-forms-item>
					<uni-forms-item label="正确答案" name="answer">
						<uni-easyinput v-model="formData.answer" placeholder="请输入正确答案" />
					</uni-forms-item>
					<uni-forms-item label="答案解析" name="analysis">
						<uni-easyinput type="textarea" v-model="formData.analysis" placeholder="请输入答案解析" />
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
		createQuestion,
		updateQuestion,
		deleteQuestion,
		getQuestionList,
		getQuestion
	} from '@/api/appx-template-exam-questions.js'
	import {
		formatTime
	} from '@/utils/tableUtil.js'

	// 表格数据
	const tableData = ref([])
	const total = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(10)
	const searchKeyword = ref('')

	// 题目类型
	const questionTypes = ref([{
			value: 'single',
			text: '单选题'
		},
		{
			value: 'multiple',
			text: '多选题'
		},
		{
			value: 'judge',
			text: '判断题'
		},
		{
			value: 'fill',
			text: '填空题'
		},
		{
			value: 'answer',
			text: '问答题'
		}
	])

	// 表单相关
	const formPopup = ref(null)
	const form = ref(null)
	const formTitle = ref('新增题目')
	const formData = ref({
		content: '',
		type: 'single',
		exam_id: '',
		score: 5,
		options: '[]',
		answer: '',
		analysis: ''
	})
	const isEdit = ref(false)

	// 表单验证规则
	const rules = {
		content: {
			rules: [{
				required: true,
				errorMessage: '请输入题目内容'
			}]
		},
		type: {
			rules: [{
				required: true,
				errorMessage: '请选择题目类型'
			}]
		},
		exam_id: {
			rules: [{
				required: true,
				errorMessage: '请输入所属考试ID'
			}]
		},
		score: {
			rules: [{
				required: true,
				errorMessage: '请输入分值'
			}, {
				pattern: '^[0-9]+(\\.[0-9]{1,2})?$',
				errorMessage: '请输入正确的分数格式'
			}]
		},
		options: {
			rules: [{
				validateFunction: (rule, value, data, callback) => {
					if ((formData.value.type === 'single' || formData.value.type === 'multiple') && !
						value) {
						callback('请输入选项')
					} else {
						try {
							JSON.parse(value)
							callback()
						} catch (e) {
							callback('选项必须是有效的JSON格式')
						}
					}
				}
			}]
		},
		answer: {
			rules: [{
				required: true,
				errorMessage: '请输入正确答案'
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

	// 新增
	const handleAdd = () => {
		formTitle.value = '新增题目'
		isEdit.value = false
		formData.value = {
			content: '',
			type: 'single',
			exam_id: '',
			score: 5,
			options: '[]',
			answer: '',
			analysis: ''
		}
		formPopup.value.open()
	}

	// 编辑
	const handleEdit = async (id) => {
		try {
			const res = await getQuestion({
				id
			})
			if (res.code === 200) {
				formTitle.value = '编辑题目'
				isEdit.value = true
				formData.value = {
					...res.data,
					options: JSON.stringify(res.data.options || [])
				}
				formPopup.value.open()
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.showToast({
				title: '获取题目详情失败',
				icon: 'none'
			})
		}
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

			// 处理options字段，尝试转换为JSON
			if (formData.value.type === 'single' || formData.value.type === 'multiple') {
				try {
					formData.value.options = JSON.parse(formData.value.options)
				} catch (e) {
					uni.showToast({
						title: '选项必须是有效的JSON格式',
						icon: 'none'
					})
					return
				}
			} else {
				formData.value.options = []
			}

			let result
			if (isEdit.value) {
				result = await updateQuestion(formData.value)
			} else {
				result = await createQuestion(formData.value)
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

	// 格式化题目类型
	const formatQuestionType = (type) => {
		const typeMap = {
			'single': '单选题',
			'multiple': '多选题',
			'judge': '判断题',
			'fill': '填空题',
			'answer': '问答题'
		}
		return typeMap[type] || type
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
</style>