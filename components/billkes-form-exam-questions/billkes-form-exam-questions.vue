<template>
	<view class="billkes-form-exam-questions">
		<view class="questions-selector">
			<!-- 搜索框 -->
			<view class="search-box">
				<uni-easyinput v-model="searchKeyword" placeholder="搜索题目标题" :clearable="true" @input="handleSearch" />
			</view>

			<!-- 题目列表 -->
			<view class="questions-list">
				<view v-for="question in filteredQuestions" :key="question._id" class="question-item"
					:class="{ 'selected': isSelected(question._id) }" @click="toggleQuestion(question)">
					<view class="question-checkbox">
						<checkbox :checked="isSelected(question._id)" :disabled="disabled" />
					</view>
					<view class="question-content">
						<view class="question-title">{{ question.title }}</view>
						<view class="question-meta">
							<text class="question-type">{{ getQuestionTypeText(question.type) }}</text>
							<text class="question-difficulty">{{ getDifficultyText(question.difficulty) }}</text>
							<text class="question-score">{{ question.total_score || 0 }}分</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="hasMore" class="load-more">
				<uni-load-more :status="loadMoreStatus" @click="loadMore" />
			</view>

			<!-- 空状态 -->
			<view v-if="filteredQuestions.length === 0" class="empty-state">
				<text>暂无题目数据</text>
			</view>
		</view>

		<!-- 已选题目统计 -->
		<view v-if="selectedQuestions.length > 0" class="selected-summary">
			<text>已选择 {{ selectedQuestions.length }} 道题目</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-exam-questions',
		props: {
			modelValue: {
				type: Array,
				default: () => []
			},
			// 云数据库表名
			schemaKey: {
				type: String,
				require: true,
			},
		},
		data() {
			return {
				searchKeyword: '',
				questions: [],
				selectedQuestions: [],
				loadMoreStatus: 'more',
				hasMore: true,
				page: 1,
				pageSize: 20,
				loading: false
			}
		},
		computed: {
			filteredQuestions() {
				if (!this.searchKeyword) {
					return this.questions
				}
				return this.questions.filter(question =>
					question.title.toLowerCase().includes(this.searchKeyword.toLowerCase())
				)
			}
		},
		watch: {
			modelValue: {
				handler(newVal) {
					if (newVal) {
						this.selectedQuestions = [...newVal]
					} else {
						this.selectedQuestions = []
					}
				},
				immediate: true,
				deep: true
			},
			selectedQuestions: {
				handler(newVal) {
					this.$emit('update:modelValue', newVal)
				},
				deep: true
			}
		},
		created() {
			this.loadQuestions()
		},
		methods: {
			// 加载题目数据
			async loadQuestions() {
				if (this.loading || !this.hasMore) return

				this.loading = true
				this.loadMoreStatus = 'loading'

				try {
					const db = uniCloud.database()
					const collection = db.collection(this.schemaKey || "")

					// 构建查询条件
					let query = collection

					// 如果有搜索关键词，添加搜索条件
					if (this.searchKeyword) {
						query = query.where({
							title: new RegExp(this.searchKeyword, 'i')
						})
					}

					// 执行查询
					const result = await query
						.skip((this.page - 1) * this.pageSize)
						.limit(this.pageSize)
						.get()

					if (result.data && result.data.length > 0) {
						if (this.page === 1) {
							this.questions = result.data
						} else {
							this.questions = [...this.questions, ...result.data]
						}

						// 检查是否还有更多数据
						if (result.data.length < this.pageSize) {
							this.hasMore = false
							this.loadMoreStatus = 'noMore'
						} else {
							this.hasMore = true
							this.loadMoreStatus = 'more'
						}

						this.page++
					} else {
						this.hasMore = false
						this.loadMoreStatus = 'noMore'
					}
				} catch (error) {
					console.error('加载题目失败:', error)
					uni.showToast({
						title: '加载题目失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},

			// 加载更多
			loadMore() {
				if (this.loadMoreStatus === 'more') {
					this.loadQuestions()
				}
			},

			// 处理搜索
			handleSearch() {
				// 重置分页
				this.page = 1
				this.hasMore = true
				this.loadMoreStatus = 'more'
				this.questions = []
				// 重新加载数据
				this.loadQuestions()
			},

			// 判断题目是否已选中
			isSelected(questionId) {
				return this.selectedQuestions.some(q => q._id === questionId)
			},

			// 切换题目选择状态
			toggleQuestion(question) {
				if (this.disabled) return

				const index = this.selectedQuestions.findIndex(q => q._id === question._id)

				if (index > -1) {
					// 取消选择
					this.selectedQuestions.splice(index, 1)
				} else {
					// 检查最大选择数量限制
					if (this.maxCount > 0 && this.selectedQuestions.length >= this.maxCount) {
						uni.showToast({
							title: `最多只能选择${this.maxCount}道题目`,
							icon: 'none'
						})
						return
					}

					// 添加选择
					this.selectedQuestions.push(question)
				}
			},

			// 获取题目类型文本
			getQuestionTypeText(type) {
				const typeMap = {
					'single': '单选题',
					'multiple': '多选题'
				}
				return typeMap[type] || type
			},

			// 获取难度文本
			getDifficultyText(difficulty) {
				const difficultyMap = {
					1: '简单',
					2: '中等',
					3: '困难'
				}
				return difficultyMap[difficulty] || difficulty
			},

			// 验证
			validate() {
				return new Promise((resolve, reject) => {
					if (this.selectedQuestions.length === 0) {
						reject(new Error('请至少选择一道题目'))
					} else {
						resolve(this.selectedQuestions)
					}
				})
			},

			// 清空选择
			clear() {
				this.selectedQuestions = []
				this.searchKeyword = ''
				this.page = 1
				this.hasMore = true
				this.loadMoreStatus = 'more'
				this.questions = []
				this.loadQuestions()
			},

			// 重置
			reset() {
				this.clear()
				if (this.modelValue) {
					this.selectedQuestions = [...this.modelValue]
				}
			}
		}
	}
</script>

<style scoped>
	.billkes-form-exam-questions {
		padding: 10px;
	}

	.search-box {
		margin-bottom: 15px;
	}

	.questions-list {
		max-height: 400px;
		overflow-y: auto;
		border: 1px solid #e5e5e5;
		border-radius: 4px;
	}

	.question-item {
		display: flex;
		align-items: center;
		padding: 12px;
		border-bottom: 1px solid #f0f0f0;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.question-item:hover {
		background-color: #f8f8f8;
	}

	.question-item.selected {
		background-color: #e6f7ff;
		border-left: 3px solid #1890ff;
	}

	.question-checkbox {
		margin-right: 10px;
	}

	.question-content {
		flex: 1;
	}

	.question-title {
		font-size: 14px;
		color: #333;
		margin-bottom: 4px;
		font-weight: 500;
	}

	.question-meta {
		display: flex;
		gap: 8px;
	}

	.question-type,
	.question-difficulty,
	.question-score {
		font-size: 12px;
		color: #666;
		padding: 2px 6px;
		border-radius: 2px;
		background-color: #f5f5f5;
	}

	.question-type {
		color: #1890ff;
		background-color: #e6f7ff;
	}

	.question-difficulty {
		color: #52c41a;
		background-color: #f6ffed;
	}

	.question-score {
		color: #fa8c16;
		background-color: #fff7e6;
	}

	.load-more {
		padding: 10px;
		text-align: center;
	}

	.empty-state {
		padding: 40px 20px;
		text-align: center;
		color: #999;
	}

	.selected-summary {
		margin-top: 10px;
		padding: 8px 12px;
		background-color: #f6ffed;
		border: 1px solid #b7eb8f;
		border-radius: 4px;
		color: #52c41a;
		font-size: 12px;
		text-align: center;
	}

	/* 滚动条样式 */
	.questions-list::-webkit-scrollbar {
		width: 6px;
	}

	.questions-list::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3px;
	}

	.questions-list::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3px;
	}

	.questions-list::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>