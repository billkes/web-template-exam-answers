
<template>
	<view class="billkes-form-user-select">
		<view class="select-container">
			<view class="selected-users" v-if="selectedUsers.length > 0">
				<view v-for="(user, index) in selectedUsers" :key="user.value" class="user-tag">
					<text class="user-text">{{ user.text }}</text>
					<text class="remove-btn" @click="removeUser(index)">×</text>
				</view>
			</view>
			
			<view class="select-trigger" @click="showUserSelector">
				<input 
					v-model="searchText" 
					class="search-input" 
					:placeholder="placeholder || '请选择用户'" 
					@input="onSearchInput"
					@focus="showUserSelector"
					readonly
				/>
				<text class="select-arrow">▼</text>
			</view>
			
			<view v-if="showSelector" class="selector-dropdown">
				<view class="search-header">
					<input 
						v-model="searchText" 
						class="dropdown-search-input" 
						placeholder="搜索用户..." 
						@input="onSearchInput"
						ref="searchInput"
					/>
				</view>
				
				<view class="user-list">
					<view v-if="loading" class="loading">
						<text>加载中...</text>
					</view>
					
					<view v-else-if="filteredUsers.length === 0" class="no-results">
						<text>暂无用户数据</text>
					</view>
					
					<view v-else class="user-items">
						<view 
							v-for="user in filteredUsers" 
							:key="user.value" 
							class="user-item"
							:class="{ 'selected': isUserSelected(user.value) }"
							@click="toggleUser(user)"
						>
							<view class="user-info">
								<text class="user-name">{{ user.text }}</text>
								<text class="user-id">{{ user.value }}</text>
							</view>
							<view v-if="isUserSelected(user.value)" class="selected-icon">✓</view>
						</view>
					</view>
				</view>
				
				<view class="selector-footer">
					<button class="cancel-btn" @click="hideUserSelector" size="mini">取消</button>
					<button class="confirm-btn" @click="confirmSelection" type="primary" size="mini">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'billkes-form-user-select',
		props: {
			value: {
				type: Array,
				default: () => []
			},
			placeholder: {
				type: String,
				default: '请选择用户'
			},
			collection: {
				type: String,
				default: 'exam-users'
			},
			field: {
				type: String,
				default: 'nickname as text, _id as value'
			},
			multiple: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				selectedUsers: [],
				allUsers: [],
				filteredUsers: [],
				searchText: '',
				showSelector: false,
				loading: false,
				tempSelectedUsers: []
			}
		},
		watch: {
			value: {
				handler(newVal) {
					this.selectedUsers = Array.isArray(newVal) ? newVal : [];
					this.tempSelectedUsers = [...this.selectedUsers];
				},
				immediate: true,
				deep: true
			}
		},
		created() {
			this.loadUsers();
		},
		methods: {
			async loadUsers() {
				if (!this.collection) return;
				
				this.loading = true;
				try {
					const db = uniCloud.database();
					const collection = db.collection(this.collection);
					
					// 解析 field 参数
					const fieldParts = this.field.split(',');
				 const fields = fieldParts.map(part => part.trim().split(' as ')[0]).join(',');
					
					const res = await collection.field(fields).get();
					
					if (res.result && res.result.data) {
						this.allUsers = res.result.data.map(item => {
							// 根据 field 参数映射 text 和 value
							const textMatch = this.field.match(/(\w+)\s+as\s+text/);
							const valueMatch = this.field.match(/(\w+)\s+as\s+value/);
							
							return {
								text: textMatch ? item[textMatch[1]] : item.nickname || item.username || item._id,
								value: valueMatch ? item[valueMatch[1]] : item._id,
								...item
							};
						});
						this.filteredUsers = [...this.allUsers];
					}
				} catch (error) {
					console.error('加载用户数据失败:', error);
					uni.showToast({
						title: '加载用户数据失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},
			
			showUserSelector() {
				this.showSelector = true;
				this.tempSelectedUsers = [...this.selectedUsers];
				this.searchText = '';
				this.filteredUsers = [...this.allUsers];
				
				this.$nextTick(() => {
					if (this.$refs.searchInput) {
						this.$refs.searchInput.focus();
					}
				});
			},
			
			hideUserSelector() {
				this.showSelector = false;
				this.searchText = '';
			},
			
			onSearchInput() {
				if (!this.searchText.trim()) {
					this.filteredUsers = [...this.allUsers];
				} else {
					const searchLower = this.searchText.toLowerCase();
					this.filteredUsers = this.allUsers.filter(user => 
						user.text.toLowerCase().includes(searchLower) ||
						user.value.toLowerCase().includes(searchLower)
					);
				}
			},
			
			isUserSelected(userValue) {
				return this.tempSelectedUsers.some(user => user.value === userValue);
			},
			
			toggleUser(user) {
				const index = this.tempSelectedUsers.findIndex(u => u.value === user.value);
				
				if (index > -1) {
					// 取消选择
					this.tempSelectedUsers.splice(index, 1);
				} else {
					// 选择用户
					if (!this.multiple) {
						// 单选模式，清空之前的选择
						this.tempSelectedUsers = [user];
					} else {
						// 多选模式，添加选择
						this.tempSelectedUsers.push(user);
					}
				}
			},
			
			confirmSelection() {
				this.selectedUsers = [...this.tempSelectedUsers];
				this.$emit('input', this.selectedUsers);
				this.$emit('change', this.selectedUsers);
				this.hideUserSelector();
			},
			
			removeUser(index) {
				this.selectedUsers.splice(index, 1);
				this.$emit('input', this.selectedUsers);
				this.$emit('change', this.selectedUsers);
			},
			
			validate() {
				if (this.selectedUsers.length === 0) {
					return {
						valid: false,
						message: '请至少选择一个用户'
					};
				}
				
				return {
					valid: true,
					message: ''
				};
			},
			
			clear() {
				this.selectedUsers = [];
				this.$emit('input', this.selectedUsers);
				this.$emit('change', this.selectedUsers);
			},
			
			reset() {
				this.selectedUsers = Array.isArray(this.value) ? [...this.value] : [];
				this.$emit('input', this.selectedUsers);
				this.$emit('change', this.selectedUsers);
			}
		}
	}
</script>

<style scoped>
	.billkes-form-user-select {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.select-container {
		position: relative;
	}

	.selected-users {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 8px;
	}

	.user-tag {
		display: flex;
		align-items: center;
		gap: 4px;
		background-color: #e3f2fd;
		color: #1976d2;
		padding: 4px 8px;
		border-radius: 16px;
		font-size: 12px;
	}

	.user-text {
		font-size: 12px;
	}

	.remove-btn {
		font-size: 14px;
		font-weight: bold;
		cursor: pointer;
		padding: 0 2px;
	}

	.select-trigger {
		display: flex;
		align-items: center;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #fff;
		position: relative;
	}

	.search-input {
		flex: 1;
		border: none;
		padding: 8px 12px;
		font-size: 14px;
		background-color: transparent;
		outline: none;
	}

	.select-arrow {
		padding: 0 12px;
		color: #666;
		font-size: 12px;
	}

	.selector-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		margin-top: 4px;
	}

	.search-header {
		padding: 12px;
		border-bottom: 1px solid #eee;
	}

	.dropdown-search-input {
		width: 100%;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 14px;
		box-sizing: border-box;
	}

	.dropdown-search-input:focus {
		outline: none;
		border-color: #007aff;
	}

	.user-list {
		max-height: 200px;
		overflow-y: auto;
	}

	.loading, .no-results {
		padding: 20px;
		text-align: center;
		color: #999;
		font-size: 14px;
	}

	.user-items {
		display: flex;
		flex-direction: column;
	}

	.user-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		cursor: pointer;
		border-bottom: 1px solid #f5f5f5;
		transition: background-color 0.2s;
	}

	.user-item:hover {
		background-color: #f5f5f5;
	}

	.user-item.selected {
		background-color: #e3f2fd;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.user-name {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}

	.user-id {
		font-size: 12px;
		color: #999;
	}

	.selected-icon {
		color: #1976d2;
		font-weight: bold;
		font-size: 16px;
	}

	.selector-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 12px;
		border-top: 1px solid #eee;
	}

	.cancel-btn, .confirm-btn {
		min-width: 60px;
	}
</style>
