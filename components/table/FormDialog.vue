<template>
	<uni-popup ref="formPopup" type="dialog">
		<uni-popup-dialog mode="form" :title="title" @confirm="submitForm" @close="closeForm">
			<slot :formData="formData"></slot>
		</uni-popup-dialog>
	</uni-popup>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue'

	const props = defineProps({
		title: String,
		formRules: Object,
		initialData: Object
	})

	const emit = defineEmits(['submit', 'close'])

	const formPopup = ref(null)
	const form = ref(null)
	const formData = reactive({
		...props.initialData
	})

	const open = () => {
		formPopup.value.open()
	}

	const close = () => {
		formPopup.value.close()
	}

	const resetForm = () => {
		Object.keys(formData).forEach(key => {
			formData[key] = props.initialData[key] || ''
		})
	}

	const submitForm = async () => {
		try {
			await form.value.validate()
			emit('submit', formData)
		} catch (e) {
			uni.showToast({
				title: e.message || '表单验证失败',
				icon: 'error'
			})
			throw e
		}
	}

	const closeForm = () => {
		emit('close')
		close()
	}

	defineExpose({
		open,
		close,
		resetForm,
		formData
	})
</script>