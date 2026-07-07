<template>
  <div
      :class="[layoutType == 'grid' ? 'data-list-grid' : '']"
      :style="{'grid-template-columns' : `repeat(${gridCount}, 1fr)`}"
  >
    <template v-for="item in dataSource.list" :key="item.id || item.videoId">
      <slot :data="item"></slot>
    </template>
  </div>

  <div class="bottom-loading" v-if="loading">
    <img :src="proxy.Utils.getLocalImage('playing.gif')" /> 数据加载中....
  </div>
  <!-- 数据库传来的数据有要显示的视频且视频全部加载完毕时，判断条件成立 -->
  <div class="reach-bottom" v-if="isReachEnd">
    {{loadEndMsg}}
  </div>
  <!-- 数据库传来的数据没有可显示的视频时，判断条件成立 -->
  <NoData v-if="isEmptyData"></NoData>
</template>

<script setup>
import { mitter } from "@/eventbus/eventBus.js";
import { getCurrentInstance, computed, onMounted, onUnmounted } from 'vue';
const { proxy } = getCurrentInstance();

const props = defineProps({
  dataSource: {
    type: Object,
    default: () => ({ list: [], pageNo: 1, pageTotal: 0 })
  },
  loading: Boolean,
  loadEndMsg: { type: String, default: "已经到底啦~~" },
  layoutType: { type: String, default: "grid" },
  gridCount: { type: Number, default: 5 },
});

const emit = defineEmits(["loadData"]);

// 计算属性（无需修改）
const isReachEnd = computed(() => {
  const { pageNo, pageTotal, list } = props.dataSource;
  return pageNo >= pageTotal && !props.loading && list?.length > 0;
});
const isEmptyData = computed(() => {
  return props.dataSource.list?.length === 0 && !props.loading;
});

// 🔥 修复1：极灵敏节流（100ms延迟，响应更快）
const throttle = (fn, delay = 100) => {
  let timer = null;
  return (...args) => {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
};

// 🔥 修复2：全兼容滚动判断（核心！解决到底部不触发问题）
const scrollerHandler = throttle((curScrollTop) => {
  const { pageNo, pageTotal } = props.dataSource;

  // 防御判断
  if (!pageTotal || props.loading || pageNo >= pageTotal) return;

  // ✅ 全浏览器兼容高度计算（同时兼容 html 和 body）
  const scrollTop = curScrollTop || window.scrollY || document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
  );

  // ✅ 放宽触发阈值：距离底部100px就触发（比50px更灵敏）
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;

  // 🔥 关键：只要小于100px，直接触发加载
  if (distanceToBottom <= 100) {
    emit("loadData", pageNo + 1);
  }
});

onMounted(() => {
  mitter.on("windowScroll", scrollerHandler);
});

onUnmounted(() => {
  mitter.off("windowScroll", scrollerHandler);
});
</script>

<style scoped lang="scss">
.data-list-grid {
  display: grid;
  grid-gap: 20px;
  padding-bottom: 10px;
}
.reach-bottom { text-align: center; line-height: 40px; color: var(--text3); }
.bottom-loading {
  height: 40px; display: flex; align-items: center;
  justify-content: center; color: var(--text3);
  img { width: 20px; margin-right: 10px; }
}
</style>