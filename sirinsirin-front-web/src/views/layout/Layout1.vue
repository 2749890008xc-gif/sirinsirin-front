<template>
  <div
      class="main-container"
      :style = "{
        'max-width': proxy.bodyMaxWidth + 'px', //  读取main.js中的body最大宽度
        'min-width': proxy.bodyMinWidth + 'px', //  读取main.js中的body最小宽度
           }"
  >
    <!--     常态顶部栏 -->
    <div class="header" :style="{
      'background-image' : `url(
      ${backgroundImage
        ? backgroundImage
        : proxy.Utils.getLocalImage('banner_bg.png')})`,
    }">
      <!--      引用LayoutHeader组件-->
      <LayoutHeader></LayoutHeader>
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

onMounted(() => {
  window.addEventListener('scroll', windowScrollHandler);
  window.addEventListener('resize', windowResizeHandler);
});

onUnmounted(() => {
  window.removeEventListener('scroll', windowScrollHandler);
  window.removeEventListener('resize', windowResizeHandler);
});

const showFixedHeader = ref(false); //  这里使用false，令其默认不显示
const showFixedCategory = ref(false);

const showFixedTopHandler = (currentScrollTop) => {
  if (currentScrollTop <= 20) { //  当滚动条距离顶部大于20时，将导航栏显示出来
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
  // const background = categoryStore.currentPCategory?.background;
  const background = categoryStore.currentPCategory  //  和上面功能是一样的
      ? categoryStore.currentPCategory.background
      : null;

  if(background) {
    return proxy.Api.sourcePath + background;
  }else{
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
