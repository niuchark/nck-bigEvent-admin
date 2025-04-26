import axios from 'axios'
import { useUserStore } from '@/stores/main'
import { ElMessage } from 'element-plus'
import router from '@/router'

const baseURL = 'http://big-event-vue-api-t.itheima.net'

const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL,
  timeout: 5000
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // TODO 2. 携带token
    const userStore = useUserStore()
    const { token } = userStore
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    // TODO 3. 处理业务失败
    // TODO 4. 摘取核心响应数据
    if (res.data.code === 0) {
      return res
    }
    // 业务失败，则给出提示，并且抛出错误
    ElMessage.error(res.data.message || '服务器繁忙')
    return Promise.reject(new Error(res.data))
  },
  (err) => {
    // TODO 5. 处理401错误 （错误的特殊情况，401即权限不足 或者 token过期，应该拦截到登陆）
    if (err.response?.status === 401) {
      // a?.b 相当于 a && a.b ? a.b : undefined 即 如果a存在则返回a.b，否则返回undefined
      router.push('/login')
    }

    // 错误的默认情况
    ElMessage.error(err.response.data.message || '服务器繁忙')
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
