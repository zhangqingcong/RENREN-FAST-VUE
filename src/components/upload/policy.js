import http from '@/utils/httpRequest.js'
// es6语法 按需导出
export function policy () {
  // 返回一个异步对象
  return new Promise((resolve, reject) => {
    // 这里的http就是封装的axios 返回值吗 调用以后会返回一个promise对象 所以可以继续调用.then()方法
    http({
      url: http.adornUrl('/thirdparty/oss/policy'),
      method: 'get',
      params: http.adornParams({})
       /*
       axios 在请求到数据之后，在真正的数据之外，套了一层壳
       {
         //从服务器返回的http状态文本
         config: {},
         data: {真实的数据},
         request: {},
         status:xxx,
         statusText:""
        }
       */
    }).then(({ data }) => {
      resolve(data)
    })
  })
}
// import http from '@/utils/httpRequest.js'
// export function policy () {
//   return new Promise((resolve, reject) => {
//     http({
//       url: http.adornUrl('/thirdparty/oss/policy'),
//       method: 'get',
//       params: http.adornParams({})
//     }).then(({ data }) => {
//       resolve(data)
//     })
//   })
// }
