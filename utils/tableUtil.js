import {
	dayjs
} from '@/uni_modules/iRainna-dayjs/js_sdk/dayjs.min.js'

export const formatTime = (time, formatStr) => {
	return dayjs(time).format(formatStr || 'YYYY-MM-DD HH:mm')
}