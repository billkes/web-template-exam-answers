// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "title": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "试卷标题",
    "title": "试卷标题"
  },
  "description": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "试卷描述",
    "title": "试卷描述"
  },
  "questions": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "array"
      },
      {
        "arrayType": "string"
      }
    ],
    "label": "题目列表",
    "title": "题目列表"
  },
  "status": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      },
      {
        "minimum": 0,
        "maximum": 1
      },
      {
        "range": [
          {
            "value": 0,
            "text": "草稿"
          },
          {
            "value": 1,
            "text": "发布"
          }
        ]
      }
    ],
    "label": "状态",
    "title": "状态",
    "defaultValue": 0
  }
}

const enumConverter = {
  "status_valuetotext": {
    "0": "草稿",
    "1": "发布"
  }
}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
