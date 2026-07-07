<template>
  <div class="category-video-body">
    <div :class="['category-list', categoryFixied ? 'category-fixed' : '']" id="category-list">
      <div class="category-title">
        {{categoryStore.currentPCategory.categoryName}}
      </div>
      <!-- 如果无categoryCode，点击跳转到分类首页 -->
      <div
          :class="['category-item', !route.params.categoryCode ? 'active' : '']"
          @click="jump()"
      >首页</div>
      <!-- 遍历父分类的子分类，匹配路由参数时高亮 -->
      <div
          :class="[
              'category-item',
              route.params.categoryCode == item.categoryCode ? 'active' : '',
          ]"
          v-for="item in categoryStore.currentPCategory.children"
          @click="jump(item)"
      >
        {{item.categoryName}}
      </div>
    </div>
    <VideoList></VideoList>
  </div>
</template>

<script setup>
import VideoList from './VideoList.vue';
import {ref, reactive, getCurrentInstance, nextTick, computed, onMounted, onUnmounted} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 路由跳转实例

import { mitter } from  "@/eventbus/eventBus.js";
import { useCategoryStore } from "@/stores/categoryStore.js";
const categoryStore = useCategoryStore(); //  分类信息放到了categoryStore里面

import { useNavAction } from "@/stores/navActionStore.js";
const navActionStore = useNavAction();  // 导航栏状态仓库，用于存放导航栏状态信息

// 分类跳转函数
const jump = (item = {categoryCode: ""}) => {
  // 如果无categoryCode：跳转到分类首页（categoryVideo路由）
  if(!item.categoryCode){
    router.push({
      name: "categoryVideo",
    });
    return;
  }
  // 有categoryCode：跳转到子分类页（subCategoryVideo路由，带参数）
  router.push({
    name: "subCategoryVideo",
    params: {
      categoryCode: item.categoryCode,
    },
  });
};

// 响应式变量：控制分类栏固定/滚动方向/滚动阈值
const categoryFixied = ref(false);  // 分类栏是否固定
const categoryTopDistance = ref(200);  // 分类栏初始顶部距离（滚动阈值）

let initScrollTop = 0;  // 上一次滚动位置（非响应式，仅用于对比）
let scrollDown = true;  // 是否向下滚动

const scrollHandler = (curScrollTop) => {
  categoryFixied.value = true;
  // 判断滚动方向：如果：当前滚动位置 - 上一次 > 0 则 向下滚动
  if(curScrollTop - initScrollTop > 0){
    scrollDown = true;
  }else{
    scrollDown = false;
  }
  initScrollTop = curScrollTop; // 更新上一次滚动位置
  //  滚动超过分类栏初始顶部距离：根据滚动方向调整顶部导航栏固定状态
  if(curScrollTop >= categoryTopDistance.value){
    // 向下滚→取消固定，向上滚→固定
    if(scrollDown){
      navActionStore.setFixedHeader(false);
    }else{
      navActionStore.setFixedHeader(true);
    }
  }else{
    // 滚动未超过阈值：分类栏不固定，顶部导航栏也不固定
    categoryFixied.value = false;
    navActionStore.setFixedHeader(false);
  }
};

onMounted(() => {
  // 获取分类栏初始顶部距离（页面加载时的位置）
  categoryTopDistance.value = document
      .querySelector("#category-list")
      .getBoundingClientRect().top;

  // 初始化导航栏状态：显示header和分类栏，都不固定
  navActionStore.setShowHeader(true);
  navActionStore.setShowCategory(true);
  navActionStore.setFixedHeader(false);
  navActionStore.setFixedCategory(false);

  // 监听事件总线的windowScroll事件（全局滚动事件）
  mitter.on("windowScroll", (curScrollTop) => {
    scrollHandler(curScrollTop);
  });
});

onUnmounted(() => {
  // 组件卸载时移除事件监听，防止内存泄漏
  mitter.off("windowScroll");
});

</script>

<style scoped lang="scss">
.category-video-body {
  margin-top: 30px;
  .category-list {
    display: flex;
    align-items: center;
    line-height: 30px;
    position: sticky;
    top: 0;
    height: 60px;
    background: #fff;
    z-index: 2;
    .category-title {
      font-size: 24px;
      margin-right: 40px;
      cursor: pointer;
    }
    .category-item {
      margin-right: 40px;
      font-size: 15px;
      cursor: pointer;
      border-bottom: 3px solid #fff;

      &:hover {
        color: var(--blue);
        border-color: var(--blue);
      }
    }
    .active {
      color: var(--blue);
      border-color: var(--blue);
    }
  }
  .category-fixed{
    //box-shadow: 0 2px 4px rgba(0 ,0 , 0, 0.08);
  }
}
</style>