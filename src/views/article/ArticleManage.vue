<script setup>
import { ref } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import ChannelSelect from './components/ChannelSelect.vue'
import ArticleEdit from './components/ArticleEdit.vue'
import { artGetListService } from '@/api/article.js'
import { formatTime } from '@/utils/format.js'

const loading = ref(false) // loading状态

// 删除逻辑
const onDeleteArticle = (row) => {
  console.log(row)
}

const articleEditRef = ref(null) // 编辑文章的抽屉组件
// 添加文章逻辑
const onAddArticle = () => {
  articleEditRef.value.open({})
}
// 编辑文章逻辑
const onEditArticle = (row) => {
  articleEditRef.value.open(row)
}

// 搜索逻辑
const onSearch = () => {
  params.value.pagenum = 1 // 搜索时，当前页码重置为1
  getArticleList()
}

// 重置逻辑
const onReset = () => {
  // 重置表单
  params.value.pagenum = 1
  params.value.cate_id = ''
  params.value.state = ''
  // 重置数据
  getArticleList()
}

// 定义请求参数对象
const params = ref({
  pagenum: 1, // 当前页码
  pagesize: 5, // 每页条数
  cate_id: '', // 文章分类
  state: '' // 发布状态
})

// 基于params参数，获取文章列表
const articleList = ref([])
const total = ref(0) // 文章总条数
const getArticleList = async () => {
  // 这里需要传入请求参数对象
  loading.value = true

  const res = await artGetListService(params.value)
  articleList.value = res.data.data
  total.value = res.data.total

  loading.value = false
}
getArticleList()

// 处理分页逻辑
const onSizeChange = (size) => {
  // 每页条数变化时触发
  // 只要是每页条数变化了，那么原本正在访问的当前页意义不大了，数据大概率已经不在原来那一页了
  // 重新从第一页渲染即可
  params.value.pagesize = size
  // 基于最新的当前页 和 每页条数，渲染数据
  getArticleList()
}
const onCurrentChange = (page) => {
  // 当前页码变化时触发
  params.value.pagenum = page
  getArticleList()
}

// 添加或者编辑成功后，触发的函数
const onSuccess = (type) => {
  // type: add / edit
  // 添加或者编辑成功后，重新渲染数据
  if (type === 'add') {
    // 如果是添加，最好渲染最后一页
    const totalPage = Math.ceil((total.value + 1) / params.value.pagesize) // 得到总页数，即最后一页
    params.value.pagenum = totalPage // 当前页码重置为最后一页
    getArticleList()
  } else {
    // 如果是编辑，直接重新渲染当前页即可
    getArticleList()
  }
}
</script>

<template>
  <page-container title="文章管理">
    <template #extra>
      <el-button type="primary" @click="onAddArticle">添加文章</el-button>
    </template>

    <!-- 表单部分 -->
    <el-form inline>
      <el-form-item label="文章分类：">
        <!-- Vue2 => v-model 是 :value 和 @input 的简写 -->
        <!-- Vue3 => v-model 是 :modelValue 和 @update:modelValue 的简写 -->
        <ChannelSelect v-model="params.cate_id" width="150px"></ChannelSelect>
        <!-- Vue3语法中 => v-model:cid 等价于 :cid 和 @update:cid 的简写 -->
        <!-- <channel-select v-model:cid="params.cate_id"></channel-select> 子组件的props就不用modelValue接收而是用cid-->
      </el-form-item>

      <el-form-item label="发布状态：">
        <!-- 这里后台标记发布状态，就是通过中文标记的，已发布 / 草稿 -->
        <el-select
          v-model="params.state"
          placeholder="请选择"
          style="width: 150px"
        >
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格部分 -->
    <el-table :data="articleList" style="width: 100%" v-loading="loading">
      <el-table-column label="文章标题" prop="title">
        <template #default="{ row }">
          <el-link type="primary" :underline="false">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="cate_name"></el-table-column>
      <el-table-column label="发表时间" prop="pub_date">
        <!-- 因为要对日期格式处理，所以不能直接使用prop="pub_date" 得到的数据 -->
        <!-- 自定义数据的话可以用作用域插槽实现 -->
        <template #default="{ row }">
          {{ formatTime(row.pub_date) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="state"></el-table-column>
      <!-- 利用作用域插槽 row 可以获取当前行的数据 => v-for 遍历 item -->
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button
            type="primary"
            plain
            circle
            :icon="Edit"
            @click="onEditArticle(row)"
          ></el-button>
          <el-button
            type="danger"
            plain
            circle
            :icon="Delete"
            @click="onDeleteArticle(row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页部分 -->
    <!-- v-model:current-page ：当前页、v-model:page-size ：每页条数 、:page-sizes ：用户可供选择的每页条数 、layout ：下方显示的工具栏-->
    <!-- @size-change ：每页展示条数变化时触发 、@current-change ：当前页码变化时触发-->
    <el-pagination
      v-model:current-page="params.pagenum"
      v-model:page-size="params.pagesize"
      :page-sizes="[2, 3, 5, 10]"
      :background="true"
      layout="jumper, total, sizes, prev, pager, next,"
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <!-- 编辑文章的抽屉组件 -->
    <ArticleEdit ref="articleEditRef" @success="onSuccess"></ArticleEdit>
  </page-container>
</template>
