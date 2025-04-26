<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { userRegisterService, userLoginService } from '@/api/user'
import { useUserStore } from '@/stores/main'
import { useRouter } from 'vue-router'

const isRegister = ref(false) // 是否注册，默认false表示登录，true表示注册
const form = ref()
// 整个的用于提交的表单数据对象
const formModel = ref({
  username: '',
  password: '',
  repassword: ''
})
// 整个表单的校验规则，因为无需是响应式，所以配置一个普通对象就行
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }, // required: true表示非空，message表示提示信息，trigger表示触发方式，blur即失去焦点
    { min: 3, max: 10, message: '长度在3到10个字符之间', trigger: 'blur' } // 长度校验
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是6~15位非空字符',
      trigger: 'blur'
    } // 正则校验
  ],
  repassword: [
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是6~15位非空字符',
      trigger: 'blur'
    },
    // 自定义校验，validator后跟函数为自定义校验的逻辑
    // rule为当前校验的规则，value为当前校验的值，callback为校验结果的回调函数，callback(new Error('提示信息'))表示校验失败，callback()表示校验成功
    // 无论成功还是失败都要调用callback函数
    {
      validator: (rule, value, callback) => {
        if (value !== formModel.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 切换的时候，清空表单数据
watch(isRegister, () => {
  formModel.value.username = ''
  formModel.value.password = ''
  formModel.value.repassword = ''
})

const register = async () => {
  // 注册成功之前，先再次进行统一校验，校验成功 => 发起注册请求，校验失败 => 自动提示用户
  await form.value.validate()
  await userRegisterService(formModel.value)
  ElMessage.success('注册成功') // 注册请求成功后，代码就会继续往下走
  isRegister.value = false
}

const userStore = useUserStore()
const router = useRouter()
const login = async () => {
  // 登录成功之前，先再次进行统一校验，校验成功 => 发起登录请求，校验失败 => 自动提示用户
  await form.value.validate()
  // 登录请求
  const res = await userLoginService(formModel.value)
  userStore.setToken(res.data.token)
  ElMessage.success('登录成功') // 登录请求成功后，代码就会继续往下走
  router.push('/')
}
</script>

<template>
  <!--
  1. 结构相关：
    el-row表示一行，一行分成24份
    el-col表示一列，:span表示占据的份数，:span="12"表示占据12份，即50%
    :offset表示偏移的份数，:offset="3"表示偏移3份，即左边留出3份的空白

    el-form表示整个表单组件，ref="form"表示给表单一个引用名，可以在js中通过this.$refs.form来访问
    el-form-item表示表单项，即表单的一行，size="large"表示表单项的大小，autocomplete="off"表示关闭自动补全

  2. 校验相关：
    el=form => :model="ruleForm" 绑定的整个form的数据对象  { xxx, xxx, xxx}
    el=form => :rules="rules" 绑定的整个form的校验规则对象 { xxx, xxx, xxx} 分别对应上面每个数据的校验规则
    表单元素 => v-model="ruleForm.xxx" 给表单元素绑定form的子属性
    el-form-item => prop配置生效的是哪个校验规则（和rules中的字段对应）,要在el-form-item的属性中配置
  -->
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <el-form
        :model="formModel"
        :rules="rules"
        ref="form"
        size="large"
        autocomplete="off"
        v-if="isRegister"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            v-model="formModel.repassword"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入再次密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="register"
            class="button"
            type="primary"
            auto-insert-space
          >
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = false">
            ← 返回
          </el-link>
        </el-form-item>
      </el-form>
      <el-form
        :model="formModel"
        :rules="rules"
        ref="form"
        size="large"
        autocomplete="off"
        v-else
      >
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="login"
            class="button"
            type="primary"
            auto-insert-space
            >登录</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = true">
            注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;
  .bg {
    background:
      url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
      url('@/assets/login_bg.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
