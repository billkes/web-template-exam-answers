# 执行任务

> 为高效工作，应严格按照步骤进行，以免返工

详看文件：
考生表：uniCloud-aliyun/database/exam-users.schema.json
系统用户表：uni_modules/uni-id-pages/uniCloud/database/uni-id-users.schema.json
测试页面：pages/test-register-login/test-register-login.vue
云函数：uniCloud-aliyun/cloudfunctions/billkes-exam-template/index.js

详看文档：
云对象（uni-id-co）：https://doc.dcloud.net.cn/uniCloud/uni-id/cloud-object.html
云函数综述：https://doc.dcloud.net.cn/uniCloud/cf-functions.html
普通云函数：https://doc.dcloud.net.cn/uniCloud/cf-callfunction.html
适配URL化：https://doc.dcloud.net.cn/uniCloud/uni-id/cloud-object.html#adapter-http

1. 修改云函数登录方法，参考注册时的适配URL化写法
2. 修改云函数获取用户信息方法，参考注册时的适配URL化写法