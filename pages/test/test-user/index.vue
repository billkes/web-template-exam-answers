<template>
	<BaseTable :api-method="apiGetUserList" @add="handleAdd">
		<template #header>
			<uni-tr>
				<uni-th width="150" align="center">姓名</uni-th>
				<uni-th width="180" align="center">身份证号</uni-th>
				<uni-th width="120" align="center">手机号</uni-th>
				<uni-th width="150" align="center">创建时间</uni-th>
				<uni-th width="120" align="center">操作</uni-th>
			</uni-tr>
		</template>

		<template #body="{ data }">
			<uni-tr v-for="item in data" :key="item._id">
				<uni-td align="center">{{ item.name }}</uni-td>
				<uni-td align="center">{{ item.id_card }}</uni-td>
				<uni-td align="center">{{ item.phone }}</uni-td>
				<uni-td align="center">{{ formatTime(item.create_time) }}</uni-td>
				<uni-td align="center">
					<view class="action-buttons">
						<uni-icons class="btn" type="compose" size="20" @click="handleEdit(item)"></uni-icons>
						<uni-icons class="btn" type="trash" size="20" @click="handleDelete(item._id)"></uni-icons>
					</view>
				</uni-td>
			</uni-tr>
		</template>
	</BaseTable>

	<FormDialog ref="formDialog" title="用户表单" :form-rules="rules" :initial-data="initialFormData" @submit="submitForm">
		<uni-forms ref="form" :model="formData" :rules="rules">
			<uni-forms-item label="姓名" name="name">
				<uni-easyinput v-model="formData.name" placeholder="请输入姓名" />
			</uni-forms-item>
			<uni-forms-item label="身份证号" name="id_card">
				<uni-easyinput v-model="formData.id_card" placeholder="请输入身份证号" />
			</uni-forms-item>
			<uni-forms-item label="手机号" name="phone">
				<uni-easyinput v-model="formData.phone" placeholder="请输入手机号" />
			</uni-forms-item>
			<uni-forms-item label="密码" name="pwd" v-if="!formData._id">
				<uni-easyinput type="password" v-model="formData.pwd" placeholder="请输入密码" />
			</uni-forms-item>
		</uni-forms>
	</FormDialog>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import BaseTable from '@/components/table/BaseTable.vue'
	import FormDialog from '@/components/table/FormDialog.vue'
	import {
		formatTime,
		commonRules
	} from '@/utils/tableUtil.js'
	import {
		useTable
	} from '@/composables/useTable'
	import {
		getUserList as apiGetUserList,
		addUser as apiAddUser,
		updateUser as apiUpdateUser,
		deleteUser as apiDeleteUser
	} from '@/api/testUser.js'

	const {
		tableData,
		loading,
		total,
		pageNum,
		pageSize,
		loadData,
		handlePageChange
	} = useTable(apiGetUserList)

	const formDialog = ref(null)
	const form = ref(null)
	const rules = commonRules
	const initialFormData = {
		_id: '',
		name: '',
		id_card: '',
		phone: '',
		pwd: ''
	}
	const formData = ref({
		...initialFormData
	})

	const handleAdd = () => {
		formData.value = {
			...initialFormData
		}
		formDialog.value.open()
	}

	const handleEdit = (item) => {
		formData.value = {
			...item
		}
		formDialog.value.open()
	}

	const handleDelete = async (id) => {
		// 删除逻辑
	}

	const submitForm = async (formData) => {
		try {
			let result
			if (formData._id) {
				result = await apiUpdateUser(formData)
			} else {
				result = await apiAddUser(formData)
			}

			if (result.code === 200) {
				uni.showToast({
					title: '操作成功',
					icon: 'success'
				})
				formDialog.value.close()
				loadData()
			} else {
				throw new Error(result.message)
			}
		} catch (e) {
			uni.showToast({
				title: e.message || '操作失败',
				icon: 'error'
			})
		}
	}
</script>