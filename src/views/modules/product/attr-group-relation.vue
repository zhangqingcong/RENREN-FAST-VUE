<!--  属性和组关系的组件-->
<template>
  <div>
    <el-dialog
      :close-on-click-model="false"
      :visible.sync="visible"
      @closed="dialogClose"
    >
      <el-dialog
        width="40%"
        title="选择属性"
        :visible.sync="innerVisible"
        append-to-body
      >
        <div>
          <el-form
            :inline="true"
            :model="dataForm"
            @keyup.enter.native="getDataList()"
          >
            <el-form-item>
              <el-input v-model="dataForm.key" placeholder="参数名" clearable>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="getDataList()">查询</el-button>
            </el-form-item>
          </el-form>
          <el-table
            :data="dataList"
            border
            v-loading="dataListLoading"
            @selection-change="innerSelectionChangeHandle"
            style="width: 100%"
          >
            <el-table-column
              type="selection"
              header-align="center"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="attrId"
              header-align="center"
              align="center"
              label="属性id"
            ></el-table-column>
            <el-table-column
              prop="attrName"
              header-align="center"
              align="center"
              label="属性名"
            ></el-table-column>
            <el-table-column
              prop="icon"
              header-align="center"
              align="center"
              label="属性图标"
            ></el-table-column>
            <el-table-column
              prop="valueSelect"
              header-align="center"
              align="center"
              label="可选值列表"
            ></el-table-column>
          </el-table>
          <el-pagination
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
            :current-page="pageIndex"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            :total="totalPage"
            layout="total, sizes, prev, pager, next, jumper"
          ></el-pagination>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddRealtion"
            >确认新增</el-button
          >
        </div>
      </el-dialog>
      <!-- row和col组件是Layout布局组件内容 基础是24分栏 -->
      <!-- v-on是给标签绑定函数 @-->
      <!-- v-bind动态绑定，及时对页面数据进行更改 -->
      <el-row>
        <el-col :span="24">
          <el-button type="primary" @click="addRelation">新建关联</el-button>
          <el-button
            type="danger"
            @click="batchDeleteRelation"
            :disabled="dataListSelections.length <= 0"
            >批量删除</el-button
          >
          <el-table
            :data="relationAttrs"
            style="width: 100%"
            @selection-change="selectionChangeHandle"
            border
          >
            <el-table-column
              type="selection"
              header-align="center"
              align="center"
              width="50"
            ></el-table-column>
            <el-table-column prop="attrId" label="#"></el-table-column>
            <el-table-column prop="attrName" label="属性名"></el-table-column>
            <el-table-column prop="valueSelect" label="可选值">
              <template slot-scope="scope">
                <el-tooltip placement="top">
                  <div slot="content">
                    <span
                      v-for="(i, index) in scope.row.valueSelect.split(';')"
                      :key="index"
                    >
                      {{ i }}
                      <br />
                    </span>
                  </div>
                  <el-tag>
                    {{ scope.row.valueSelect.split(";")[0] + " ..." }}
                  </el-tag>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              header-align="center"
              align="center"
              label="操作"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="relationRemove(scope.row.attrId)"
                  >移除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  name: "AttrGroupRelation",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      attrGroupId: 0,
      visible: false,
      innerVisible: false,
      relationAttrs: [],
      dataListSelections: [],
      dataForm: {
        key: "",
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      innerdataListSelections: [],
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    /**根据属性分组id获取属性分组下的所有属性 */
    init(id) {
      (this.attrGroupId = id || 0),
        (this.visible = true),
        this.$http({
          url: this.$http.adornUrl(
            "/product/attrgroup/" + this.attrGroupId + "/attr/relation"
          ),
          method: "get",
          params: this.$http.adornParams({}),
        }).then(({ data }) => {
          this.relationAttrs = data.data;
        });
    },

    /**新增属性分组与属性的关联 */
    addRelation() {
      this.getDataList();
      this.innerVisible = true;
    },
    getDataList() {},
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style scoped>
</style>