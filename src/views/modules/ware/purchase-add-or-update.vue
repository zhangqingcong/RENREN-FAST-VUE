<!--  -->
<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="120px"
    >
      <el-form-item label="优先级" prop="priority">
        <el-input v-model="dataForm.priority" placeholder="优先级"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  name: "purchaseAddOrUpdate",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      visible: false,
      dataForm: {
        id: 0,
        assigneeId: "",
        assigneeName: "",
        phone: "",
        priority: "",
        status: 0,
        wareId: "",
        amount: "",
        createTime: "",
        updateTime: "",
      },
      dataRule: {
        assigneeId: [
          { required: true, message: "采购人id不能为空", trigger: "blur" },
        ],
        assigneeName: [
          { required: true, message: "采购人名不能为空", trigger: "blur" },
        ],
        phone: [
          { required: true, message: "联系方式不能为空", trigger: "blur" },
        ],
        priority: [
          { required: true, message: "优先级不能为空", trigger: "blur" },
        ],
        status: [{ required: true, message: "状态不能为空", trigger: "blur" }],
        wareId: [
          { required: true, message: "仓库id不能为空", trigger: "blur" },
        ],
        amount: [
          { required: true, message: "总金额不能为空", trigger: "blur" },
        ],
        createTime: [
          { required: true, message: "创建日期不能为空", trigger: "blur" },
        ],
        updateTime: [
          { required: true, message: "更新日期不能为空", trigger: "blur" },
        ],
      },
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    init(id) {
      this.dataForm.id = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        // 重置表单
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/ware/purchase/info/${this.dataForm.id}`),
            method: "get",
            params: this.$http.adornParams(),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.assigneeId = data.purchase.assigneeId;
              this.dataForm.assigneeName = data.purchase.assigneeName;
              this.dataForm.phone = data.purchase.phone;
              this.dataForm.priority = data.purchase.priority;
              this.dataForm.status = data.purchase.status;
              this.dataForm.wareId = data.purchase.wareId;
              this.dataForm.amount = data.purchase.amount;
              this.dataForm.createTime = data.purchase.createTime;
              this.dataForm.updateTime = data.purchase.updateTime;
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
              `/ware/purchase/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              assigneeId: this.dataForm.assigneeId,
              assigneeName: this.dataForm.assigneeName,
              phone: this.dataForm.phone,
              priority: this.dataForm.priority,
              status: this.dataForm.status,
              wareId: this.dataForm.wareId,
              amount: this.dataForm.amount,
              createTime: this.dataForm.createTime,
              updateTime: this.dataForm.updateTime,
            }),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  //   向父组件发送一个自定义事件
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