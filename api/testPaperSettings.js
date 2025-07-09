/**
 * 试卷设置管理API
 */

// 获取试卷设置列表
export function getPaperSettingsList(params) {
	return uniCloud.callFunction({
		name: 'testPaperSettings',
		data: {
			action: 'list',
			params
		}
	}).then(res => res.result);
}

// 获取试卷设置详情
export function getPaperSettingsDetail(id) {
	return uniCloud.callFunction({
		name: 'testPaperSettings',
		data: {
			action: 'detail',
			params: {
				id
			}
		}
	}).then(res => res.result);
}

// 添加试卷设置
export function addPaperSettings(data) {
	return uniCloud.callFunction({
		name: 'testPaperSettings',
		data: {
			action: 'add',
			params: data
		}
	}).then(res => res.result);
}

// 更新试卷设置
export function updatePaperSettings(data) {
	return uniCloud.callFunction({
		name: 'testPaperSettings',
		data: {
			action: 'update',
			params: data
		}
	}).then(res => res.result);
}

// 删除试卷设置
export function deletePaperSettings(id) {
	return uniCloud.callFunction({
		name: 'testPaperSettings',
		data: {
			action: 'delete',
			params: {
				id
			}
		}
	}).then(res => res.result);
}

export function batchDeletePaperSettings(id) {
	return uniCloud.callFunction({
		name: 'testPaperSettings',
		data: {
			action: 'batchDelete',
			params
		}
	}).then(res => res.result);
}