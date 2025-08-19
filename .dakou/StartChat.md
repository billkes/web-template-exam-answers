请根据uniCloud官方文档的要求，进一步优化现有的5个JSON schema文件，以支持HBuilderX中的schema2code功能，从而快速生成后台管理页面。

- 为所有的云数据库表中的特定字段添加合理的'componentForShow'属性。 如果官方不支持某个组件，则创建一个自定义组件，并遵循'billkes-table-*'进行命名。

- 为所有的云数据库表中的特定字段添加合理的'componentForEdit'属性。 如果官方不支持某个组件，则创建一个自定义组件，并遵循'billkes-form-*'进行命名。

参考文档如下：

- [uniCloud DB Schema文档](https://doc.dcloud.net.cn/uniCloud/schema.html)

- [uniCloud schema2code文档](https://doc.dcloud.net.cn/uniCloud/schema2code.html)

完成后，请提交PR并通过CI验证。