<template>
  <!-- 品牌的级联搜索 抽成公共的组建以供复用 
使用说明：
1）、引入category-cascader.vue
2）、语法：<category-cascader :catelogPath.sync="catelogPath"></category-cascader>
    解释：
      catelogPath：指定的值是cascader初始化需要显示的值，应该和父组件的catelogPath绑定;
          由于有sync修饰符，所以cascader路径变化以后自动会修改父的catelogPath，这是结合子组件this.$emit("update:catelogPath",v);做的    
-->
  <div>
    <el-cascader
      filterable
      clearable
      placeholder="试试搜索：手机"
      v-model="paths"
      :options="categorys"
      :props="setting"
    ></el-cascader>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
export default {
  name:'CategoryCascader',
  //component引入的参数要在这里进行注册才能使用
  component: {},
  //props是组件之间进行通信的用来接受父组件传来的值
  props: {
    catelogPath: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  //存放数据的地方
  data() {
    return {
      setting: {
        value: "catId",
        label: "name",
        children: "children",
      },
      categorys: [],
      paths: this.catelogPath,
    };
  },
  watch: {
    catelogPath(v) {
      this.paths = this.catelogPath;
    },
    paths(v) {
      this.$emit("update:catelogPath", v);
      //还可以使用pubsub-js进行传值
      this.PubSub.publish("catPath", v);
    },
  },
  //方法合集
  methods: {
    getCategorys() {
      this.$http({
        url: this.$http.adornUrl("/product/category/list/tree"),
        methods: "get",
      }).then(({ data }) => {
        this.categorys = data.data;
      });
    },
  },

  //生命周期-创建完成 可以访问当前this实例
  created() {
    this.getCategorys();
  },
};
</script>

<style scoped>
</style>