import Vue from 'vue'
import App from '@/App'
import router from '@/router'                 // api: https://github.com/vuejs/vue-router
import store from '@/store'                   // api: https://github.com/vuejs/vuex
import VueCookie from 'vue-cookie'            // api: https://github.com/alfhen/vue-cookie
import '@/element-ui'                         // api: https://github.com/ElemeFE/element
import '@/icons'                              // api: http://www.iconfont.cn/
import '@/element-ui-theme'
import '@/assets/scss/index.scss'
import httpRequest from '@/utils/httpRequest' // api: https://github.com/axios/axios
import { isAuth } from '@/utils'
import cloneDeep from 'lodash/cloneDeep'
import PubSub from 'pubsub-js'

Vue.use(VueCookie)
Vue.config.productionTip = false

// 非生产环境, 适配mockjs模拟数据                 // api: https://github.com/nuysoft/Mock
if (process.env.NODE_ENV !== 'production') {
  require('@/mock')
}

// 挂载全局
// Vue.prototype.$http  $http 是自定义的 在Vue中 可以把每个组建看成是一个new Vue()实例
// 之所以叫$http大概是参考了jQuery的命名方式
// httpRequest是axios的封装 axios是Ajax的封装 在每个Vue实例中都有可能发起http的get post请求
// 需要在每个组件中import axios/Ajax 那样比较麻烦 我们直接把封装的axios httpRequest挂载到全局上
// 每个Vue实例都可以通过this.$http的方式向服务端发起请求 而且还可以在httpRequest中封装常用的对请求参数
// 返回参数的处理 拦截 比如给get请求添加t参数时间戳
// Vue.prototype.$http = httpRequest // ajax请求方法
// 但是 把axios挂载到Vue原型上，又一个缺点就是不利于API接口的复用
Vue.prototype.$http = httpRequest
Vue.prototype.isAuth = isAuth     // 权限方法
Vue.prototype.PubSub = PubSub

// 保存整站vuex本地储存初始状态
window.SITE_CONFIG['storeState'] = cloneDeep(store.state)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
