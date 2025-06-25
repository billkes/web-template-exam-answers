<template>
	<view class="base-table-container">
		<view class="table-head">
			<button class='btn' size="mini" @click="handleAdd">新增</button>
			<button class='btn' size="mini" @click="loadData">刷新</button>
		</view>

		<uni-table ref="table" class="table-body" :loading="loading" border stripe>
			<slot name="header"></slot>
			<slot name="body" :data="tableData"></slot>
		</uni-table>

		<view class="pagination" v-if="showPagination">
			<uni-pagination show-icon :total="total" :page-size="pageSize" :current="pageNum"
				@change="handlePageChange" />
		</view>
	</view>
</template>

<script setup>
	import {
		onMounted,
		ref
	} from 'vue'

	const props = defineProps({
		apiMethod: Function,
		pageSize: {
			type: Number,
			default: 10
		},
		showPagination: {
			type: Boolean,
			default: true
		}
	})

	const emit = defineEmits(['add', 'refresh'])

	const tableData = ref([])
	const loading = ref(false)
	const total = ref(0)
	const pageNum = ref(1)

	const loadData = async (params = {}) => {
		loading.value = true
		try {
			const res = await props.apiMethod({
				pageNum: pageNum.value,
				pageSize: props.pageSize,
				...params
			})

			if (res.code === 200) {
				tableData.value = res.data.rows
				total.value = res.data.total
			} else {
				throw new Error(res.message)
			}
		} catch (e) {
			uni.showToast({
				title: e.message || '加载失败',
				icon: 'error'
			})
		} finally {
			loading.value = false
		}
	}

	const handlePageChange = (e) => {
		pageNum.value = e.current
		loadData()
	}

	const handleAdd = () => {
		emit('add')
	}

	defineExpose({
		loadData,
		tableData
	})

	onMounted(() => {
		loadData()
	})
</script>

<style lang="scss" scoped>
	.base-table-container {
		padding: 20rpx;

		.table-head {
			display: flex;
			flex-direction: row-reverse;

			.btn {
				width: max-content;
				margin: 0 0 0 6px;
			}
		}

		.table-body {
			margin-top: 10px;
		}

		.pagination {
			margin-top: 20rpx;
			display: flex;
			justify-content: flex-end;
		}
	}
</style>