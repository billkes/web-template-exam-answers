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
    "label": "题目标题",
    "title": "题目标题"
  },
  "type": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      },
      {
        "range": [
          {
            "value": "single",
            "text": "单选题"
          },
          {
            "value": "multiple",
            "text": "多选题"
          }
        ]
      }
    ],
    "label": "题目类型",
    "title": "题目类型"
  },
  "options": {
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
    "label": "选项",
    "title": "选项"
  },
  "answer": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "array"
      },
      {
        "arrayType": "int"
      },
      {
        "range": [
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
      }
    ],
    "label": "答案",
    "title": "答案"
  },
  "analysis": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "解析",
    "title": "解析"
  },
  "difficulty": {
    "rules": [
      {
        "format": "int"
      },
      {
        "minimum": 1,
        "maximum": 3
      },
      {
        "range": [
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
        ]
      }
    ],
    "label": "难度",
    "title": "难度",
    "defaultValue": 1
  }
}

const enumConverter = {
  "type_valuetotext": {
    "single": "单选题",
    "multiple": "多选题"
  },
  "answer_valuetotext": [
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
  ],
  "difficulty_valuetotext": {
    "1": "简单",
    "2": "中等",
    "3": "困难"
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
