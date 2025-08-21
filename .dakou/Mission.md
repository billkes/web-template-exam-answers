# 执行任务

> 为高效工作，应严格按照步骤进行，以免返工

详看文件：
考生表：uniCloud-aliyun/database/exam-users.schema.json
系统用户表：uni_modules/uni-id-pages/uniCloud/database/uni-id-users.schema.json
测试页面：pages/test-register-login/test-register-login.vue
云函数：uniCloud-aliyun/cloudfunctions/billkes-exam-template/index.js

详看文档：
云对象（uni-id-co）：https://doc.dcloud.net.cn/uniCloud/uni-id/cloud-object.html

1. 编写云函数代码，添加动作：注册、登录、获取用户信息，实现代码
间接调用云对象中的对应方法

2. 开发最简易的测试页面，调用云函数测试动作
