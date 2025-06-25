import {
	ref
} from 'vue'

export function useTable(apiMethod, options = {}) {
	const tableData = ref([])
	const loading = ref(false)
	const total = ref(0)
	const pageNum = ref(1)
	const pageSize = ref(options.pageSize || 10)

	const loadData = async (params = {}) => {
		loading.value = true
		try {
			const res = await apiMethod({
				pageNum: pageNum.value,
				pageSize: pageSize.value,
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

	return {
		tableData,
		loading,
		total,
		pageNum,
		pageSize,
		loadData,
		handlePageChange
	}
}