'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)

	const db = uniCloud.database();
	const res = db.collection("prize").get()
	
	console.log(res);

	//返回数据给客户端
	return resreturn event
};
