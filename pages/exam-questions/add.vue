<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="exams_id" label="试卷" required>
        <uni-data-select placeholder="请选择试卷" collection="exams" field="title as text, _id as value" v-model="formData.exams_id"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="title" label="题目标题" required>
        <uni-easyinput placeholder="请输入题目标题" v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="type" label="题目类型" required>
        <uni-data-select placeholder="请选择题目类型" v-model="formData.type" :localdata="formOptions.type_localdata"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="options" label="选项" required>
        <billkes-form-question-options :multiple="true" v-model="formData.options"></billkes-form-question-options>
      </uni-forms-item>
      <uni-forms-item name="difficulty" label="难度" required>
        <uni-data-select placeholder="请选择题目难度" v-model="formData.difficulty" :localdata="formOptions.difficulty_localdata"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="answer" label="答案" required>
        <uni-data-select placeholder="请选择题目答案" :multiple="true" v-model="formData.answer" :localdata="formOptions.answer_localdata"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item name="analysis" label="解析">
        <uni-easyinput type="textarea" placeholder="请输入题目解析" v-model="formData.analysis"></uni-easyinput>
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
  import { validator } from '../../js_sdk/validator/exam-questions.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'exam-questions';

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
        "exams_id": "",
        "title": "",
        "type": "",
        "options": [],
        "difficulty": 1,
        "answer": [],
        "analysis": ""
      }
      return {
        formData,
        formOptions: {
          "type_localdata": [
            {
              "value": "single",
              "text": "单选题"
            },
            {
              "value": "multiple",
              "text": "多选题"
            }
          ],
          "difficulty_localdata": [
            {
              "value": 1,
              "text": "简单"
            },
            {
              "value": 2,
              "text": "中等"
            },
            {
              "value": 3,
              "text": "困难"
            }
          ],
          "answer_localdata": [
            {
              "value": 0,
              "text": "A"
            },
            {
              "value": 1,
              "text": "B"
            },
            {
              "value": 2,
              "text": "C"
            },
            {
              "value": 3,
              "text": "D"
            },
            {
              "value": 4,
              "text": "E"
            },
            {
              "value": 5,
              "text": "F"
            },
            {
              "value": 6,
              "text": "G"
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
