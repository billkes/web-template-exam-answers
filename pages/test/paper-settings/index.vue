<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="filter-item">
				<uni-easyinput class="item-content inp" suffixIcon="search" clearable v-model="searchName"
					placeholder="请输入姓名" @iconClick="handleSearch"></uni-easyinput>
			</view>
			<button class="filter-add-btn" type="primary" @click="handleAdd">新增</button>
		</view>

		<!-- 表格 -->
		<uni-table border stripe emptyText="暂无数据">
			<uni-tr>
				<uni-th width="80" align="center">序号</uni-th>
				<uni-th width="120" align="center">考试编号</uni-th>
				<uni-th width="150" align="center">试卷名称</uni-th>
				<uni-th width="120" align="center">考试时间</uni-th>
				<uni-th width="100" align="center">考试状态</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item, index) in tableData" :key="item._id">
				<uni-td align="center">{{ (pageNum - 1) * pageSize + index + 1 }}</uni-td>
				<uni-td align="center">{{ item.code }}</uni-td>
				<uni-td align="center">{{ item.name }}</uni-td>
				<uni-td align="center">
					{{ myFormatTime(item.exam_time1) }} 至 {{ myFormatTime(item.exam_time2) }}
				</uni-td>
				<uni-td align="center">
					<uni-tag :text="getStatusText(item.status)" :type="getStatusType(item.status)" />
				</uni-td>
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
				@confirm="submitForm" :style="{width: '1000rpx', maxHeight: '80vh'}">
				<scroll-view scroll-y style="height: 60vh; padding: 20rpx;">
					<uni-forms ref="form" :modelValue="formData" :rules="rules">
						<uni-forms-item label="考试编号" name="code" required>
							<uni-easyinput v-model="formData.code" placeholder="请输入考试编号" />
						</uni-forms-item>
						<uni-forms-item label="试卷名称" name="name" required>
							<uni-easyinput v-model="formData.name" placeholder="请输入试卷名称" />
						</uni-forms-item>
						<uni-forms-item label="考试封面">
							<uni-file-picker :modelValue="urlArrToFileArr(formData.url)" fileMediatype="image"
								mode="grid" :limit="1" :del-icon="true" :auto-upload="true" @success="uploadSuccess"
								@fail="uploadFail" @delete="deleteFile" />
						</uni-forms-item>
						<uni-forms-item label="考试人员" required>
							<SelectTestUser :modelValue="formData.inspection_personnel" @change="handleUserChange" />
						</uni-forms-item>
						<uni-forms-item label="考试时间" required>
							<view class="time-picker">
								<uni-datetime-picker v-model="formData.exam_time1" type="datetime" placeholder="开始时间" />
								<text>至</text>
								<uni-datetime-picker v-model="formData.exam_time2" type="datetime" placeholder="结束时间" />
							</view>
						</uni-forms-item>

						<uni-forms-item label="考试限时(分钟)" name="test_time" required>
							<uni-number-box v-model="formData.test_time" :min="1" />
						</uni-forms-item>

						<uni-forms-item label="单选题数量" name="single_choice" required>
							<uni-number-box v-model="formData.single_choice" :min="0" />
						</uni-forms-item>

						<uni-forms-item label="多选题数量" name="multiple_choice" required>
							<uni-number-box v-model="formData.multiple_choice" :min="0" />
						</uni-forms-item>

						<uni-forms-item label="单选题分数" name="single_choice_score" required>
							<uni-number-box v-model="formData.single_choice_score" :min="0" :step="0.5" />
						</uni-forms-item>

						<uni-forms-item label="多选题分数" name="multiple_choice_score" required>
							<uni-number-box v-model="formData.multiple_choice_score" :min="0" :step="0.5" />
						</uni-forms-item>

						<uni-forms-item label="及格分数" name="passing_grade" required>
							<uni-number-box v-model="formData.passing_grade" :min="0" :step="0.5" />
						</uni-forms-item>

						<uni-forms-item label="考试状态" name="status" required>
							<uni-data-select v-model="formData.status" :localdata="statusOptions" />
						</uni-forms-item>
					</uni-forms>
				</scroll-view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script setup>
	import SelectTestUser from '@/components/table/SelectTestUser.vue'
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		getPaperSettingsList,
		addPaperSettings,
		updatePaperSettings,
		deletePaperSettings
	} from '@/api/testPaperSettings.js'
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
	const formTitle = ref('新增试卷设置')
	const formData = ref({
		code: '',
		name: '',
		url: [],
		inspection_personnel: [],
		inspection_personnel_name: [],
		exam_time1: null,
		exam_time2: null,
		test_time: 60,
		single_choice: 0,
		multiple_choice: 0,
		single_choice_score: 1,
		multiple_choice_score: 2,
		passing_grade: 60,
		status: 'draft'
	})
	const isEdit = ref(false)

	// 状态选项
	const statusOptions = [{
			value: 'draft',
			text: '草稿'
		},
		{
			value: 'published',
			text: '已发布'
		},
		{
			value: 'archived',
			text: '已归档'
		}
	]

	// 表单验证规则
	const rules = {
		code: {
			rules: [{
					required: true,
					errorMessage: '请输入考试编号'
				},
				{
					maxLength: 255,
					errorMessage: '考试编号长度不能超过255个字符'
				}
			]
		},
		name: {
			rules: [{
					required: true,
					errorMessage: '请输入试卷名称'
				},
				{
					maxLength: 255,
					errorMessage: '试卷名称长度不能超过255个字符'
				}
			]
		},
		test_time: {
			rules: [{
					required: true,
					errorMessage: '请输入考试限时'
				},
				{
					minimum: 1,
					errorMessage: '考试限时不能少于1分钟'
				}
			]
		},
		single_choice: {
			rules: [{
					required: true,
					errorMessage: '请输入单选题数量'
				},
				{
					minimum: 0,
					errorMessage: '单选题数量不能为负数'
				}
			]
		},
		multiple_choice: {
			rules: [{
					required: true,
					errorMessage: '请输入多选题数量'
				},
				{
					minimum: 0,
					errorMessage: '多选题数量不能为负数'
				}
			]
		},
		single_choice_score: {
			rules: [{
					required: true,
					errorMessage: '请输入单选题分数'
				},
				{
					minimum: 0,
					errorMessage: '单选题分数不能为负数'
				}
			]
		},
		multiple_choice_score: {
			rules: [{
					required: true,
					errorMessage: '请输入多选题分数'
				},
				{
					minimum: 0,
					errorMessage: '多选题分数不能为负数'
				}
			]
		},
		passing_grade: {
			rules: [{
					required: true,
					errorMessage: '请输入及格分数'
				},
				{
					minimum: 0,
					errorMessage: '及格分数不能为负数'
				}
			]
		},
		status: {
			rules: [{
				required: true,
				errorMessage: '请选择考试状态'
			}]
		}
	}

	/**
	 * 用户改变
	 */
	const handleUserChange = (userList) => {
		console.log(userList);
		formData.value.inspection_personnel = userList.map(o => o._id)
		formData.value.inspection_personnel_name = userList.map(o => o.name)
	}

	// 初始化加载数据
	onMounted(() => {
		fetchData()
	})

	const urlArrToFileArr = (urlList) => {
		if (!Array.isArray(urlList)) {
			return []
		}
		return urlList.map(u => {
			const uList = u.split('.')
			if (!uList.length) {
				return {
					name: "none.png",
					extname: "",
					url: '',
				}
			}
			const extname = uList[uList.length - 1]
			return {
				name: u,
				extname,
				url: u,
			}
		})
	}

	// 上传成功回调
	const uploadSuccess = (e) => {
		console.log('上传成功', e);
		uni.showToast({
			title: '上传成功',
			icon: 'success'
		});
		formData.value.url = e.tempFilePaths; // 更新为上传后的文件路径
	}

	// 上传失败回调
	const uploadFail = (e) => {
		console.error('上传失败', e);
		uni.showToast({
			title: '上传失败',
			icon: 'none'
		});
	}

	// 删除文件回调
	const deleteFile = (e) => {
		console.log('删除文件', e);
		formData.value.url = []; // 清空文件路径
	}

	// 获取数据
	const fetchData = async () => {
		const params = {
			pageNum: pageNum.value,
			pageSize: pageSize.value,
			name: searchName.value
		}

		try {
			const res = await getPaperSettingsList(params)
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
		formTitle.value = '新增试卷设置'
		isEdit.value = false
		formData.value = {
			code: '',
			name: '',
			url: [],
			inspection_personnel: [],
			inspection_personnel_name: [],
			exam_time1: null,
			exam_time2: null,
			test_time: 60,
			single_choice: 0,
			multiple_choice: 0,
			single_choice_score: 1,
			multiple_choice_score: 2,
			passing_grade: 60,
			status: 'draft'
		}
		formPopup.value.open()
	}

	// 编辑
	const handleEdit = (row) => {
		formTitle.value = '编辑试卷设置'
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
			content: '确定要删除该试卷设置吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						const result = await deletePaperSettings(id)
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

			// 计算总分
			formData.value.total_score =
				(formData.value.single_choice * formData.value.single_choice_score) +
				(formData.value.multiple_choice * formData.value.multiple_choice_score)

			let result
			if (isEdit.value) {
				result = await updatePaperSettings(formData.value)
			} else {
				result = await addPaperSettings(formData.value)
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

	// 获取状态文本
	const getStatusText = (status) => {
		const option = statusOptions.find(item => item.value === status)
		return option ? option.text : status
	}

	// 获取状态标签类型
	const getStatusType = (status) => {
		switch (status) {
			case 'draft':
				return 'default'
			case 'published':
				return 'primary'
			case 'archived':
				return 'warning'
			default:
				return 'default'
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