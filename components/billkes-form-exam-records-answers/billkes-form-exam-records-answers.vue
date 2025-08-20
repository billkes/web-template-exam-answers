<template>
	<view class="billkes-form-exam-answers">

		<view class="answers-container">
			<view v-if="answers.length === 0" class="empty-state">
				<text class="empty-text">暂无答题记录</text>
			</view>

			<view v-else class="answers-list">
				<view class="answer-item">
					<view class="answer-header">
						<text class="answer-index">答题记录</text>
						<view class="right">
							<button class="confirm-btn" @click="confirmAnswer(index)" type="primary"
								size="mini">确认</button>
						</view>
					</view>

					<uni-collapse>
						<uni-collapse-item title="答题卡">
							<view class="answer-card">
								<!-- 顶部统计 -->
								<view class="card-header">
									<text class="card-title">答题卡</text>
									<text class="card-count">{{ answeredCount }} / {{ answers.length }}</text>
								</view>

								<!-- 题号宫格 -->
								<view class="card-grid">
									<view v-for="(item, idx) in answers" :key="idx" class="card-item" :class="{
							          answered: Array.isArray(item.user_answer) && item.user_answer.length,
							          active: idx === current,
							        }" @click="switchQuestion(idx)">
										{{ idx + 1 }}
									</view>
								</view>
							</view>
						</uni-collapse-item>
						<uni-collapse-item title="试题">
							<view v-if="answers[current]">
								<view class="answer-content">
									<view class="form-item">
										<text class="form-label">题目</text>
										<uni-easyinput errorMessage disabled
											:model-value="answers[current].questions?.title || ''"
											placeholder="请输入题目"></uni-easyinput>
									</view>

									<view class="form-item"
										v-for="(opt, idx) in answers[current].questions?.options || []" :key='idx'>
										<text class="form-label">选项 {{ String.fromCharCode(65 + idx) }}</text>
										<uni-easyinput errorMessage disabled :model-value="opt"
											placeholder="请输入题目"></uni-easyinput>
									</view>

									<view class="form-item">
										<text class="form-label">用户答案</text>
										<uni-data-select placeholder="请输入用户答案" :multiple="true"
											v-model="answers[current].user_answer"
											:localdata="answer_localdata"></uni-data-select>
									</view>

									<view class="form-item">
										<text class="form-label">是否正确</text>
										<uni-data-checkbox v-model="answers[current].is_correct"
											:localdata="is_correct_localdata"></uni-data-checkbox>
									</view>

									<view class="form-item">
										<text class="form-label">得分</text>
										<uni-easyinput errorMessage disabled :model-value="answers[current].score"
											placeholder="自动生成"></uni-easyinput>
									</view>
								</view>
							</view>
						</uni-collapse-item>
					</uni-collapse>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-exam-answers',
		props: {
			value: {
				type: Array,
				default: () => []
			},
			multiple: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				is_correct_localdata: [{
						"value": 1,
						"text": "正确"
					},
					{
						"value": 0,
						"text": "错误"
					},
				],
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
				current: 0,
								answers: [/* {
					questions: {
						"_id": "68a44dc2a674f439f9281bbb",
						"difficulty": 1,
						"title": "下列哪种动物是“海洋中的独角兽”？",
						"type": "single",
						"options": [
							"海马",
							"章鱼",
							"独角鲸",
							"海豚"
						],
						"answer": [
							2
						],
						"analysis": "独角鲸的长牙像独角兽的角，因此被称为“海洋独角兽”。",
						"created_date": 1755598274222,
						"updated_date": 1755598274222
					},
					exam_schedules: {
						"_id": "schedule1",
						"exam_id": "exam1",
						"title": "第一次月考",
						"description": "高一第一次月考",
						"start_time": 1755598274222,
						"end_time": 1755684674222,
						"allowed_users": ["user1", "user2"],
						"duration": 120,
						"simple_score": 2,
						"medium_score": 4,
						"difficult_score": 6,
						"total_score": 100,
						"status": 1,
						"created_date": 1755598274222,
						"updated_date": 1755598274222
					},
					full_mark: 2,
					score: 0,
					is_correct: 1,
					user_answer: [2]
				} */]
			}
		},
		watch: {
			value: {
				handler(newVal) {
					this.answers = Array.isArray(newVal) ? newVal : [];
				},
				immediate: true,
				deep: true
			}
		},
		computed: {
			// 已答题目数量
			answeredCount() {
				return this.answers.filter(a => Array.isArray(a.user_answer) && a.user_answer.length).length;
			}
		},
		methods: {
			switchQuestion(index) {
				this.current = index;
			},
			confirmAnswer(index) {
				this.$emit('update:modelValue', this.answers)
				this.$emit('change', this.answers)
			},
		}
	}
</script>

<style scoped>
	.billkes-form-exam-answers {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.answers-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		border: 2px dashed #ddd;
		border-radius: 8px;
		background-color: #fafafa;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
	}

	.answers-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.answer-item {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background-color: #fff;
		overflow: hidden;
	}

	.answer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 10px;
		background-color: #f5f5f5;
		border-bottom: 1px solid #e0e0e0;
	}

	.answer-card {
		padding: 12px;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.card-title {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.card-count {
		font-size: 14px;
		color: #666;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 8px;
	}

	.card-item {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 34px;
		border-radius: 4px;
		font-size: 14px;
		color: #666;
		background-color: #f5f5f5;
		cursor: pointer;
	}

	.card-item.answered {
		background-color: #e1f5fe;
		color: #007aff;
		font-weight: 500;
	}

	.card-item.active {
		color: #fff;
		background-color: #007aff;
	}

	.answer-index {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.right {
		display: flex;
		align-items: center;
	}

	.confirm-btn {
		min-width: 60px;
		margin: 0;
	}

	.delete-btn {
		min-width: 60px;
		margin: 0;
	}

	.answer-content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-label {
		font-size: 12px;
		color: #666;
		font-weight: 500;
	}

	.form-input {
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 14px;
		background-color: #fff;
		min-height: 36px;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: #007aff;
	}

	.radio-group {
		display: flex;
		gap: 16px;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 14px;
		color: #333;
	}

	.add-more {
		display: flex;
		justify-content: center;
		padding: 8px 0;
	}

	.add-btn {
		min-width: 100px;
	}
</style>