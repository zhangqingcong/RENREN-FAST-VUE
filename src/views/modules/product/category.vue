<!--  -->
<template>
  <div>
    <el-switch
      v-model="draggable"
      active-text="开启拖拽功能"
      inactive-text="关闭拖拽功能"
    >
    </el-switch>
    <el-button v-if="draggable" @click="batchSave">批量保存</el-button>
    <el-button type="danger" @click="batchDelete">批量删除</el-button>
    <el-tree
      :data="menus"
      :props="defaultProps"
      :expand-on-click-node="false"
      show-checkbox
      node-key="catId"
      :default-expanded-keys="expandedkey"
      :draggable="draggable"
      :allow-drop="allowDrop"
      @node-drop="handleDrop"
      ref="menuTree"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button
            v-if="node.level <= 2"
            type="text"
            size="mini"
            @click="() => append(data)"
          >
            Append
          </el-button>

          <el-button type="text" size="mini" @click="() => editor(data)">
            editor
          </el-button>
          <el-button
            v-if="node.childNodes.length == 0"
            type="text"
            size="mini"
            @click="() => remove(node, data)"
          >
            Delete
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="category">
        <el-form-item label="分类名称">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="计量单位">
          <el-input
            v-model="category.productUnit"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  name:'Category',
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    return {
      pCid: [],
      draggable: false,
      updateNodes: [],
      maxLevel: 0,
      title: "", //打开对话框的提示
      dialogType: "", // edit 这个对话框是复用的 点击新增也会打开会话框 点击编辑也会打开对话框 为了区分
      category: {
        name: "",
        parentCid: 0,
        catLevel: 1,
        showStatus: 1,
        sort: 0,
        productCount: 0,
        catId: null,
        icon: "",
        productUnit: null,
      },
      dialogVisible: false,
      menus: [],
      expandedkey: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
    };
  },
  methods: {
    // 获得菜单数据
    getMenus() {
      this.$http({
        url: this.$http.adornUrl("/product/category/list/tree"),
        method: "get",
      }).then(({ data }) => {
        console.log("成功获取到菜单数据...", data.data);
        this.menus = data.data;
      });
    },
    //批量删除
    batchDelete() {
      let catIds = [];
      let checkNodes = this.$refs.menuTree.getCheckedNodes();
      console.log("被选中的nodes:", checkNodes);
      for (let i = 0; i < checkNodes.length; i++) {
        catIds.push(checkNodes[i].catId);
      }
      this.$confirm(`是否批量删除【${catIds}】?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/product/category/delete"),
            method: "post",
            data: this.$http.adornData(catIds, false),
          }).then(({ data }) => {
            this.$message({
              message: "批量删除成功！",
              type: "success",
            });
            this.getMenus();
          });
        })
        .catch(() => {});
    },
    //批量新增
    batchSave() {
      this.$http({
        url: this.$http.adornUrl("/product/category/update/sort"),
        method: "post",
        data: this.$http.adornData(this.updateNodes, false),
      }).then(({ data }) => {
        this.$message({
          message: "菜单顺序修改成功！",
          type: "success",
        });
        //删除成功以后重新发送请求刷新菜单
        this.getMenus();
        //设置需要默认展开的菜单
        this.expandedkey = this.pCid;
        //注意 用来保存页面数据元素的数据 应为页面没有刷新功能 操作完毕一般重制为空 防止出错
        this.updateNodes = [];
        this.maxLevel = 0;
        this.pCid = 0;
      });
    },
    //编辑
    editor(data) {
      console.log("要修改的数据", data);
      //点击编辑的时候打开的对话框
      this.dialogType = "editor";
      this.title = "修改分类";
      //设置为true 点击的时候弹出对话框
      this.dialogVisible = true;

      //为了防止别人也在修改页面 导致自己的页面不是最新的 保险起见还是重新发送请求
      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: "get",
        // params: this.$http.adornParams({}) 不用携带参数
      }).then(({ data }) => {
        // 请求成功以后在把最新的数据回显
        console.log("要回显的数据", data);
        //要修改的数据 回显到对话框
        this.category.name = data.data.name;
        //后段修改的时候是根据id进行修改的 所以还要把要修改的id传给后台
        this.category.catId = data.data.catId;
        this.category.icon = data.data.icon;
        this.category.productUnit = data.data.productUnit;
        this.category.parentCid = data.data.parentCid;
      });
    },
    // 新增对话框
    append(data) {
      console.log("append", data);
      //点击新增的时候打开的对话框
      this.dialogType = "append";
      this.title = "添加分类";
      this.dialogVisible = true;
      this.category.parentCid = data.catId;
      this.category.catLevel = data.catLevel * 1 + 1;
      this.category.name = "";
      this.category.catId = null;
      this.category.icon = "";
      this.category.productUnit = "";
      this.category.sort = 0;
      this.category.showStatus = 1;
    },
    //判断打开的会话框是要新增数据还是要修改数据 分别调用对应的方法
    submitData() {
      if (this.dialogType == "append") {
        this.addCategory();
      }
      if (this.dialogType == "editor") {
        this.editorCategory();
      }
    },
    //修改三级分类数据
    editorCategory() {
      var { catId, name, icon, productUnit } = this.category;
      var data = {
        catId: catId,
        name: name,
        icon: icon,
        productUnit: productUnit,
      };
      this.$http({
        url: this.$http.adornUrl("/product/category/update"),
        method: "post",
        data: this.$http.adornData(data, false),
      }).then(({ data }) => {
        //菜单修改成功以后干什么
        this.$message({
          message: "菜单修改成功！",
          type: "success",
        });
        //修改成功以后，关闭对话框
        this.dialogVisible = false;
        //修改成功后 刷新出新的菜单
        this.getMenus();
        //设置需要默认展开的菜单
        this.expandedkey = [this.category.parentCid];
      });
    },

    //添加三级分类
    addCategory() {
      console.log("提交的三级分类数据", this.category);
      this.$http({
        url: this.$http.adornUrl("/product/category/save"),
        method: "post",
        data: this.$http.adornData(this.category, false),
      }).then(({ data }) => {
        //保存成功以后干什么
        this.$message({
          message: "菜单保存成功！",
          type: "success",
        });
        //添加成功以后，关闭对话框
        this.dialogVisible = false;
        //添加成功后 刷新出新的菜单
        this.getMenus();
        //设置需要默认展开的菜单
        this.expandedkey = [this.category.parentCid];
      });
    },

    remove(node, data) {
      var ids = [data.catId];
      this.$confirm(`是否删除【${data.name}】?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/product/category/delete"),
            method: "post",
            data: this.$http.adornData(ids, false),
          }).then(({ data }) => {
            this.$message({
              message: "菜单删除成功！",
              type: "success",
            });
            //删除成功以后重新发送请求刷新菜单
            this.getMenus();
            //设置需要默认展开的菜单
            this.expandedkey = [node.parent.data.catId];
          });
        })
        .catch(() => {});

      console.log("remove", node, data);
    },

    //判断能否拖拽的函数
    allowDrop(draggingNode, dropNode, type) {
      //1、被拖动的节点以及所在的父节点总层数不能大于3

      //1、被拖动的当前节点总层数
      console.log("allowDrop", draggingNode, dropNode, type);

      this.countNodeLevel(draggingNode);
      //当前正在拖动的节点+父节点所在的深度不大于3即可
      let deep = Math.abs(this.maxLevel - draggingNode.level) + 1;
      console.log("深度：", deep);

      if (type == "inner") {
        // console.log(
        //   `this.maxLevel:${this.maxLevel}; draggingNode.data.catLevel:${draggingNode.data.catLevel};dropNode.level${dropNode.level}`
        // );
        return deep + dropNode.level <= 3;
      } else {
        return deep + dropNode.parent.level <= 3;
      }
    },
    countNodeLevel(node) {
      //找到所有子节点，求出最大深度
      if (node.childNodes != null && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].level > this.maxLevel) {
            this.maxLevel = node.childNodes[i].level;
          }
          this.countNodeLevel(node.childNodes[i]);
        }
      }
    },
    //拖拽以后触发的事件
    //draggingNode正在拖动哪个节点 dropNode 拖动到了哪个节点
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log("hadnleDrop: ", draggingNode, dropNode, dropType);
      //1.当前节点最新的父节点
      let pCid = 0;
      let siblings = null;
      //拖动到了dropNode前后 但是属于同一个层级 所以被拖动的节点的父ID应该是dropNode的父ID 在parent层级里面的data下
      if (dropType == "before" || dropType == "after") {
        pCid =
          dropNode.parent.data.catId == undefined
            ? 0
            : dropNode.parent.data.catId;
        siblings = dropNode.parent.childNodes;
      } else {
        //inner 就是拖动进了dropNode这个节点下 所以dropNode.data.catId就是原来被拖动进来的那个节点的父ID
        pCid = dropNode.data.catId;
        siblings = dropNode.childNodes;
      }
      this.pCid.push(pCid);

      //2.当前拖拽节点的最新顺序
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].data.catId == draggingNode.data.catId) {
          //如果遍历循环的是当前正在拖拽的节点
          let catLevel = draggingNode.level;
          if (siblings[i].level != draggingNode.level) {
            //说明当前层级发生了变化
            if (dropType == "before" || dropType == "after") {
              //当前节点的层级发生变化
              catLevel = siblings[i].level;
              //修改他子节点的层级
              this.updateChildNodeLevel(siblings[i]);
            }
          }
          this.updateNodes.push({
            catId: siblings[i].data.catId,
            sort: i,
            parentCid: pCid,
            catLevel: catLevel,
          });
        } else {
          this.updateNodes.push({ catId: siblings[i].data.catId, sort: i });
        }
      }

      //3.当前拖拽节点的最新层级
      console.log("updateNodes", this.updateNodes);
    },
    //递归方法修改子节点的层级
    updateChildNodeLevel(node) {
      if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          var cNode = node.childNodes[i].data;
          this.updateNodes.push({
            catId: cNode.catId,
            catLevel: node.childNodes[i].level,
          });
          this.updateChildNodeLevel(node.childNodes[i]);
        }
      }
    },
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合

  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getMenus();
  },
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