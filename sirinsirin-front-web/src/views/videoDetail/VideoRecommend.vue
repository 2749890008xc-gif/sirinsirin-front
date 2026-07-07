<template>
  <template v-for="item in dataList">
    <VideoItem :data="item" :layoutType="1" :marginTop="20"></VideoItem>
  </template>
</template>

<script setup>
import {ref, getCurrentInstance, nextTick, onMounted, onUnmounted, provide, inject} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 路由跳转实例

const videoInfo = inject("videoInfo");
const dataList = ref([]);
const loadDataList = async () => {
  let result = await proxy.Request({
    url: proxy.Api.getVideoRecommend,
    params: {
      keyword: videoInfo.value.videoName,
      videoId: videoInfo.value.videoId,
    },
  });
  if(!result){
    return;
  }
  dataList.value = result.data;
};
loadDataList();
</script>

<style scoped lang="scss">

</style>