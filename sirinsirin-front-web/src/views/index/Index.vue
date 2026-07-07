<template>
  <!-- 首页推荐 -->
  <div class="commend-panel">
    <div
      class="carousel-panel"
      :style="{
        width: carouselWidth + 'px',
        height: carouselWidth * 0.6 + 'px'
    }">
      <el-carousel
          :height="carouselWidth * 0.6 + 'px'"
          indicator-position="none"
          arrow="never"
          @change="carouselChange"
          ref="carouselRef"
      >
        <el-carousel-item
            v-for="(item, index) in carouselVideoList"
            :key="item"
            :name="index + ''"
        >
          <div class="roll-image">
            <router-link :to="`/video/${item.videoId}`" target="_blank">
              <img :src="`${proxy.Api.sourcePath}${item.videoCover}`">
            </router-link>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div class="carousel-bottom" v-if="carouselVideoList.length > 0">
        <div class="name-op">
          <router-link
              class="video-name"
              :to="`/video/${carouselVideoList[carouselIndex]?.videoId || ''}`"
              target="_blank"
          >
            {{carouselVideoList[carouselIndex]?.videoName || '暂无视频名称'}}
          </router-link>
          <div class="change-btn">
            <span class="iconfont icon-right" @click="preCarousel"></span>
            <span class="iconfont icon-left" @click="nextCarousel"></span>
          </div>
        </div>
        <div class="dtos">
          <div
              :class="['dto-item', carouselIndex == item - 1 ? 'active' : '']"
              v-for="item in carouselVideoList.length"
              @click="setCarousel(item)"
          ></div>
        </div>
      </div>
    </div>
    <div class="video-list">
      <div v-for="item in commendVideoList">
        <VideoItem :data="item"></VideoItem>
      </div>
    </div>
  </div>

  <!-- 首页视频列表 -->
  <VideoList></VideoList>
</template>

<script setup>
import VideoList from "@/views/videoList/VideoList.vue";
import { mitter } from "@/eventbus/eventBus.js";
import {ref, reactive, getCurrentInstance, nextTick, computed, onMounted, onUnmounted} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import { useNavAction } from "@/stores/navActionStore.js";
const navActionStore = useNavAction();  // 导航栏状态仓库，用于存放导航栏状态信息

const carouselWidth = ref();

const carouselMaxCount = proxy.carouselMaxCount;
const carouselVideoList = ref([]);
const commendVideoList = ref([]);
const loadRecommendVideo = async () => {
  let result = await proxy.Request({
    url: proxy.Api.loadRecommendVideo,
  });
  if(!result){
    return;
  }

  const allCommendVideoList = result.data;
  if(allCommendVideoList.length > carouselMaxCount){  //  若推荐的视频数量大于设置的轮播图数量上限，就截取一部视频放到轮播图右侧
    carouselVideoList.value = allCommendVideoList.slice(0, carouselMaxCount);
    commendVideoList.value = allCommendVideoList.slice( //  右侧部分最多容纳6个视频
        carouselMaxCount,
        carouselMaxCount + 6
    );
  }else{
    carouselVideoList.value = allCommendVideoList;
  }
};
loadRecommendVideo();

const carouselIndex = ref(0);

const carouselChange = (e) => {
  carouselIndex.value = e;
};

const resetCarouselWidth = () => {
  let width = (document.documentElement.clientWidth - proxy.bodyPadding * 2) * 0.4218;
  if(width < 400){
    width = 400;
  }
  carouselWidth.value = width;
};

const carouselRef = ref();
const preCarousel = () => {
  carouselRef.value.prev();
}
const nextCarousel = () => {
  carouselRef.value.next();
}

const setCarousel = (index) => {
  carouselRef.value.setActiveItem(index - 1 + "");
}

onMounted(() => {
  mitter.on("windowResize", () => {
    resetCarouselWidth();
  });
  resetCarouselWidth();

  navActionStore.setShowHeader(true);
  navActionStore.setFixedHeader(true);
  navActionStore.setShowCategory(true);
  navActionStore.setFixedCategory(true);
  navActionStore.setForceFixedHeader(false);
});

onUnmounted(() => {
  mitter.off("windowResize");
});
</script>

<style scoped lang="scss">
.commend-panel {
  display: flex;
  margin-top: 20px;
  .carousel-panel {
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    .roll-image {
      position: relative;
      background: #e9e9e9;
      text-align: center;
      a {
        display: block;
      }
      img {
        max-width: 100%;
      }
    }
    .carousel-bottom {
      position: absolute;
      bottom: 0px;
      width: 100%;
      height: 65px;
      //background: linear-gradient(to top, #646464, #8e8e8e);
      background: rgba(0, 0, 0, 0.6);
      padding: 10px;
      .name-op {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .video-name {
          flex: 1;
          color: #fff;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
        }

        .change-btn {
          margin-left: 10px;
          width: 60px;
          display: flex;
          justify-content: space-between;

          .iconfont {
            cursor: pointer;
            text-align: center;
            width: 25px;
            line-height: 25px;
            font-size: 20px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            color: #fff;
          }
        }
      }
      .dtos {
        display: flex;
        margin-top: 5px;
        align-items: center;
        .dto-item {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #b0b0b0;
          cursor: pointer;
          margin-right: 10px;
        }
        .active {
          width: 15px;
          height: 15px;
          background: #fff;
        }
      }
    }
  }
  .video-list {
    margin-left: 10px;
    flex: 1;
    display: grid;
    grid-gap: 20px;
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>