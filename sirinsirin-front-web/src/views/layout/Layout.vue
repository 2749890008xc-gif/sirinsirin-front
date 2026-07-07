<template>
  <div
      class="main-container"
      :style="{
      'max-width': proxy.bodyMaxWidth + 'px',
      'min-width': proxy.bodyMinWidth + 'px',
    }"
  >
    <!-- 常态顶部栏 -->
    <div
        class="header"
        v-show="navActionStore.showHeader"
        :style="{
        'background-image': backgroundImageHandler ? `url(${backgroundImageHandler})` : 'none'
      }"
    >
      <!-- 引入拆分后的动态头图组件 -->
      <HeaderBanner :background-image="backgroundImageHandler"></HeaderBanner>

      <!-- 原有导航栏 -->
      <div class="header-content">
        <LayoutHeader :hotSearchList="hotSearchList"></LayoutHeader>
      </div>
    </div>

    <!-- 拉动滚动条时固定在页面上方的顶部栏 -->
    <div
        class="header-fixed"
        v-if="navActionStore.fixedHeader && showFixedHeader || navActionStore.forceFixedHeader"
    >
      <LayoutHeader theme="dark" :hotSearchList="hotSearchList"></LayoutHeader>
    </div>

    <!-- 固定在顶部的分类栏 -->
    <div
        class="category-fixed"
        v-show="navActionStore.fixedCategory && showFixedCategory"
        :style="{
        'max-width': proxy.bodyMaxWidth + 'px',
        'min-width': proxy.bodyMinWidth + 'px',
      }"
        @mouseover="lineCategoryMouseHandler(1)"
        @mouseout="lineCategoryMouseHandler(0)"
    >
      <div class="category-fixed-inner">
        <Category :showType="1" :mouseOver="mouseOver"></Category>
      </div>
    </div>

    <!-- 主体内容容器 -->
    <div
        class="body-container"
        :style="{
        'max-width': proxy.bodyMaxWidth + 'px',
        'min-width': proxy.bodyMinWidth + 'px',
      }"
    >
      <div class="category" v-show="navActionStore.showCategory">
        <Category :showType="0"></Category>
      </div>
      <div class="body-main">
        <router-view></router-view>
      </div>
    </div>

    <!-- 账户组件 -->
    <Account></Account>
  </div>
</template>

<script setup>
// 核心依赖导入
import {ref, getCurrentInstance, onMounted, onUnmounted, computed, watch} from "vue";
import { useRoute, useRouter } from "vue-router";

// 事件总线
import { mitter } from "@/eventbus/eventBus.js";

// 布局子组件（含拆分后的头图组件）
import HeaderBanner from "./HeaderBanner.vue"; // 新增：导入头图组件
import LayoutHeader from "./LayoutHeader.vue";
import Category from "./Category.vue";

// 业务组件
import Account from "@/views/account/Account.vue";

// Pinia 状态管理
import { useNavAction } from "@/stores/navActionStore";
import { useCategoryStore } from "@/stores/categoryStore.js";
const navActionStore = useNavAction();
const categoryStore = useCategoryStore();
import {useLoginStore} from "@/stores/loginStore.js";
import VueCookies from "vue-cookies";
const loginStore = useLoginStore();

// Vue 实例上下文
const { proxy } = getCurrentInstance();

// 路由实例
const route = useRoute();
const router = useRouter();

// 响应式变量
const mouseOver = ref(false); // 分类栏鼠标悬浮状态
const showFixedHeader = ref(false); // 固定顶部栏显示状态
const showFixedCategory = ref(false); // 固定分类栏显示状态

// 分类栏鼠标悬浮处理
const lineCategoryMouseHandler = (type) => {
  mouseOver.value = type === 1;
};

// 滚动/窗口调整相关逻辑
// 固定栏显示控制
const showFixedTopHandler = (currentScrollTop) => {
  // 顶部栏：滚动超过20px显示
  showFixedHeader.value = currentScrollTop > 20;
  // 分类栏：滚动超过250px显示
  showFixedCategory.value = currentScrollTop > 250;
};

// 窗口滚动监听
const windowScrollHandler = () => {
  const currentScrollTop = window.scrollY;
  showFixedTopHandler(currentScrollTop);
  mitter.emit("windowScroll", currentScrollTop);
};

// 窗口大小调整监听
const windowResizeHandler = () => {
  mitter.emit("windowResize");
};

// 背景图计算（传递给头图组件）
const backgroundImageHandler = computed(() => {
  const background = categoryStore.currentPCategory
      ? categoryStore.currentPCategory.background
      : null;

  if (background) {
    return proxy.Api.sourcePath + background;
  } else {
    // 返回null时，头图组件显示动态效果；如需兜底可返回默认图路径
    return null;
  }
});

const hotSearchList = ref([]);

const getSearchKeywordTop = async () => {
  let result = await proxy.Request({
    url: proxy.Api.getSearchKeywordTop,
  });

  if (!result) {
    return;
  }
  hotSearchList.value = result.data;
};
getSearchKeywordTop();

const isLoginValid = computed(() => {
  const hasUser = Object.keys(loginStore.userInfo).length > 0
  const token = VueCookies.get('token')
  return hasUser && !!token
})

const getNoReadCount = async () => {
  if (!isLoginValid.value) {
    return;
  }
  let result = await proxy.Request({
    url: proxy.Api.getNoReadCount,
  });
  if (!result) {
    return;
  }
  loginStore.saveMessageNoReadCount(result.data);
};

watch(
    () => loginStore.userInfo,
    (newVal, oldVal) => {
      if (newVal) {
        getNoReadCount();
      }
    },
    {
      immediate: true,
      deep: true,
    }
);

// 生命周期钩子
onMounted(() => {
  // 绑定全局监听
  window.addEventListener("scroll", windowScrollHandler);
  window.addEventListener("resize", windowResizeHandler);
});

onUnmounted(() => {
  // 清理全局监听，避免内存泄漏
  window.removeEventListener("scroll", windowScrollHandler);
  window.removeEventListener("resize", windowResizeHandler);
});
</script>

<style>
/* 全局body样式（非scoped） */
body {
  background: #ededed !important;
}
</style>

<style lang="scss" scoped>
// 核心布局样式（仅保留布局相关，头图样式已移至子组件）
.main-container {
  position: relative;
  background: #fff;
  margin: 0 auto;
  min-height: calc(100vh);

  // 顶部栏容器
  .header {
    margin: 0 auto;
    height: 180px;
    position: relative;
    background-color: #7c9ce1;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;

    // 导航栏容器（确保在头图上层）
    .header-content {
      position: relative;
      z-index: 1001;
      width: 100%;
      display: flex;
      align-items: center;
      padding: 0 25px;
    }
  }

  // 滚动固定的顶部栏
  .header-fixed {
    position: fixed;
    width: 100%;
    z-index: 1001;
    top: 0;
    background: #fff;
    height: 64px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  // 滚动固定的分类栏
  .category-fixed {
    position: fixed;
    z-index: 1000;
    top: 64px;
    width: 100%;
    background: #fff;
    padding: 10px 150px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

    .category-fixed-inner {
      margin: 0 auto;
    }
  }

  // 主体内容容器
  .body-container {
    padding: 0 var(--bodyPadding);
    .category {
      margin: 20px;
    }
  }
}

// 响应式适配（屏幕宽度<1500px）
@media screen and (max-width: 1500px) {
  .main-container {
    .body-container {
      padding: 0 60px;
    }
  }
}
</style>