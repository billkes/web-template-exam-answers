# Billkes Form 组件库说明

## 概述
Billkes Form 组件库是一套基于 Vue.js 的表单组件，专门为 uniCloud 项目设计，用于支持 HBuilderX 中的 schema2code 功能，快速生成后台管理页面。

## 组件列表

### 1. billkes-form-avatar.vue
**功能**: 头像上传和编辑组件
**特性**:
- 支持图片上传（本地选择和 uniCloud 云存储）
- 支持自定义上传地址
- 文件大小限制和格式验证
- 图片预览和错误处理
- 支持圆形头像显示

**Props**:
- `value`: 头像URL字符串
- `width/height`: 头像显示尺寸
- `editable`: 是否可编辑
- `uploadUrl`: 自定义上传地址
- `maxSize`: 最大文件大小（KB）

### 2. billkes-form-tags.vue
**功能**: 标签编辑和管理组件
**特性**:
- 动态添加/删除标签
- 支持标签建议列表
- 防重复和数量限制
- 支持键盘快捷操作（回车添加）

**Props**:
- `value`: 标签数组
- `maxTags`: 最大标签数量
- `allowDuplicates`: 是否允许重复标签
- `suggestions`: 建议标签列表
- `placeholder`: 输入框占位符

### 3. billkes-form-options.vue
**功能**: 题目选项编辑组件
**特性**:
- 动态添加/删除选项
- 自动生成选项标签（A、B、C、D...）
- 最小/最大选项数量限制
- 选项内容验证（非空、去重）

**Props**:
- `value`: 选项数组
- `minOptions/maxOptions`: 最小/最大选项数量
- `required`: 是否必填
- `allowEmpty`: 是否允许空选项
- `showValidation`: 是否显示验证信息

### 4. billkes-form-duration.vue
**功能**: 时长输入组件
**特性**:
- 分别输入小时、分钟、秒
- 实时预览格式化时长
- 数值范围验证
- 支持时长限制

**Props**:
- `value`: 时长（秒数）
- `minDuration/maxDuration`: 最小/最大时长
- `showPreview`: 是否显示预览
- `required`: 是否必填

### 5. billkes-form-datetime.vue
**功能**: 日期时间选择组件
**特性**:
- 支持日期、时间、日期时间三种模式
- 日期时间范围限制
- 实时预览格式化结果
- 支持时间戳、字符串、Date对象

**Props**:
- `value`: 日期时间值
- `mode`: 显示模式（date/time/datetime）
- `startDate/endDate`: 日期范围限制
- `startTime/endTime`: 时间范围限制
- `format`: 自定义格式

### 6. billkes-form-select.vue
**功能**: 下拉选择组件
**特性**:
- 支持字符串数组和对象数组
- 自定义显示和值字段
- 支持清空选择
- 完整的选择事件

**Props**:
- `value`: 当前选中值
- `options`: 选项数组
- `rangeKey/valueKey`: 显示和值字段名
- `placeholder`: 占位符
- `allowClear`: 是否允许清空

### 7. billkes-form-checkbox.vue
**功能**: 多选框组件
**特性**:
- 支持字符串数组和对象数组
- 最小/最大选择数量限制
- 全选/清空功能
- 完整的选择事件

**Props**:
- `value`: 当前选中值数组
- `options`: 选项数组
- `minSelected/maxSelected`: 最小/最大选择数量
- `required`: 是否必填

### 8. billkes-form-textarea.vue
**功能**: 长文本输入组件
**特性**:
- 字符计数和限制
- 自动高度调整
- 字数统计（中英文智能计算）
- 输入验证和提示

**Props**:
- `value`: 文本内容
- `maxlength/minlength`: 最大/最小长度
- `showCounter`: 是否显示字符计数
- `autoHeight`: 是否自动调整高度
- `trim`: 是否自动去除首尾空格

## 使用示例

### 基本使用
```vue
<template>
  <view>
    <!-- 头像上传 -->
    <billkes-form-avatar v-model="user.avatar" />
    
    <!-- 标签编辑 -->
    <billkes-form-tags 
      v-model="article.tags" 
      :suggestions="['技术', '生活', '学习']"
    />
    
    <!-- 选项编辑 -->
    <billkes-form-options 
      v-model="question.options" 
      :min-options="2" 
      :max-options="6"
    />
    
    <!-- 时长输入 -->
    <billkes-form-duration 
      v-model="exam.duration" 
      :max-duration="7200"
    />
    
    <!-- 日期时间选择 -->
    <billkes-form-datetime 
      v-model="event.startTime" 
      mode="datetime"
    />
    
    <!-- 下拉选择 -->
    <billkes-form-select 
      v-model="user.role" 
      :options="roleOptions"
    />
    
    <!-- 多选框 -->
    <billkes-form-checkbox 
      v-model="selectedPermissions" 
      :options="permissionOptions"
    />
    
    <!-- 长文本输入 -->
    <billkes-form-textarea 
      v-model="article.content" 
      :maxlength="1000"
    />
  </view>
</template>

<script>
export default {
  data() {
    return {
      user: {
        avatar: '',
        role: ''
      },
      article: {
        tags: [],
        content: ''
      },
      question: {
        options: []
      },
      exam: {
        duration: 0
      },
      event: {
        startTime: ''
      },
      selectedPermissions: [],
      roleOptions: [
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' }
      ],
      permissionOptions: ['读取', '写入', '删除']
    }
  }
}
</script>
```

## 与 uniCloud 集成

这些组件专门为 uniCloud 项目设计，可以与 schema2code 功能完美集成：

### 在 Schema 中使用
```json
{
  "bsonType": "object",
  "properties": {
    "avatar": {
      "bsonType": "string",
      "label": "头像",
      "component": {
        "name": "billkes-form-avatar"
      }
    },
    "tags": {
      "bsonType": "array",
      "label": "标签",
      "component": {
        "name": "billkes-form-tags"
      }
    }
  }
}
```

### 自动生成的表单
HBuilderX 会根据 schema 配置自动生成包含这些组件的表单页面，无需手动编写表单代码。

## 样式定制

所有组件都支持通过 CSS 进行样式定制，主要类名：
- `.billkes-form-*`: 组件容器
- `.validation-error`: 验证错误信息
- `.preview`: 预览信息

## 事件处理

每个组件都提供了丰富的事件：
- `input`: 值变化事件
- `change`: 值确认事件
- `select`: 选择事件（select/checkbox）
- `blur/focus`: 焦点事件
- `clear`: 清空事件

## 验证功能

所有组件都内置了验证功能：
- 必填验证
- 长度/数量限制
- 格式验证
- 自定义验证消息

## 总结

Billkes Form 组件库提供了一套完整的表单解决方案，特别适合 uniCloud 项目的后台管理系统开发。通过这些组件，可以快速构建功能丰富、用户体验良好的表单页面，大大提高开发效率。