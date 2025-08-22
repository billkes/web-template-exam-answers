<template>
	<view>
		<uni-card spacing="10px" margin="10px" title="考试列表">
			<button @click="loadMyExams">查询我的考试</button>
		</uni-card>

		<uni-card spacing="10px" margin="10px" title="我的考试的返回结果">
			<view class="result-content">
				<scroll-view class="result-scroll" scroll-y="true">
					<view v-if="examList.length === 0">
						<text>暂无考试记录</text>
					</view>
					<view v-else v-for="(exam, index) in examList" :key="index" :exam="exam">
						<text class="result-text">{{ exam || '暂无操作结果' }}</text>
					</view>
				</scroll-view>
			</view>
		</uni-card>

		<uni-card spacing="10px" margin="10px" title="随机考试">
			<button @click="loadRandomExams">查询随机考试</button>
		</uni-card>

		<uni-card spacing="10px" margin="10px" title="随机考试的返回结果">
			<view class="result-content">
				<scroll-view class="result-scroll" scroll-y="true">
					<view v-if="randomExamList.length === 0">
						<text>暂无随机考试</text>
					</view>
					<view v-else v-for="(exam, index) in randomExamList" :key="index" :exam="exam">
						<text class="result-text">{{ exam || '暂无操作结果' }}</text>
					</view>
				</scroll-view>
			</view>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				examList: [],
				randomExamList: [],
			}
		},
		methods: {
			// 加载我的考试列表
			async loadMyExams() {
				try {
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'getMyExamList',
							params: {}
						}
					});

					if (res.result.code === 0) {
						this.examList = res.result.data;
					} else {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载我的考试列表失败:', error);
					uni.showToast({
						title: '加载考试列表失败',
						icon: 'none'
					});
				}
			},

			// 加载随机考试列表
			async loadRandomExams() {
				try {
					const res = await uniCloud.callFunction({
						name: 'billkes-exam-template',
						data: {
							action: 'getRandomExamList',
							params: {
								limit: 10
							}
						}
					});

					if (res.result.code === 0) {
						this.randomExamList = res.result.data;
						uni.showToast({
							title: '查询成功'
						})
					} else {
						uni.showToast({
							title: res.result.message,
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载随机考试列表失败:', error);
					uni.showToast({
						title: '加载随机考试列表失败',
						icon: 'none'
					});
				}
			},
		}
	}
</script>