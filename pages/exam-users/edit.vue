<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="user_id" label="系统用户" required>
        <uni-data-select placeholder="请选择系统用户" collection="uni-id-users" field="nickname as text, _id as value" v-model="formData.user_id"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="username" label="用户名" required>
        <uni-easyinput placeholder="请输入用户名" v-model="formData.username"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="email" label="邮箱">
        <uni-easyinput placeholder="请输入邮箱地址" v-model="formData.email"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="nickname" label="昵称">
        <uni-easyinput placeholder="请输入昵称" v-model="formData.nickname"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="avatar" label="头像">
        <billkes-form-avatar v-model="formData.avatar"></billkes-form-avatar>
      </uni-forms-item>
      <uni-forms-item name="status" label="状态">
        <uni-data-select placeholder="请选择用户状态" v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-select>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../js_sdk/validator/exam-users.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'exam-users';

  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key]
      }
    }
    return result
  }

  

  export default {
    data() {
      let formData = {
        "user_id": "",
        "username": "",
        "email": "",
        "nickname": "",
        "avatar": "",
        "status": 1
      }
      return {
        formData,
        formOptions: {
          "status_localdata": [
            {
              "value": 0,
              "text": "禁用"
            },
            {
              "value": 1,
              "text": "启用"
            }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onLoad(e) {
      if (e.id) {
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      
      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
          return this.submitForm(res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
          uni.showToast({
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field("user_id,username,email,nickname,avatar,status").get().then((res) => {
          const data = res.result.data[0]
          if (data) {
            this.formData = data
            
          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      }
    }
  }
</script>
