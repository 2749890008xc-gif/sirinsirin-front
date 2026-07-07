<template>
  <div class="my-video-list-title" v-if="seriesList.length > 0">
    <router-link class="title" :to="`/user/${route.params.userId}/series`">我的视频列表</router-link>
    <span
        class="iconfont icon-add op-btn new-btn"
        @click="showVideoSeries"
        v-if="myself"
    >新建</span>
  </div>
  <div class="part-item" v-for="item in seriesList">
    <div class="part-title">
      <div class="title-panel">
        <router-link
            class="title"
            :to="`/user/${route.params.userId}/series/${item.seriesId}`"
        >{{ item.seriesName }}
        </router-link>
        <div class="count-info">{{ item.videoInfoList.length }}</div>
      </div>
      <router-link
          class="op-btn"
          :to="`/user/${route.params.userId}/series/${item.seriesId}`"
      >更多&gt;</router-link>
    </div>
    <div class="video-list5">
      <VideoItem :data="video" v-for="video in item.videoInfoList"></VideoItem>
    </div>
  </div>
  <VideoSeriesEdit
      ref="videoSeriesEditRef"
      @reload="loadSeriesList"
  ></VideoSeriesEdit>
</template>

<script setup>
import VideoItem from "./VideoItem.vue";
import {ref, reactive, getCurrentInstance, nextTick, computed} from "vue"
import { useRouter, useRoute } from "vue-router"
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
import { useLoginStore } from "@/stores/loginStore.js";
import VideoSeriesEdit from "@/views/userhome/VideoSeriesEdit.vue";
const loginStore = useLoginStore();

//  判断是否是本人
const myself = computed(() => {
  return loginStore.userInfo.userId == route.params.userId;
});

const seriesList = ref([]);
const loadSeriesList = async () => {
  let result = await proxy.Request({
    url: proxy.Api.uHomeSeriesLoadVideoSeriesWithVideo,
    params: {
      userId: route.params.userId,
    },
  });
  if (!result) {
    return;
  }
  seriesList.value = result.data;
};

loadSeriesList();

const videoSeriesEditRef = ref();
const showVideoSeries = () => {
  videoSeriesEditRef.value.show();
}
</script>

<style scoped lang="scss">
.my-video-list-title {
  margin-top: 15px;
  .title {
    text-decoration: none;
    color: var(--text);
    font-size: 16px;
  }
  .new-btn {
    margin-left: 10px;
    padding: 5px 10px;
    cursor: pointer;
  }
}

.part-title {
  .title-panel {
    .title {
      font-size: 15px;
    }
  }
}
</style>