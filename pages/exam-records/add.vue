<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="exam_id" label="试卷ID" required>
        <uni-data-select placeholder="试卷ID" collection="exams" field="title as text, _id as value" v-model="formData.exam_id"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="user_id" label="用户ID" required>
        <uni-data-select placeholder="用户ID" collection="exam-users" field="nickname as text, _id as value" v-model="formData.user_id"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="answers" label="答题记录" required>
        <billkes-form-exam-answers :multiple="true" v-model="formData.answers"></billkes-form-exam-answers>
      </uni-forms-item>
      <uni-forms-item name="total_score" label="总得分">
        <uni-easyinput type="number" placeholder="请输入考试总得分" v-model="formData.total_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="time_spent" label="用时">
        <billkes-form-duration placeholder="考试用时（秒）" unit="秒" minDuration="0" maxDuration="7200" type="number" v-model="formData.time_spent"></billkes-form-duration>
      </uni-forms-item>
      <uni-forms-item name="status" label="状态">
        <uni-data-select placeholder="请选择考试状态" v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="started_date" label="开始时间">
        <uni-datetime-picker placeholder="请选择开始考试时间" return-type="timestamp" v-model="formData.started_date"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="finished_date" label="完成时间">
        <uni-datetime-picker placeholder="请选择完成考试时间" return-type="timestamp" v-model="formData.finished_date"></uni-datetime-picker>
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
        "exam_id": "",
        "user_id": "",
        "answers": [],
        "total_score": null,
        "time_spent": null,
        "status": 0,
        "started_date": null,
        "finished_date": null
      }
      return {
        formData,
        formOptions: {
          "status_localdata": [
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
        return db.collection(dbCollectionName).add(value).then((res) => {
          uni.showToast({
            title: '新增成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      }
    }
  }
</script>
