<template>
  <view>
    <view class="uni-header">
      <view class="uni-group">
        <view class="uni-title"></view>
        <view class="uni-sub-title"></view>
      </view>
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
        <button class="uni-button" type="default" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button>
        <download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
          <button class="uni-button" type="primary" size="mini">导出 Excel</button>
        </download-excel>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db ref="udb" :collection="collectionList" field="exams_id,title,type,options,difficulty,answer,analysis" :where="where" page-data="replace"
        :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
        v-slot:default="{data,pagination,loading,error,options}" :options="options" loadtime="manual" @load="onqueryload">
        <uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'exams_id')">试卷</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'title')" sortable @sort-change="sortChange($event, 'title')">题目标题</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="options.filterData.type_localdata" @filter-change="filterChange($event, 'type')">题目类型</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'options')">选项</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="options.filterData.difficulty_localdata" @filter-change="filterChange($event, 'difficulty')">难度</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="options.filterData.answer_localdata" @filter-change="filterChange($event, 'answer')">答案</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'analysis')" sortable @sort-change="sortChange($event, 'analysis')">解析</uni-th>
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item,index) in data" :key="index">
            <uni-td align="center">
              <text v-text="item.exams_id?.title || '-'" :value="item.exams_id"></text>
            </uni-td>
            <uni-td align="center">{{item.title}}</uni-td>
            <uni-td align="center">
              <text v-text="options.filterData.type_localdata?.find(o=>o.value===item?.type)?.text || '-'" :value="item.type"></text>
            </uni-td>
            <uni-td align="center">
              <billkes-table-question-options :value="item.options"></billkes-table-question-options>
            </uni-td>
            <uni-td align="center">
              <text v-text="options.filterData.difficulty_localdata?.find(o=>o.value===item?.difficulty)?.text || '-'" :value="item.difficulty"></text>
            </uni-td>
            <uni-td align="center">
              <text v-text="Array.isArray(item?.answer) ? item.answer.map(a=>options.filterData.answer_localdata?.find(o=>o.value===a)?.text || '-').join(',')  : '-'" :value="item.answer"></text>
            </uni-td>
            <uni-td align="center">{{item.analysis}}</uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
        </view>
      </unicloud-db>
    </view>
  </view>
</template>

<script>
  import { enumConverter, filterToWhere } from '../../js_sdk/validator/exam-questions.js';

  const db = uniCloud.database()
  // 表查询配置
  const dbOrderBy = '' // 排序字段
  const dbSearchFields = [] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  const pageSize = 20
  const pageCurrent = 1

  const orderByMapping = {
    "ascending": "asc",
    "descending": "desc"
  }

  export default {
    data() {
      return {
        collectionList: "exam-questions",
        query: '',
        where: '',
        orderby: dbOrderBy,
        orderByFieldName: "",
        selectedIndexs: [],
        options: {
          pageSize,
          pageCurrent,
          filterData: {
            "type_localdata": [
              {
                "value": "single",
                "text": "单选题"
              },
              {
                "value": "multiple",
                "text": "多选题"
              }
            ],
            "difficulty_localdata": [
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
            ],
            "answer_localdata": [
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
          },
          ...enumConverter
        },
        imageStyles: {
          width: 64,
          height: 64
        },
        exportExcel: {
          "filename": "exam-questions.xls",
          "type": "xls",
          "fields": {
            "试卷": "exams_id",
            "题目标题": "title",
            "题目类型": "type",
            "选项": "options",
            "难度": "difficulty",
            "答案": "answer",
            "解析": "analysis"
          }
        },
        exportExcelData: []
      }
    },
    onLoad() {
      this._filter = {}
    },
    onReady() {
      this.$refs.udb.loadData()
    },
    methods: {
      onqueryload(data) {
        this.exportExcelData = data
      },
      getWhere() {
        const query = this.query.trim()
        if (!query) {
          return ''
        }
        const queryRe = new RegExp(query, 'i')
        return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
      },
      search() {
        const newWhere = this.getWhere()
        this.where = newWhere
        this.$nextTick(() => {
          this.loadData()
        })
      },
      loadData(clear = true) {
        this.$refs.udb.loadData({
          clear
        })
      },
      onPageChanged(e) {
        this.selectedIndexs.length = 0
        this.$refs.table.clearSelection()
        this.$refs.udb.loadData({
          current: e.current
        })
      },
      navigateTo(url, clear) {
        // clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
        uni.navigateTo({
          url,
          events: {
            refreshData: () => {
              this.loadData(clear)
            }
          }
        })
      },
      // 多选处理
      selectedItems() {
        var dataList = this.$refs.udb.dataList
        return this.selectedIndexs.map(i => dataList[i]._id)
      },
      // 批量删除
      delTable() {
        this.$refs.udb.remove(this.selectedItems(), {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      // 多选
      selectionChange(e) {
        this.selectedIndexs = e.detail.index
      },
      confirmDelete(id) {
        this.$refs.udb.remove(id, {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      sortChange(e, name) {
        this.orderByFieldName = name;
        if (e.order) {
          this.orderby = name + ' ' + orderByMapping[e.order]
        } else {
          this.orderby = ''
        }
        this.$refs.table.clearSelection()
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      },
      filterChange(e, name) {
        this._filter[name] = {
          type: e.filterType,
          value: e.filter
        }
        let newWhere = filterToWhere(this._filter, db.command)
        if (Object.keys(newWhere).length) {
          this.where = newWhere
        } else {
          this.where = ''
        }
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      }
    }
  }
</script>

<style>
</style>
