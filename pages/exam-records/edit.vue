<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="exam_schedules_id" label="试卷" required>
        <uni-data-select placeholder="请选择试卷" collection="exam-schedules" field="title as text, _id as value" v-model="formData.exam_schedules_id"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="user_id" label="用户" required>
        <uni-data-select placeholder="请选择用户" collection="uni-id-users" field="nickname as text, _id as value" v-model="formData.user_id"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="answers" label="答题记录">
        <billkes-form-exam-records-answers :multiple="true" v-model="formData.answers"></billkes-form-exam-records-answers>
      </uni-forms-item>
      <uni-forms-item name="total_full_mark" label="总满分">
        <uni-easyinput placeholder="自动计算" type="number" :disabled="true" v-model="formData.total_full_mark"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="total_score" label="总得分">
        <uni-easyinput placeholder="自动计算" type="number" :disabled="true" v-model="formData.total_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="time_spent" label="用时">
        <uni-easyinput placeholder="请输入用时（秒）" type="number" :disabled="true" v-model="formData.time_spent"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="status" label="状态">
        <uni-data-select placeholder="自动计算" :disabled="true" v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="started_date" label="开始时间">
        <uni-datetime-picker placeholder="自动计算" :disabled="true" return-type="timestamp" v-model="formData.started_date"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="finished_date" label="完成时间">
        <uni-datetime-picker placeholder="自动计算" :disabled="true" return-type="timestamp" v-model="formData.finished_date"></uni-datetime-picker>
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
  import { validator } from '../../js_sdk/validator/exam-records.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'exam-records';

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
        "exam_schedules_id": "",
        "user_id": "",
        "answers": [],
        "total_full_mark": null,
        "total_score": null,
        "time_spent": null,
        "status": null,
        "started_date": null,
        "finished_date": null
      }
      return {
        formData,
        formOptions: {
          "status_localdata": [
            {
              "value": -1,
              "text": "未开始"
            },
            {
              "value": 0,
              "text": "未完成"
            },
            {
              "value": 1,
              "text": "已完成"
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
        db.collection(dbCollectionName).doc(id).field("exam_schedules_id,user_id,answers,total_full_mark,total_score,time_spent,status,started_date,finished_date").get().then((res) => {
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
