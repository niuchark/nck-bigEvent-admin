<script setup>
import zh from 'element-plus/es/locale/lang/zh-cn.mjs'
</script>

<template>
  <el-config-provider :locale="zh" :size="size">
    <router-view></router-view>
  </el-config-provider>
</template>

<style scoped></style>
