<!-- HeaderBanner.vue -->
<template>
  <div
      class="dynamic-header-wrapper"
      v-if="!backgroundImage"
      ref="headerRef"
  >
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
</template>

<script setup>
import { ref, getCurrentInstance, onMounted, onUnmounted, watch, nextTick } from "vue";
const { proxy } = getCurrentInstance();

// 定义Props：接收父组件传递的背景图判断参数
const props = defineProps({
  backgroundImage: {
    type: String,
    default: null
  }
});

// ===================== 动态头图核心逻辑 =====================
const headerRef = ref(null);
let handleMouseMove = null;
let handleMouseOut = null;
let isMoving = false;
let startingPoint = 0;

// 按时间获取初始百分比
const getInitialPercentage = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 0.25;
  else if (hour >= 12 && hour < 18) return 0.5;
  else return 0.75;
};

// 初始化鼠标交互
const initHeader = () => {
  const header = headerRef.value;
  if (!header) return;

  // 1. 先清理旧事件，防止重复绑定
  if (handleMouseMove) {
    document.removeEventListener('mousemove', handleMouseMove);
    handleMouseMove = null;
  }
  if (handleMouseOut) {
    document.removeEventListener('mouseout', handleMouseOut);
    handleMouseOut = null;
  }

  // 2. 重置交互状态
  isMoving = false;
  startingPoint = 0;

  // 3. 设置当前时间对应的初始百分比（覆盖CSS默认值）
  const initialPercent = getInitialPercentage();
  header.style.setProperty('--percentage', initialPercent);

  // 4. 重新绑定鼠标事件
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
      percentage = Math.max(0, Math.min(1, percentage));
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

// 监听背景图变化：当从"有分类头图"切换回"动态头图"时，重新初始化
watch(() => props.backgroundImage, (newVal) => {
  if (newVal === null) {
    nextTick(() => {
      initHeader(); // DOM更新后重新初始化
    });
  } else {
    // 切换到有分类头图时，清理事件避免内存泄漏
    if (handleMouseMove) {
      document.removeEventListener('mousemove', handleMouseMove);
      handleMouseMove = null;
    }
    if (handleMouseOut) {
      document.removeEventListener('mouseout', handleMouseOut);
      handleMouseOut = null;
    }
    isMoving = false;
    startingPoint = 0;
  }
});

// 生命周期：组件挂载后初始化（确保DOM已渲染）
onMounted(() => {
  nextTick(() => {
    initHeader();
  });
});

// 生命周期：组件销毁时清理事件
onUnmounted(() => {
  if (handleMouseMove) {
    document.removeEventListener('mousemove', handleMouseMove);
    handleMouseMove = null;
  }
  if (handleMouseOut) {
    document.removeEventListener('mouseout', handleMouseOut);
    handleMouseOut = null;
  }
  isMoving = false;
  startingPoint = 0;
});
</script>

<style lang="scss" scoped>
.dynamic-header-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  /* 移除CSS硬编码初始值，由JS动态设置 */
  /* --percentage: 0.75; */

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

  /* 时段样式：兼顾上午切换+夜晚显示 */
  .morning {
    z-index: 30;
    opacity: clamp(0, 1 - ((var(--percentage) - 0.25) / 0.25), 1);
  }

  .afternoon {
    z-index: 20;
    opacity: clamp(0, min(
        (var(--percentage) - 0.25) / 0.25,
        1 - ((var(--percentage) - 0.5) / 0.25)
    ), 1);
  }

  .evening {
    z-index: 10;
    opacity: clamp(0, (var(--percentage) - 0.5) / 0.25, 1);
  }

  .view {
    transform: translatex(calc(var(--percentage) * 100px));
  }

  .tree {
    transform: translatex(calc(var(--percentage) * 50px));
    filter: blur(3px);
  }

  /* 慢过渡效果 */
  .view,
  .tree,
  .morning,
  .afternoon,
  .evening {
    transition: .2s all ease-in;
  }

  &.moving .view,
  &.moving .tree,
  &.moving .morning,
  &.moving .afternoon,
  &.moving .evening {
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

  .logo-box {
    position: relative;
    top: 85px;
    left: 120px;
    width: 200px;
    height: auto;

    .logo-light-pink,
    .logo-white {
      position: absolute;
      width: 100%;
      height: auto;
      z-index: 1;
      transition: 0.8s all ease-in;
    }

    .logo-light-pink {
      opacity: clamp(0, 1 - ((var(--percentage) - 0.6) / 0.15), 1);
    }

    .logo-white {
      opacity: clamp(0, ((var(--percentage) - 0.6) / 0.15), 1);
    }
  }

  &.moving .logo-box .logo-light-pink,
  &.moving .logo-box .logo-white {
    transition: none;
  }
}
</style>