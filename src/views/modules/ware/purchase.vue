<!--  -->
<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item label="状态">
        <el-select
          style="width: 120px"
          v-model="dataForm.status"
          placeholder="请选择状态"
          clearable
        >
          <el-option label="新建" :value="0"></el-option>
          <el-option label="已分配" :value="1"></el-option>
          <el-option label="已领取" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="有异常" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input
          style="width: 120px"
          v-model="dataForm.key"
          placeholder="参数名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button
          v-if="isAuth('ware:purchase:save')"
          type="primary"
          @click="addOrUpdateHandle()"
          >新增</el-button
        >
        <el-button
          v-if="isAuth('ware:purchase:delete')"
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
        >
          批量删除
        </el-button>
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
      ></el-table-column>
      <el-table-column
        prop="id"
        label="采购单id"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="assigneeId"
        label="采购人ID"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="assigneeName"
        label="采购人姓名"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="phone"
        label="联系方式"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="priority"
        label="优先级"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        header-align="center"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status == 0">新建</el-tag>
          <el-tag v-if="scope.row.status == 1" type="info">已分配</el-tag>
          <el-tag v-if="scope.row.status == 2" type="warning">已领取</el-tag>
          <el-tag v-if="scope.row.status == 3" type="success">已完成</el-tag>
          <el-tag v-if="scope.row.status == 4" type="danger">有异常</el-tag>
        </template></el-table-column
      >
      <el-table-column
        prop="wareId"
        label="仓库ID"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="amount"
        label="总金额"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        label="创建日期"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="updateTime"
        label="更新日期"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        header-align="center"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            v-if="scope.row.status == 0 || scope.row.status == 1"
            @click="opendrawer(scope.row)"
            >分配</el-button
          >
          <el-button
            type="text"
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
            >修改</el-button
          >
          <el-button
            type="text"
            size="small"
            @click="deleteHandle(scope.row.id)"
            >删除</el-button
          ></template
        ></el-table-column
      >
    </el-table>
    <!-- 分页组件 -->
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    >
    </el-pagination>
    <!-- 新增/修改 的弹窗 -->
    <add-or-update
      v-if="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    ></add-or-update>
    <el-dialog
      title="分配采购人员"
      :visible.sync="caigoudialogVisible"
      width="30%"
    >
      <el-select v-model="userId" filterable placeholder="请选择">
        <el-option
          v-for="item in userList"
          :key="item.userId"
          :label="item.username"
          :value="item.userId"
        ></el-option
      ></el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="caigoudialogVisible = false">取消</el-button>
        <el-button type="primary" @click="assignUser">确定</el-button></span
      ></el-dialog
    >
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import AddOrUpdate from "./purchase-add-or-update.vue";
export default {
  naem: "purchase",
  //import引入的组件需要注入到对象中才能使用
  components: { AddOrUpdate },
  data() {
    //这里存放数据
    return {
      currentRow: {},
      dataForm: {
        key: "",
        status: "",
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      caigoudialogVisible: false,
      userId: "",
      userList: [],
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    opendrawer(row) {
      this.getUserList();
      this.currentRow = row;
      this.caigoudialogVisible = true;
    },
    assignUser() {
      let _this = this;
      let user = {};
      this.userList.forEach((item) => {
        if (item.userId == _this.userId) {
          user = item;
        }
      });
      this.caigoudialogVisible = false;
      this.$http({
        url: this.$http.adornUrl(`/ware/purchase/update`),
        method: "post",
        data: this.$http.adornData({
          id: this.currentRow.id || undefined,
          assigneeId: user.userId,
          assigneeName: user.username,
          phone: user.mobile,
          status: 1,
        }),
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message({
            message: "操作成功",
            type: "success",
            duration: 1500,
          });
          this.userId = "";
          this.getDataList();
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    getUserList() {
      this.$http({
        url: this.$http.adornUrl("/sys/user/list"),
        method: "get",
        params: this.$http.adornParams({
          page: 1,
          limit: 500,
        }),
      }).then(({ data }) => {
        this.userList = data.page.list;
      });
    },
    //获取列表数据
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/ware/purchase/list"),
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
    // 新增 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    //删除
    deleteHandle(id) {
      var ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
            return item.id;
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
          url: this.$http.adornUrl("/ware/purchase/delete"),
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
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {
  }, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {
    this.getDataList();
  }, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style scoped>
</style>