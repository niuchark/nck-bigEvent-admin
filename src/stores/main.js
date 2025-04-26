import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persist) // 对创建出来的Pinia实例使用持久化插件

export default pinia

// 将仓库里的模块统一导出
// 麻烦写法：
// import { useUserStore } from './modules/user'
// export { useUserStore }
export * from './modules/user' // 接收所有user模块的按需导出，此行等价于上面两行
