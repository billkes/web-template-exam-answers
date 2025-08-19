<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="title" label="试卷标题" required>
        <uni-easyinput placeholder="试卷标题" v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="description" label="试卷描述">
        <uni-easyinput type="textarea" placeholder="试卷描述" v-model="formData.description"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="questions" label="题目列表" required>
        <billkes-form-exam-questions schemaKey="exam-questions" :multiple="true" v-model="formData.questions"></billkes-form-exam-questions>
      </uni-forms-item>
      <uni-forms-item name="total_score" label="总分" required>
        <uni-easyinput type="number" placeholder="请输入试卷总分" v-model="formData.total_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="duration" label="考试时长">
        <billkes-form-duration placeholder="考试时长（分钟）" unit="分钟" minDuration="1" maxDuration="480" type="number" v-model="formData.duration"></billkes-form-duration>
      </uni-forms-item>
      <uni-forms-item name="tags" label="标签">
        <billkes-form-tags placeholder="请选择试卷标签" :multiple="true" v-model="formData.tags"></billkes-form-tags>
      </uni-forms-item>
      <uni-forms-item name="status" label="状态">
        <uni-data-select placeholder="请选择试卷状态" v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-select>
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
  import { validator } from '../../js_sdk/validator/exams.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'exams';

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
        "title": "",
        "description": "",
        "questions": [],
        "total_score": null,
        "duration": null,
        "tags": [],
        "status": 0
      }
      return {
        formData,
        formOptions: {
          "status_localdata": [
            {
              "value": 0,
              "text": "草稿"
            },
            {
              "value": 1,
              "text": "发布"
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
        db.collection(dbCollectionName).doc(id).field("title,description,questions,total_score,duration,tags,status").get().then((res) => {
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
