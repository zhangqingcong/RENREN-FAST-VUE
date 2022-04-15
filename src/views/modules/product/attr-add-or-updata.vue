<template>
  <!-- 点击新增或者修改的时候，弹出一个对话框  所以 最外层先放一个<el-dialog></el-dialog>-->
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @closed="dialogClose"
  >
    <!-- <el-dialog>里面放一个form表单 ref 制定验证规则-->
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      label-width="120px"
    >
      <el-form-item label="属性名" prop="attrName">
        <el-input v-model="dataForm.attrName" placeholder="属性名"></el-input>
      </el-form-item>

      <el-form-item label="属性类型" prop="attrType">
        <el-select v-model="dataForm.attrType" placeholder="请选择属性类型">
          <el-option label="基本属性" :value="1"></el-option>
          <el-option label="销售属性" :value="0"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="值类型" prop="valueType">
        <el-switch
          v-model="dataForm.valueType"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="允许多个值"
          inactive-text="只能单个值"
          :inactive-value="0"
          :active-value="1"
        >
        </el-switch>
      </el-form-item>
      <!-- 为el-select设置multiple属性即可启用多选，此时v-model的值为当前选中值所组成的数组。
      默认情况下选中值会以 Tag 的形式展现，你也可以设置collapse-tags属性将它们合并为一段文字。 -->
      <el-form-item label="可选值" prop="valueSelect">
        <el-select
          v-model="dataForm.valueSelect"
          multiple
          allow-create
          filterable
          placeholder="请输入内容"
        ></el-select>
      </el-form-item>
      <el-form-item label="属性图标" prop="icon">
        <el-input v-model="dataForm.icon" placeholder="属性图标"></el-input>
      </el-form-item>
      <el-form-item label="所属分类" prop="catelogId">
        <!-- 2/34/225 手机的三级分类ID -->
        <category-cascader :catelogPath.sync="catelogPath"></category-cascader>
      </el-form-item>
      <!-- type===1说明是新增 -->
      <el-form-item label="所属分组" prop="attrGroupId" v-if="type == 1">
        <el-select
          ref="groupSelect"
          v-model="dataForm.attrGroupId"
          placeholder="请选择"
        >
          <el-option
            v-for="item in attrGroups"
            :key="item.attrGroupId"
            :label="item.attrGroupName"
            :value="item.attrGroupId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="可检索" prop="searchType" v-if="type == 1">
        <el-switch
          v-model="dataForm.searchType"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
      </el-form-item>
      <el-form-item label="快速展示" prop="showDesc" v-if="type == 1">
        <el-switch
          v-model="dataForm.showDesc"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
      </el-form-item>
      <el-form-item label="启用状态" prop="enable">
        <el-switch
          v-model="dataForm.enable"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import categoryCascader from "../common/category-cascader.vue";
export default {
  components: { categoryCascader },
  // 父组件传过来的值 1 是新增 否则是修改
  props: {
    type: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      visible: false,
      dataForm: {
        attrId: 0,
        attrName: "",
        searchType: 0,
        valueType: 1,
        icon: "",
        valueSelect: " ",
        attrType: 1,
        enable: 1,
        catelogId: 0, //品牌分类ID 该属性是哪个品牌分组的
        showDesc: 0,
        // 分组属性ID Long类型 attr是哪个分组的
        attrGroupId: 0,
      },
      catelogPath: [],
      attrGroups: [],
      dataRule: {
        attrName: [
          { required: true, message: "属性名不能为空", trigger: "blur" },
        ],
        searchType: [
          {
            required: true,
            message: "是否需要检索不能为空",
            trigger: "blur",
          },
        ],
        valueType: [
          {
            required: true,
            message: "是否需要检索不能为空",
            trigger: "blur",
          },
        ],
        icon: [
          { required: true, message: "属性图标不能为空", trigger: "blur" },
        ],
        attrType: [
          {
            required: true,
            message: "属性类型不能为空",
            trigger: "blur",
          },
        ],
        enable: [
          {
            required: true,
            message: "启用状态不能为空",
            trigger: "blur",
          },
        ],
        catelogId: [
          {
            required: true,
            message: "需要选择正确的三级分类数据",
            trigger: "blur",
          },
        ],
        showDesc: [
          {
            required: true,
            message: "快速展示不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  watch: {
    //监听到路径发生变化需要重新查询出这个三级分类的分组信息
    catelogPath(path) {
      console.log("路径变了", path);
      this.attrGroups = [];
      this.dataForm.attrGroupId = "";
      this.dataForm.catelogId = path[path.length - 1];
      if (path && path.length == 3) {
        this.$http({
          url: this.$http.adornUrl(
            `/product/attrgroup/list/${path[path.length - 1]}`
          ),
          method: "get",
          params: this.$http.adornParams({ page: 1, limit: 10000000 }),
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.attrGroups = data.page.list;
          } else {
            this.$message.error(data.msg);
          }
        });
      } else if (path.length == 0) {
        this.dataForm.catelogId = "";
      } else {
        this.$message.error("请选择正确的分类");
        this.dataForm.catelogId = "";
      }
    },
  },
  methods: {
    init(id) {
      this.dataForm.attrId = id || 0;
      this.dataForm.attrType = this.type;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.attrId) {
          this.$http({
            url: this.$http.adornUrl(
              `/product/attr/info/${this.dataForm.attrId}`
            ),
            method: "get",
            params: this.$http.adornParams(),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.attrName = data.attr.attrName;
              this.dataForm.searchType = data.attr.searchType;
              this.dataForm.valueType = data.attr.valueType;
              this.dataForm.icon = data.attr.icon;
              this.dataForm.valueSelect = data.attr.valueSelect;
              this.dataForm.attrType = data.attr.attrType;
              this.dataForm.enable = data.attr.enable;
              this.datForm.catelogId = data.attr.catelogId;
              this.dataForm.showDesc = data.attr.showDesc;
              //catelogPath attrGroupId
              this.catelogPath = data.attr.catelogPath;
              this.$nextTick(() => {
                this.dataForm.attrGroupId = data.attr.attrGroupId;
              });
            }
          });
        }
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/product/attr/${!this.dataForm.attrId ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              attrId: this.dataForm.attrId || undefined,
              attrName: this.dataForm.attrName,
              searchType: this.dataForm.searchType,
              valueType: this.dataForm.valueType,
              icon: this.dataForm.icon,
              valueSelect: this.dataForm.valueSelect,
              attrType: this.dataForm.attrType,
              enable: this.dataForm.enable,
              catelogId: this.dataForm.catelogId,
              attrGroupId: this.dataForm.attrGroupId,
              showDesc: this.dataForm.showDesc,
            }),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.$emit("refreshDataList");
                },
              });
            } else {
              this.$message.error(data.msg);
            }
          });
        }
      });
    },

    // dialogClose
    dialogClose() {
      this.catelogPath = [];
    },
  },
};
</script>
<sytle></sytle>