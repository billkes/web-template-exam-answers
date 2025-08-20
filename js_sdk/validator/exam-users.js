// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "username": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "用户名",
    "title": "用户名"
  },
  "email": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "邮箱",
    "title": "邮箱"
  },
  "nickname": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "昵称",
    "title": "昵称"
  },
  "avatar": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "头像",
    "title": "头像"
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
            "value": 0,
            "text": "禁用"
          },
          {
            "value": 1,
            "text": "启用"
          }
        ]
      }
    ],
    "label": "状态",
    "title": "状态",
    "defaultValue": 1
  }
}

const enumConverter = {
  "status_valuetotext": {
    "0": "禁用",
    "1": "启用"
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
