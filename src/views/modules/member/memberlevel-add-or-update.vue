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
      <el-form-item label="等级名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="等级名称"></el-input>
      </el-form-item>
      <el-form-item label="所需成长值" prop="growthPoint">
        <el-input-number
          v-model="dataForm.growthPoint"
          :min="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="默认等级" prop="defaultStatus">
        <el-checkbox
          v-model="dataForm.defaultStatus"
          :true-label="1"
          :false-label="0"
        ></el-checkbox>
      </el-form-item>
      <el-form-item label="免运费标准" prop="freeFreightPoint">
        <el-input-number
          :min="0"
          v-model="dataForm.freeFreightPoint"
        ></el-input-number>
      </el-form-item>

      <el-form-item label="每次评价获取的成长值" prop="commentGrowthPoint">
        <el-input-number
          :min="0"
          v-model="dataForm.commentGrowthPoint"
        ></el-input-number>
      </el-form-item>

      <el-form-item label="是否有免邮特权" prop="priviledgeFreeFreight">
        <el-checkbox
          v-model="dataForm.priviledgeFreeFreight"
          :true-label="1"
          :false-label="0"
        ></el-checkbox>
      </el-form-item>

      <el-form-item label="是否有会员价格特权" prop="priviledgeMemberPrice">
        <el-checkbox
          v-model="dataForm.priviledgeMemberPrice"
          :true-label="1"
          :false-label="0"
        ></el-checkbox>
      </el-form-item>

      <el-form-item label="是否有生日特权" prop="priviledgeBirthday">
        <el-checkbox
          v-model="dataForm.priviledgeBirthday"
          :true-label="1"
          :false-label="0"
        ></el-checkbox>
      </el-form-item>

      <el-form-item label="备注" prop="note">
        <el-input v-model="dataForm.note" placeholder="备注"></el-input>
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
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      visible: false,
      dataForm: {
        id: 0,
        name: "",
        growthPoint: 0,
        defaultStatus: 0,
        freeFreightPoint: 0,
        commentGrowthPoint: 0,
        priviledgeFreeFreight: 0,
        priviledgeMemberPrice: 0,
        priviledgeBirthday: 0,
        note: "",
      },
      dataRule: {
        name: [
          { required: true, message: "等级名称不能为空", trigger: "blur" },
        ],
        growthPoint: [
          {
            required: true,
            message: "等级需要的成长值不能为空",
            trigger: "blur",
          },
        ],
        defaultStatus: [
          {
            required: true,
            message: "是否为默认等级[0->不是；1->是]不能为空",
            trigger: "blur",
          },
        ],
        freeFreightPoint: [
          { required: true, message: "免运费标准不能为空", trigger: "blur" },
        ],
        commentGrowthPoint: [
          {
            required: true,
            message: "每次评价获取的成长值不能为空",
            trigger: "blur",
          },
        ],
        priviledgeFreeFreight: [
          {
            required: true,
            message: "是否有免邮特权不能为空",
            trigger: "blur",
          },
        ],
        priviledgeMemberPrice: [
          {
            required: true,
            message: "是否有会员价格特权不能为空",
            trigger: "blur",
          },
        ],
        priviledgeBirthday: [
          {
            required: true,
            message: "是否有生日特权不能为空",
            trigger: "blur",
          },
        ],
        note: [{ required: true, message: "备注不能为空", trigger: "blur" }],
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
        this.$refs["dataForm"].resetFields();
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(
              `/member/memberlevel/info/${this.dataForm.id}`
            ),
            method: "get",
            params: this.$http.adornParams(),
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.dataForm.name = data.memberLevel.name;
              this.dataForm.growthPoint = data.memberLevel.growthPoint || 0;
              this.dataForm.defaultStatus = data.memberLevel.defaultStatus || 0;
              this.dataForm.freeFreightPoint =
                data.memberLevel.freeFreightPoint || 0;
              this.dataForm.commentGrowthPoint =
                data.memberLevel.commentGrowthPoint || 0;
              this.dataForm.priviledgeFreeFreight =
                data.memberLevel.priviledgeFreeFreight || 0;
              this.dataForm.priviledgeMemberPrice =
                data.memberLevel.priviledgeMemberPrice || 0;
              this.dataForm.priviledgeBirthday =
                data.memberLevel.priviledgeBirthday || 0;
              this.dataForm.note = data.memberLevel.note;
            }
          });
        }
      });
    },

    //表单提交
    dataFormSubmit() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/member/memberlevel/${!this.dataForm.id ? "save" : "update"}`
            ),
            method: "post",
            data: this.$http.adornData({
              id: this.dataForm.id || undefined,
              name: this.dataForm.name,
              growthPoint: this.dataForm.growthPoint,
              defaultStatus: this.dataForm.defaultStatus,
              freeFreightPoint: this.dataForm.freeFreightPoint,
              commentGrowthPoint: this.dataForm.commentGrowthPoint,
              priviledgeFreeFreight: this.dataForm.priviledgeFreeFreight,
              priviledgeMemberPrice: this.dataForm.priviledgeMemberPrice,
              priviledgeBirthday: this.dataForm.priviledgeBirthday,
              note: this.dataForm.note,
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