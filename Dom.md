# uniCloud快速生成后台管理页面

> 纯官方文档和实用指南

## 参考文档如下：

### 核心文档
- [uniCloud DB Schema文档](https://doc.dcloud.net.cn/uniCloud/schema.html)
- [uniCloud schema2code文档](https://doc.dcloud.net.cn/uniCloud/schema2code.html)
- [uniCloud DB Schema扩展js文档](https://doc.dcloud.net.cn/uniCloud/jql-schema-ext.html)

### 数据库操作
- [uniCloud JQL数据库操作](https://doc.dcloud.net.cn/uniCloud/jql.html)
- [uniCloud unicloud-db组件简介](https://doc.dcloud.net.cn/uniCloud/unicloud-db.html)

### 组件相关
- [uniCloud uni-data-select下拉框组件](https://uniapp.dcloud.net.cn/component/uniui/uni-data-select.html)
- [uniCloud dataCom组件规范](https://uniapp.dcloud.net.cn/component/datacom.html)

### 云函数/云对象
- [uniCloud 定时触发](https://doc.dcloud.net.cn/uniCloud/trigger.html)

## 快速开始指南

### 1. 创建数据库 Schema
在 `uniCloud/database` 目录下创建 `.schema.json` 文件，定义数据表结构。

### 2. 配置 Schema2Code
在 Schema 文件中配置 `schema2code` 相关参数，自动生成管理页面。

### 3. 使用扩展 JS
为 Schema 添加扩展 JS 文件，实现复杂的业务逻辑。

### 4. 开启定时器
...

## 最佳实践

- 合理设计数据表结构，避免过度嵌套
- 使用 Schema 扩展实现数据验证和业务逻辑
- 充分利用 schema2code 功能提高开发效率
- 注意数据权限和安全控制