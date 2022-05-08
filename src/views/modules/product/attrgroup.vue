<template>
  <!-- 总共是24 栅格 左右结构的 左边占6放菜单，右边占18放表格-->
  <el-row :gutter="20">
    <el-col :span="6">
      <!-- 子组件向父组件发送名为tree-node-clck 的事件 父组件接受这个事件 -->
      <category @tree-node-click="treeNodeClick"></category>
    </el-col>

    <el-col :span="18">
      <div class="mod-config">
        <el-form
          :inline="true"
          :model="dataForm"
          @keyup.enter.native="getDataList()"
        >
          <el-form-item>
            <el-input
              v-model="dataForm.key"
              placeholder="参数名"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="getDataList()">查询</el-button>
            <el-button type="success" @click="getAllDataList()">
              查询全部
            </el-button>
            <el-button
              v-if="isAuth('product:attrgroup:save')"
              type="primary"
              @click="addOrUpdateHandle()"
              >新增</el-button
            >
            <el-button
              v-if="isAuth('product:attrgroup:delete')"
              type="danger"
              @click="deleteHandle()"
              :disabled="dataListSelections.length <= 0"
              >批量删除</el-button
            >
          </el-form-item>
        </el-form>
        <el-table
          :data="dataList"
          border
          v-loading="dataListLoading"
          @selection-change="selectionChangeHandle"
          style="width: 100%"
        >
          <el-table-column
            type="selection"
            header-align="center"
            align="center"
            width="50"
          >
          </el-table-column>
          <el-table-column
            prop="attrGroupId"
            header-align="center"
            align="center"
            label="分组id"
          >
          </el-table-column>
          <el-table-column
            prop="attrGroupName"
            header-align="center"
            align="center"
            label="组名"
          >
          </el-table-column>
          <el-table-column
            prop="sort"
            header-align="center"
            align="center"
            label="排序"
          >
          </el-table-column>
          <el-table-column
            prop="descript"
            header-align="center"
            align="center"
            label="描述"
          >
          </el-table-column>
          <el-table-column
            prop="icon"
            header-align="center"
            align="center"
            label="组图标"
          >
          </el-table-column>
          <el-table-column
            prop="catelogId"
            header-align="center"
            align="center"
            label="所属分类id"
          >
          </el-table-column>
          <el-table-column
            fixed="right"
            header-align="center"
            align="center"
            width="150"
            label="操作"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                @click="relationHandle(scope.row.attrGroupId)"
                >关联</el-button
              >
              <el-button
                type="text"
                size="small"
                @click="addOrUpdateHandle(scope.row.attrGroupId)"
                >修改</el-button
              >
              <el-button
                type="text"
                size="small"
                @click="deleteHandle(scope.row.attrGroupId)"
                >删除</el-button
              >
            </template>
          </el-table-column>
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
        <!-- 弹窗, 新增 / 修改 -->
        <add-or-update
          v-if="addOrUpdateVisible"
          ref="addOrUpdate"
          @refreshDataList="getDataList"
        ></add-or-update>
        <!-- 修改关联关系 ref 把这个relation-update组件的引用 ref还可以获得dom的引用-->
        <!-- @=v-on 父组件绑定子组件的自定义事件 给这个自定义事件绑定一个处理函数 -->
        <relation-update
          v-if="relationVisible"
          ref="relationUpdate"
          @refreshData="getDataList"
        ></relation-update>
      </div>
    </el-col>
  </el-row>
</template>

<script>
/**
 * 父子组件传递数据
 * 1、这里是子组件给父组建传递数据 这里category是子组件 attrgroup是父组件，使用事件机制
 *  当子组件被点击以后会给父组件发送一个事件，携带上数据
 */
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Category from "../common/category";
import AddOrUpdate from "./attrgroup-add-or-update";
import RelationUpdate from "./attr-group-relation";
export default {
  name:'AttrGroup',
  //import引入的组件需要注入到对象中才能使用
  //第一个Category是给注册的组件起的名是自定义的 第二个Category是导入的组件名
  // components: { Category},若我们自定义的组件名和导入的组件名一致 还可以只写自定义的组件名
  components: {
    Category: Category,
    AddOrUpdate: AddOrUpdate,
    RelationUpdate: RelationUpdate,
  },
  props: {},
  data() {
    //这里存放数据
    return {
      catId: 0,
      dataForm: {
        key: "",
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      relationVisible: false,
    };
  },
  activated() {
    this.getDataList();
  },
  methods: {
    //获取属性分组与属性的关联
    relationHandle(groupId) {
      this.relationVisible = true;
      //$nextTick(callback); 下次dom更新时执行回调函数
      this.$nextTick(() => {
        //调用relationUpdate饮用的init函数方法
        this.$refs.relationUpdate.init(groupId);
      });
    },
    //感知树节点被点击了
    treeNodeClick(data, node, component) {
      console.log(
        "父组件attrgroup感知到了子组件category被点击了",
        data,
        node,
        component
      );
      console.log("刚才被点击的菜单ID：", data.catId);
      if (node.level == 3) {
        this.catId = data.catId;
        //重新查询
        this.getDataList();
      }
    },
    getAllDataList() {
      this.catId = 0;
      this.getDataList();
    },

    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl(`/product/attrgroup/list/${this.catId}`),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          key: this.dataForm.key,
        }),
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    // 删除
    deleteHandle(id) {
      var ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
            return item.attrGroupId;
          });
      this.$confirm(
        `确定对[id=${ids.join(",")}]进行[${id ? "删除" : "批量删除"}]操作?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        this.$http({
          url: this.$http.adornUrl("/product/attrgroup/delete"),
          method: "post",
          data: this.$http.adornData(ids, false),
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: "操作成功",
              type: "success",
              duration: 1500,
              onClose: () => {
                this.getDataList();
              },
            });
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
  },
};
</script>
<style scoped>
</style>