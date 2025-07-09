<template>
	<!-- 表单控件展示区域 -->
	<view class="form-control" @click="showModal = true">
		<view v-if="displayNames.length === 0" class="placeholder">请选择用户</view>
		<view v-else class="selected-content">
			<text v-for="(name, index) in displayNames" :key="index" class="selected-tag">
				{{ name }}
			</text>
		</view>
		<uni-icons type="arrowdown" size="16" color="#999"></uni-icons>
	</view>

	<!-- 选择用户弹窗 -->
	<uni-popup ref="popup" type="center" :mask-click="false" :is-mask-click="false">
		<view class="select-user-modal">
			<view class="modal-header">
				<text class="modal-title">选择用户</text>
				<uni-icons type="close" size="20" @click="closeModal"></uni-icons>
			</view>

			<view class="search-bar">
				<uni-search-bar v-model="searchName" placeholder="请输入姓名" @confirm="handleSearch" @clear="handleClear"
					radius="100" />
			</view>

			<view class="content-wrapper">
				<!-- 已选用户 -->
				<view class="selected-section">
					<view class="section-title">已选用户 ({{ selectedIds.length }})</view>
					<scroll-view scroll-y class="user-list">
						<view v-for="user in selectedUsers" :key="user._id" class="user-item selected"
							@click="toggleSelect(user)">
							<text>{{ user.name }}</text>
							<text>{{ user.id_card }}</text>
						</view>
						<view v-if="selectedUsers.length === 0" class="empty-tip">暂无已选用户</view>
					</scroll-view>
				</view>

				<!-- 所有用户 -->
				<view class="all-section">
					<view class="section-title">所有用户 ({{ total }})</view>
					<scroll-view scroll-y class="user-list">
						<view v-for="user in userList" :key="user._id" class="user-item"
							:class="{ selected: isSelected(user) }" @click="toggleSelect(user)">
							<text>{{ user.name }}</text>
							<text>{{ user.id_card }}</text>
						</view>
						<view v-if="userList.length === 0" class="empty-tip">暂无用户数据</view>
					</scroll-view>

					<uni-pagination v-if="total > pageSize" :total="total" :current="pageNum" :pageSize="pageSize"
						@change="handlePageChange" />
				</view>
			</view>

			<view class="modal-footer">
				<button type="default" class="footer-btn" @click="closeModal">取消</button>
				<button type="primary" class="footer-btn" @click="handleConfirm">确定</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		onMounted,
		defineEmits,
		defineProps,
		watch,
		computed
	} from 'vue'
	import {
		getUserList
	} from '@/api/testUser.js'

	const props = defineProps({
		// 已选用户ID数组
		modelValue: {
			type: Array,
			default: () => []
		},
		// 是否多选
		multiple: {
			type: Boolean,
			default: true
		}
	})

	const emit = defineEmits(['update:modelValue', 'change'])

	// 弹窗控制
	const popup = ref(null)
	const showModal = ref(false)

	// 用户列表数据
	const userList = ref([])
	const allUsers = ref([]) // 缓存所有用户数据
	const selectedIds = ref([]) // 存储选中的用户ID
	const selectedUsers = ref([]) // 存储选中的完整用户对象
	const total = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(10)
	const searchName = ref('')

	// 计算属性：显示的名称列表
	const displayNames = computed(() => {
		return selectedUsers.value.map(user => user.name)
	})

	// 根据selectedIds更新selectedUsers
	const updateSelectedUsers = () => {
		if (allUsers.value.length > 0) {
			selectedUsers.value = allUsers.value.filter(user =>
				selectedIds.value.includes(user._id)
			)
		}
	}

	// 初始化加载数据
	const fetchData = async () => {
		const params = {
			pageNum: pageNum.value,
			pageSize: pageSize.value,
			name: searchName.value
		}

		try {
			const res = await getUserList(params)
			if (res.code === 200) {
				userList.value = res.data.rows
				total.value = res.data.total

				// 缓存所有用户数据
				if (pageNum.value === 1) {
					allUsers.value = res.data.rows
				} else {
					allUsers.value = [...allUsers.value, ...res.data.rows]
				}

				// 数据加载完成后更新选中用户显示
				updateSelectedUsers()
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

	// 监听props.modelValue变化（外部传入的_id数组）
	watch(() => props.modelValue, (newVal) => {
		selectedIds.value = [...newVal]
		// 如果还没有加载过数据，或者搜索条件变化时才重新加载
		if (allUsers.value.length === 0 || searchName.value) {
			fetchData()
		}
	}, {
		immediate: true
	})

	// 监听showModal变化
	watch(showModal, (val) => {
		if (val) {
			popup.value.open()
			// 如果还没有加载过数据，或者搜索条件变化时才重新加载
			if (allUsers.value.length === 0 || searchName.value) {
				fetchData()
			}
		} else {
			popup.value.close()
		}
	})

	// 搜索
	const handleSearch = () => {
		pageNum.value = 1
		fetchData()
	}

	// 清空搜索
	const handleClear = () => {
		searchName.value = ''
		handleSearch()
	}

	// 分页变化
	const handlePageChange = (e) => {
		pageNum.value = e.current
		fetchData()
	}

	// 检查是否已选中
	const isSelected = (user) => {
		return selectedIds.value.includes(user._id)
	}

	// 切换选择状态
	const toggleSelect = (user) => {
		if (isSelected(user)) {
			// 取消选择
			selectedIds.value = selectedIds.value.filter(id => id !== user._id)
		} else {
			// 选择
			if (!props.multiple) {
				selectedIds.value = [user._id]
			} else {
				selectedIds.value = [...selectedIds.value, user._id]
			}
		}
		updateSelectedUsers()
	}

	// 关闭弹窗
	const closeModal = () => {
		showModal.value = false
	}

	// 确定选择
	const handleConfirm = () => {
		emit('update:modelValue', selectedIds.value)
		emit('change', selectedUsers.value)
		closeModal()
	}
</script>

<style scoped>
	/* 表单控件样式 */
	.form-control {
		padding: 12rpx 24rpx;
		border: 1px solid #e5e5e5;
		border-radius: 8rpx;
		min-height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #fff;
	}

	.form-control .placeholder {
		color: #999;
		font-size: 28rpx;
	}

	.selected-content {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.selected-tag {
		background-color: #f0f9ff;
		color: #1890ff;
		padding: 4rpx 12rpx;
		border-radius: 4rpx;
		font-size: 24rpx;
	}

	/* 弹窗样式 */
	.select-user-modal {
		width: 700rpx;
		max-height: 80vh;
		background-color: #fff;
		border-radius: 16rpx;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		padding: 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #f0f0f0;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.search-bar {
		padding: 0 24rpx 24rpx;
	}

	.content-wrapper {
		flex: 1;
		display: flex;
		min-height: 400rpx;
		border-top: 1px solid #f0f0f0;
		border-bottom: 1px solid #f0f0f0;
	}

	.selected-section,
	.all-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		border-right: 1px solid #f0f0f0;
	}

	.all-section {
		border-right: none;
	}

	.section-title {
		padding: 16rpx;
		background-color: #f5f5f5;
		font-weight: bold;
		text-align: center;
		font-size: 28rpx;
	}

	.user-list {
		flex: 1;
		padding: 12rpx;
		overflow-y: auto;
	}

	.user-item {
		padding: 16rpx;
		margin-bottom: 12rpx;
		border: 1px solid #eee;
		border-radius: 8rpx;
		display: flex;
		flex-direction: column;
	}

	.user-item.selected {
		background-color: #e6f7ff;
		border-color: #91d5ff;
	}

	.user-item text:first-child {
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.user-item text:last-child {
		font-size: 24rpx;
		color: #666;
	}

	.empty-tip {
		padding: 24rpx;
		text-align: center;
		color: #999;
		font-size: 26rpx;
	}

	.modal-footer {
		padding: 16rpx;
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
	}

	.footer-btn {
		min-width: 120rpx;
		margin: 0;
	}
</style>