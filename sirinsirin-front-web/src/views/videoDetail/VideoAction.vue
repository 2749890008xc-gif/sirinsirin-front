<template>
  <div class="action-panel">
    <div
        :class="[
          'iconfont icon-like-solid',
          videoInfo.likeCountActive ? 'active' : '',
        ]"
        @click="userAction('VIDEO_LIKE')"
    >
      &nbsp;{{videoInfo.likeCount}}
    </div>
    <div
        :class="[
          'iconfont icon-toubi',
          videoInfo.coinCountActive ? 'active' : '',
        ]"
        @click="userActionCoin('VIDEO_COIN')"
    >
      &nbsp;{{videoInfo.coinCount}}
    </div>
    <div
        :class="[
          'iconfont icon-collection-solid',
          videoInfo.collectCountActive ? 'active' : '',
        ]"
        @click="userAction('VIDEO_COLLECT')"
    >
      &nbsp;{{videoInfo.collectCount}}
    </div>
  </div>
  <VideoCoin ref="videoCoinRef"></VideoCoin>
</template>

<script setup>
import VideoCoin from "./VideoCoin.vue";
import { ACTION_TYPE } from "@/utils/Constants";
import { doUserAction } from "@/utils/Api.js";
import {ref, getCurrentInstance, nextTick, onMounted, onUnmounted, provide, inject, computed} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 路由跳转实例

import { useLoginStore } from "@/stores/loginStore";
import VueCookies from "vue-cookies";
const loginStore = useLoginStore();

const isLoginValid = computed(() => {
  const hasUser = Object.keys(loginStore.userInfo).length > 0
  const token = VueCookies.get('token')
  return hasUser && !!token
})
const videoInfo = inject("videoInfo");
const userAction = (type) => {
  if(!isLoginValid.value) {
    loginStore.setLogin(true);
    return;
  }
  doUserAction({
    videoId: route.params.videoId,
    actionType: ACTION_TYPE[type].value,
  }, () => {
    if(type === "VIDEO_LIKE"){
      //  若数据库中有记录 -> 取消点赞
      if(videoInfo.value.likeCountActive){
        videoInfo.value.likeCountActive = false;
        videoInfo.value.likeCount--;
        //  无记录 -> 进行点赞
      }else{
        videoInfo.value.likeCountActive = true;
        videoInfo.value.likeCount++;
      }
    }else if(type === "VIDEO_COLLECT"){
      //  若数据库中有记录 -> 取消收藏
      if(videoInfo.value.collectCountActive){
        videoInfo.value.collectCountActive = false;
        videoInfo.value.collectCount--;
        //  无记录 -> 进行收藏
      }else{
        videoInfo.value.collectCountActive = true;
        videoInfo.value.collectCount++;
      }
    }
  });
};

const videoCoinRef = ref();
const userActionCoin = () => {
  if(!isLoginValid.value) {
    loginStore.setLogin(true);
    return;
  }
  if(videoInfo.value.coinCountActive){
    proxy.Message.warning("对本稿件的投币次数已用完");
    return;
  }
  videoCoinRef.value.show();
};

</script>

<style scoped lang="scss">
.action-panel {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e3e5e7;
  padding: 20px 0;
  .iconfont {
    cursor: pointer;
    color: #61666d;
    display: flex;
    align-items: center;
    margin-right: 40px;
    //line-height: 5px; //  这个可以缩小点赞、收藏、投币图标的行高
    &::before {
      //margin-bottom: 10px;  //  该属性会导致点赞、收藏投币数的文字偏下
      font-size: 30px;
    }
    &:hover {
      color: #4d4e4f;
    }
  }
  .active {
    &::before {
      color: var(--blue);
    }
  }
}
</style>