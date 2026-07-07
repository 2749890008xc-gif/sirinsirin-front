<template>
  <div class="data-list">
    <DataLoadMoreList
        :dataSource="dataSource"
        :loading="loadingData"
        @loadData="loadDataList"
    >
      <template #default="{data}">
        <VideoItem :data="data"></VideoItem>
      </template>
    </DataLoadMoreList>
  </div>
</template>

<script setup>
import {ref, getCurrentInstance, watch} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute } from "vue-router";
const route = useRoute();
import { useCategoryStore } from "@/stores/categoryStore.js";
const categoryStore = useCategoryStore();

// 🔥 修复1：初始化完整分页对象（避免undefined）
const dataSource = ref({
  list: [],
  pageNo: 1,
  pageTotal: 0
});
const loadingData = ref(false);

// 🔥 修复2：必须使用子组件传递的 pageNo 参数！！！
const loadDataList = async (pageNo = 1) => {
  // 分页参数 = 子组件传过来的页码（核心修复）
  const currentPage = pageNo;

  // 切换分类/重置：清空列表
  if (currentPage === 1) {
    dataSource.value.list = [];
  }

  let params = {
    pageNo: currentPage, // 🔥 用传递的参数，不是旧的dataSource.pageNo
  };
  Object.assign(params, categoryIdInfo.value);

  loadingData.value = true;
  let result = await proxy.Request({
    url: proxy.Api.loadVideo,
    params,
  }).catch(err => {
    console.error('请求失败', err);
    loadingData.value = false;
  });

  if(!result || !result.data) {
    loadingData.value = false;
    return;
  }

  const res = result.data;
  // 赋值分页信息
  dataSource.value.pageNo = res.pageNo;
  dataSource.value.pageTotal = res.pageTotal;
  // 加载更多：拼接数据；首次加载：直接赋值
  if (res.pageNo > 1) {
    dataSource.value.list = [...dataSource.value.list, ...res.list];
  } else {
    dataSource.value.list = res.list || [];
  }

  loadingData.value = false;
};

const categoryMap = categoryStore.categoryMap;
const categoryIdInfo = ref({});
const convertCode2Id = (pCategoryCode, categoryCode) => {
  let pCategoryId = pCategoryCode ? (categoryMap[pCategoryCode]?.categoryId || "") : "";
  let categoryId = categoryCode ? (categoryMap[categoryCode]?.categoryId || "") : "";
  categoryIdInfo.value = { pCategoryId, categoryId };
};

const initData = () => {
  convertCode2Id(route.params.pCategoryCode, route.params.categoryCode);
  loadDataList(1);
};

const categoryInit = ref(false);
watch(
    () => route.params,
    (newVal) => {
      if (newVal && categoryInit.value) {
        categoryStore.setCurrentPCategory(route.params.pCategoryCode);
        initData();
      }
    },
    { immediate: true, deep: true }
);

watch(
    () => categoryStore.categoryMap,
    (newVal) => {
      if (newVal && Object.keys(newVal).length) {
        categoryInit.value = true;
        categoryStore.setCurrentPCategory(route.params.pCategoryCode);
        initData();
      }
    },
    { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>

</style>