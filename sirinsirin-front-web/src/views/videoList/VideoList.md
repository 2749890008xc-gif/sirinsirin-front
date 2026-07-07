以下是VideoList.vue的源代码：

<template>
  <div class="data-list">
    <!-- 数据被DataLoadMoreList.vue的 “<template v-for="item in dataSource.list">” 代码接收 -->
    <!-- 当页面滚动到底部时就调用“lodaDataList()” -->
    <DataLoadMoreList
      :dataSource="dataSource"
      :loading="loadingData"
      @loadData="loadDataList"
    >
      <template #default="{data}">
        <VideoItem :data="data"></VideoItem>  <!-- data的数据被DataLoadMoreList.vue的 “<slot :data="item"></slot>” 代码接收 -->
      </template>
    </DataLoadMoreList>
  </div>
</template>

<script setup>
import {ref, reactive, getCurrentInstance, nextTick, computed, onMounted, onUnmounted, watch} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import { useCategoryStore } from "@/stores/categoryStore.js";
const categoryStore = useCategoryStore(); //  分类信息放到了categoryStore里面

const dataSource = ref({});
const loadingData = ref(false);

const loadDataList = async () => {
  let params = {
    pageNo: dataSource.value.pageNo,  //  从DataLoadMoreList.vue中的 “props.dataSource.pageNo++;” 代码处获得数据
  };
  Object.assign(params, categoryIdInfo.value);
  loadingData.value = true;
  let result = await proxy.Request({
    url: proxy.Api.loadVideo,
    params,
  });
  loadingData.value = false;
  if(!result) {
    return;
  }
  const dataList = dataSource.value.list;
  dataSource.value = Object.assign({}, result.data);
  // dataSource.value.list = [];  //  用于测试数据库没有视频可显示时的语句
  // dataSource.value.list.pageNo = 2;  //  用于测试所有视频已经显示完成后的语句
  if(result.data.pageNo > 1) {
    dataSource.value.list = dataList.concat(result.data.list);
  }
};

const categoryMap = categoryStore.categoryMap;
const categoryIdInfo = ref({});
const convertCode2Id = (pCategoryCode, categoryCode) => {
  let pCategoryId = "";
  let categoryId = "";
  if(pCategoryCode){
    pCategoryId = categoryMap[pCategoryCode]
        ? categoryMap[pCategoryCode].categoryId
        : "";
  }
  if(categoryCode){
    categoryId = categoryMap[categoryCode]
        ? categoryMap[categoryCode].categoryId
        : "";
  }
  categoryIdInfo.value = {
    pCategoryId,
    categoryId,
  };
};

const initData = () => {
  convertCode2Id(route.params.pCategoryCode, route.params.categoryCode);
  loadDataList();
};
const categoryInit = ref(false);
watch(  //  点击分类切换路由时执行该方法
    () =>route.params,
    (newVal, oldVal) => {
      if(newVal){
        if(!categoryInit.value){
          return;
        }
        categoryStore.setCurrentPCategory(route.params.pCategoryCode);
        initData();
      }
    },
    { immediate: true, deep: true },
);

watch(  //  刷新页面时执行该方法
    () => categoryStore.categoryMap,
    (newVal, oldVal) => {
      if(!newVal || Object.keys(newVal).length == 0){
        return;
      }
      categoryInit.value = true;
      categoryStore.setCurrentPCategory(route.params.pCategoryCode);
      initData();
    },
    { immediate: true, deep: true },
);

</script>

<style lang="scss" scoped>

</style>