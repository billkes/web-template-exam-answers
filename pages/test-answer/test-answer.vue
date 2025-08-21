<template>
	<view class="container">
		<uni-card spacing="10px" margin="10px" title="报考-开考-继考">
			<uni-forms>
				<uni-forms-item label="用户id" required>
					<uni-easyinput v-model="formData.user_id" placeholder="请输入用户id" />
				</uni-forms-item>
				<uni-forms-item label="考试安排id" required>
					<uni-easyinput v-model="formData.exam_schedules_id" placeholder="请输入考试安排id" />
				</uni-forms-item>
			</uni-forms>

			<button type="primary" @click="handle_registerExam">报考</button>
			<button @click="handle_startExam">开考</button>
			<button @click="handle_continueExam">继考</button>
		</uni-card>

		<uni-card spacing="10px" margin="10px" title="答题卡">
			<uni-forms>
				<uni-forms-item label="题目下标" required>
					<uni-easyinput v-model="formData.current" placeholder="请输入题目下标" />
				</uni-forms-item>
				<uni-title type="h1" :title="title" color="#027fff"></uni-title>
				<uni-data-select v-model="formData.user_answer" :localdata="answer_localdata"
					multiple></uni-data-select>
			</uni-forms>

			<button @click="handle_answerQuestion">答题</button>
			<button @click="handle_submitExam">交卷</button>
		</uni-card>

		<uni-card spacing="10px" margin="10px" title="显示操作的返回结果">
			<view class="result-content">
				<scroll-view class="result-scroll" scroll-y="true">
					<text class="result-text">{{ result || '暂无操作结果' }}</text>
				</scroll-view>
			</view>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					user_id: '',
					exam_schedules_id: '',
					user_answer: [],
				},
				result: '',

				title: '这是一个题目',
				answer_localdata: [{
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
				],
			}
		},
		methods: {
			handle_registerExam() {},
			handle_startExam() {},
			handle_continueExam() {},
			handle_answerQuestion() {},
			handle_submitExam() {},
		}
	}
</script>

<style>
	.container {
		padding: 10rpx;
		min-height: 100vh;
	}

	.result-text {
		font-size: 24rpx;
		color: #333;
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>