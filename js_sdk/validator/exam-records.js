// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "exam_schedules_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "试卷",
    "title": "试卷"
  },
  "user_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "用户",
    "title": "用户"
  },
  "answers": {
    "rules": [
      {
        "format": "array"
      },
      {
        "arrayType": "object"
      }
    ],
    "label": "答题记录",
    "title": "答题记录"
  },
  "total_full_mark": {
    "rules": [
      {
        "format": "number"
      },
      {
        "minimum": 0
      }
    ],
    "label": "总满分",
    "title": "总满分"
  },
  "total_score": {
    "rules": [
      {
        "format": "number"
      },
      {
        "minimum": 0
      }
    ],
    "label": "总得分",
    "title": "总得分"
  },
  "time_spent": {
    "rules": [
      {
        "format": "int"
      },
      {
        "minimum": 60,
        "maximum": 12000
      }
    ],
    "label": "用时",
    "title": "用时"
  },
  "status": {
    "rules": [
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
            "value": -1,
            "text": "未开始"
          },
          {
            "value": 0,
            "text": "未完成"
          },
          {
            "value": 1,
            "text": "已完成"
          }
        ]
      }
    ],
    "label": "状态",
    "title": "状态"
  },
  "started_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ],
    "label": "开始时间",
    "title": "开始时间"
  },
  "finished_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ],
    "label": "完成时间",
    "title": "完成时间"
  }
}

const enumConverter = {
  "status_valuetotext": {
    "0": "未完成",
    "1": "已完成",
    "-1": "未开始"
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
