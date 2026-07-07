<template>
  <div
      class="main-container"
      :style = "{
        'max-width': proxy.bodyMaxWidth + 'px',
        'min-width': proxy.bodyMinWidth + 'px',
           }"
  >
    <!--     常态顶部栏 -->
    <div class="header"
         :style="{
           // 原有背景图逻辑：仅当动态头图不显示时生效
           'background-image': backgroundImageHandler
             ? `url(${backgroundImageHandler})`
             : 'none'
         }"
         ref="headerRef"
    >
      <!-- 新增：动态头图区域（仅当backgroundImage为空时显示） -->
      <div v-if="!backgroundImageHandler" class="dynamic-header-wrapper">
        <!-- 仿bilibili的鼠标拖动头图效果 -->
        <div class="view">
          <img src="@/assets/bilibili/bilibili-winter-view-1.jpg" class="morning" alt="早晨背景">
          <img src="@/assets/bilibili/bilibili-winter-view-2.jpg" class="afternoon" alt="下午背景">
          <video autoplay loop muted class="evening">
            <source src="@/assets/bilibili/bilibili-winter-view-3.webm" type="video/webm" />
          </video>
          <img src="@/assets/bilibili/bilibili-winter-view-3-snow.png" class="window-cover" alt="雪花覆盖">
        </div>
        <div class="tree">
          <img src="@/assets/bilibili/bilibili-winter-tree-1.png" class="morning" alt="早晨树木">
          <img src="@/assets/bilibili/bilibili-winter-tree-2.png" class="afternoon" alt="下午树木">
          <img src="@/assets/bilibili/bilibili-winter-tree-3.png" class="evening" alt="夜晚树木">
        </div>
        <div class="header-banner__inner">
          <div class="logo-box">
            <!-- 按时段切换的Logo -->
            <img src="@/assets/sirinsirin-light-pink.png" class="logo-light-pink" alt="logo-light-pink">
            <img src="@/assets/sirinsirin-white.png" class="logo-white" alt="logo-white">
          </div>
        </div>
        <div class="taper-line"></div>
      </div>

      <!--      原有：引用LayoutHeader组件（调整包裹结构，保证布局）-->
      <div class="header-content">
        <LayoutHeader></LayoutHeader>
      </div>
    </div>

    <!--    拉动滚动条时固定在页面上方的顶部栏-->
    <div class="header-fixed" v-if = "showFixedHeader">
      <LayoutHeader theme="dark"></LayoutHeader>
    </div>
    <!-- 固定在顶部的分类栏 -->
    <div
        class="category-fixed"
        v-show="navActionStore.fixedCategory && showFixedCategory"
        :style="{
            'max-width' : proxy.bodyMaxWidth + 'px',
            'min-width' : proxy.bodyMinWidth + 'px',
          }"
        @mouseover="lineCategoryMouseHandler(1)"
        @mouseout="lineCategoryMouseHandler(0)"
    >
      <div class="category-fixed-inner">
        <Category :showType = "1" :mouseOver="mouseOver"></Category>
      </div>
    </div>
    <div class="body-container" :style="{
      'max-width' : proxy.bodyMaxWidth + 'px',
      'min-width' : proxy.bodyMinWidth + 'px',
    }">
      <div class="category">
        <Category :showType = "0"></Category>
      </div>
      <div class="body-main">
        <router-view></router-view>
      </div>
    </div>
    <Account></Account>
  </div>
  <div class="body-inner" style="height: 1500px"></div>
</template>

<script setup>
import { mitter } from "@/eventbus/eventBus.js";
import Category from "./Category.vue";
import {ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted, computed} from "vue";
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
import Account from "@/views/account/Account.vue";
import LayoutHeader from "@/views/layout/LayoutHeader.vue";
const route = useRoute();
const router = useRouter();
import { useNavAction } from "@/stores/navActionStore";
const navActionStore = useNavAction();

import { useCategoryStore } from "@/stores/categoryStore.js";
const categoryStore = useCategoryStore();

const mouseOver = ref(false);
const lineCategoryMouseHandler = (type) => {
  mouseOver.value = type === 1;
}

// ===================== 新增：动态头图核心逻辑 =====================
// 1. 声明header元素引用
const headerRef = ref(null);
// 2. 鼠标事件处理函数
let handleMouseMove = null;
let handleMouseOut = null;
// 3. 鼠标移动状态标记
let isMoving = false;
let startingPoint = 0;

// 按时间获取初始百分比（控制头图/Logo初始状态）
const getInitialPercentage = () => {
  const hour = new Date().getHours();
  console.log(hour + "---------------");
  // 早上6-12点 → 0.25（morning）
  if (hour >= 6 && hour < 12) {
    return 0.25;
  }
  // 下午12-18点 → 0.5（afternoon）
  else if (hour >= 12 && hour < 18) {
    return 0.5;
  }
  // 晚上/其他时段 → 0.75（evening）
  else {
    return 0.75;
  }
};

// 初始化鼠标驱动的头图交互
const initHeader = () => {
  const header = headerRef.value;
  if (!header) return;

  const initialPercent = getInitialPercentage();
  header.style.setProperty('--percentage', initialPercent);

  handleMouseMove = (e) => {
    const headerRect = header.getBoundingClientRect();
    if (
        e.clientX >= headerRect.left && e.clientX <= headerRect.right &&
        e.clientY >= headerRect.top && e.clientY <= headerRect.bottom
    ) {
      if (!isMoving) {
        startingPoint = e.clientX;
        header.classList.add('moving');
        isMoving = true;
      }
      let percentage = (e.clientX - startingPoint) / (window.outerWidth * 2) + initialPercent;
      header.style.setProperty('--percentage', percentage);
    } else {
      if (isMoving) {
        header.classList.remove('moving');
        header.style.setProperty('--percentage', initialPercent);
        isMoving = false;
      }
    }
  };

  handleMouseOut = (e) => {
    if (e.relatedTarget === null) {
      header.classList.remove('moving');
      header.style.setProperty('--percentage', initialPercent);
      isMoving = false;
    }
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseout', handleMouseOut);
};
// ===================== 新增结束 =====================

onMounted(() => {
  window.addEventListener('scroll', windowScrollHandler);
  window.addEventListener('resize', windowResizeHandler);
  // 新增：初始化动态头图（确保DOM渲染完成）
  nextTick(() => {
    initHeader();
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', windowScrollHandler);
  window.removeEventListener('resize', windowResizeHandler);
  // 新增：清理鼠标事件监听
  if (handleMouseMove) {
    document.removeEventListener('mousemove', handleMouseMove);
  }
  if (handleMouseOut) {
    document.removeEventListener('mouseout', handleMouseOut);
  }
});

const showFixedHeader = ref(false);
const showFixedCategory = ref(false);

const showFixedTopHandler = (currentScrollTop) => {
  if (currentScrollTop <= 20) {
    showFixedHeader.value = false;
  }else{
    showFixedHeader.value = true;
  }
  if(currentScrollTop > 250) {
    showFixedCategory.value = true;
  }else {
    showFixedCategory.value = false;
  }
};

const windowScrollHandler = () => {
  let currentScrollTop = window.scrollY;
  showFixedTopHandler(currentScrollTop);
  mitter.emit("windowScroll", currentScrollTop);
}

const windowResizeHandler = () => {
  mitter.emit("windowResize");
}

const backgroundImageHandler = computed(() => {
  const background = categoryStore.currentPCategory
      ? categoryStore.currentPCategory.background
      : null;

  if(background) {
    return proxy.Api.sourcePath + background;
  }else{
    // 原有逻辑：返回banner_bg.png路径 → 现在改为返回null（触发动态头图）
    // 注：若需要保留banner_bg.png作为兜底，可保留原逻辑，动态头图会覆盖它
    return null;
  }
});

</script>

<style>
body{
  background: #ededed !important;
}
</style>
<style lang="scss" scoped>
.main-container {
  position: relative;
  background: #fff;
  margin: 0 auto;
  min-height: calc(100vh);

  .header{
    margin: 0 auto;
    height: 180px;
    position: relative;
    background-color: #7c9ce1;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    --percentage: 0.75; /* 新增：核心动画变量 */

    /* 新增：动态头图容器样式（保证不影响原有布局） */
    .dynamic-header-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0; /* 低于header-content，不遮挡导航栏 */
      overflow: hidden;
    }

    /* 新增：header-content样式（保证导航栏在动态头图上层） */
    .header-content {
      position: relative;
      z-index: 1001;
      width: 100%;
      display: flex;
      align-items: center;
      padding: 0 25px;
    }

    /* ===================== 新增：动态头图核心样式 ===================== */
    .view,
    .tree {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .view img,
    .view video,
    .tree img {
      position: absolute;
      display: block;
      width: 120%;
      height: 100%;
      object-fit: cover;
    }

    /* 调整层级顺序：上午 > 下午 > 夜晚 */
    .morning {
      z-index: 30; /* 上午 → 最高层级 */
      opacity: clamp(0, 1 - ((var(--percentage) - 0.25) / 0.25), 1);
    }

    .afternoon {
      z-index: 20; /* 下午 → 中间层级 */
      opacity: clamp(0, min(
          (var(--percentage) - 0.25) / 0.25,
          1 - ((var(--percentage) - 0.5) / 0.25)
      ), 1);
    }

    .evening {
      z-index: 10; /* 夜晚 → 最低层级 */
      opacity: clamp(0, (var(--percentage) - 0.5) / 0.25, 1);
    }

    .view {
      transform: translatex(calc(var(--percentage) * 100px));
    }

    .tree {
      transform: translatex(calc(var(--percentage) * 50px));
      filter: blur(3px);
    }

    .view,
    .tree,
    .morning,
    .afternoon,
    .evening { /* 统一：所有时段都加过渡 */
      transition: .2s all ease-in;
    }

    &.moving .view,
    &.moving .tree,
    &.moving .morning,
    &.moving .afternoon,
    &.moving .evening { /* 鼠标移动时取消所有过渡 */
      transition: none;
    }

    .window-cover {
      opacity: calc((var(--percentage) - 0.9) / 0.1);
    }

    .header-banner__inner {
      position: relative;
      z-index: 50;
    }

    .taper-line {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, transparent, #ccc, transparent);
    }

    .logo-box{
      position: relative;
      top: 85px;
      left: 120px;
      width: 200px; /* 固定容器宽度 */
      height: auto;

      .logo-light-pink,
      .logo-white {
        position: absolute;
        width: 100%;
        height: auto;
        z-index: 1;
        transition: .2s all ease-in;
      }

      /* light-pink版：早/下午（≤0.6）显示，晚上（>0.6）隐藏 */
      .logo-light-pink {
        opacity: clamp(0, 1 - ((var(--percentage) - 0.6) / 0.15), 1);
      }

      /* white版：早/下午（≤0.6）隐藏，晚上（>0.6）显示 */
      .logo-white {
        opacity: clamp(0, ((var(--percentage) - 0.6) / 0.15), 1);
      }
    }

    &.moving .logo-box .logo-light-pink,
    &.moving .logo-box .logo-white {
      transition: none;
    }
    /* ===================== 动态头图样式结束 ===================== */
  }

  .header-fixed{
    position: fixed;
    width: 100%;
    z-index: 1001;
    top: 0;
    background: #fff;
    height: 64px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .category-fixed{
    position: fixed;
    z-index: 1000;
    top: 64px;
    width: 100%;
    background: #fff;
    padding: 10px 150px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    .category-fixed-inner{
      margin: 0 auto;
    }
  }

  .body-container{
    padding: 0 var(--bodyPadding);
    .category{
      margin: 20px;
    }
  }
}

@media screen and (max-width: 1500px) {
  .main-container {
    .body-container {
      padding: 0 60px;
    }
  }
}
</style>