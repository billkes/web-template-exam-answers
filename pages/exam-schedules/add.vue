<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="exam_id" label="试卷" required>
        <uni-data-select placeholder="请选择试卷" collection="exams" :where="`status == 1`" field="title as text, _id as value" v-model="formData.exam_id"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="title" label="安排标题" required>
        <uni-easyinput placeholder="请输入考试安排标题" v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="description" label="安排描述">
        <uni-easyinput type="textarea" placeholder="请输入考试安排描述" v-model="formData.description"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="start_time" label="开始时间" required>
        <uni-datetime-picker placeholder="请选择考试开始时间" return-type="timestamp" v-model="formData.start_time"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="end_time" label="结束时间" required>
        <uni-datetime-picker placeholder="请选择考试结束时间" return-type="timestamp" v-model="formData.end_time"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="duration" label="考试时长" required>
        <uni-easyinput placeholder="考试时长（分钟）" type="number" v-model="formData.duration"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="simple_score" label="简单题分数" required>
        <uni-easyinput type="number" placeholder="请输入试卷简单题分数" v-model="formData.simple_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="simple_count" label="简单题数量" required>
        <uni-easyinput type="number" placeholder="请输入试卷简单题数量" v-model="formData.simple_count"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="medium_score" label="中等题分数" required>
        <uni-easyinput type="number" placeholder="请输入试卷中等题分数" v-model="formData.medium_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="medium_count" label="中等题数量" required>
        <uni-easyinput type="number" placeholder="请输入试卷中等题数量" v-model="formData.medium_count"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="difficult_score" label="困难题分数" required>
        <uni-easyinput type="number" placeholder="请输入试卷困难题分数" v-model="formData.difficult_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="difficult_count" label="困难题数量" required>
        <uni-easyinput type="number" placeholder="请输入试卷困难题数量" v-model="formData.difficult_count"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="total_score" label="总分">
        <uni-easyinput type="number" :disabled="true" placeholder="自动计算" v-model="formData.total_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="total_count" label="总题数">
        <uni-easyinput type="number" :disabled="true" placeholder="自动计算" v-model="formData.total_count"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="status" label="状态">
        <uni-data-select :disabled="true" placeholder="自动计算" v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-select>
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
  import { validator } from '../../js_sdk/validator/exam-schedules.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'exam-schedules';

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
        "title": "",
        "description": "",
        "start_time": null,
        "end_time": null,
        "duration": 1,
        "simple_score": null,
        "simple_count": null,
        "medium_score": null,
        "medium_count": null,
        "difficult_score": null,
        "difficult_count": null,
        "total_score": null,
        "total_count": null,
        "status": null
      }
      return {
        formData,
        formOptions: {
          "status_localdata": [
            {
              "value": 0,
              "text": "未开始"
            },
            {
              "value": 1,
              "text": "进行中"
            },
            {
              "value": 2,
              "text": "已结束"
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
