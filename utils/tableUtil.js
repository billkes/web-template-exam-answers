import {
	dayjs
} from '@/uni_modules/iRainna-dayjs/js_sdk/dayjs.min.js'

export const formatTime = (time) => {
	return dayjs(time).format('YYYY-MM-DD HH:mm')
}

export const commonRules = {
	name: {
		rules: [{
			required: true,
			errorMessage: '请输入姓名'
		}]
	},
	id_card: {
		rules: [{
				required: true,
				errorMessage: '请输入身份证号'
			},
			{
				pattern: /^\d{17}[\dXx]$/,
				errorMessage: '身份证号格式不正确'
			}
		]
	},
	phone: {
		rules: [{
				required: true,
				errorMessage: '请输入手机号'
			},
			{
				pattern: /^1[3-9]\d{9}$/,
				errorMessage: '手机号格式不正确'
			}
		]
	},
	pwd: {
		rules: [{
				required: true,
				errorMessage: '请输入密码'
			},
			{
				minLength: 6,
				errorMessage: '密码长度不能少于6位'
			}
		]
	}
}