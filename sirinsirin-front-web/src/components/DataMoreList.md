以下是DataMoreList的源代码：

<template>
  <div
      :class="[layoutType == 'grid' ? 'data-list-grid' : '']"
      :style="{'grid-template-columns' : `repeat(${gridCount}, 1fr)`}"
  >
    <!-- 接收VideoList.vue传来的数据 -->
    <template v-for="item in dataSource.list">
      <slot :data="item"></slot>  <!-- 接收VideoList.vue传来的数据 -->
    </template>
  </div>
  <!-- 数据库传来的数据有要显示的视频且正在加载时，判断条件成立 -->
  <div class="bottom-loading" v-if="loading">
    <img :src="proxy.Utils.getLocalImage('playing.gif')" /> 数据加载中....
  </div>
  <!-- 数据库传来的数据有要显示的视频且视频全部加载完毕时，判断条件成立 -->
  <div
      class="reach-bottom"
      v-if="
        dataSource.pageNo >= dataSource.pageTotal &&
        !loading &&
        dataSource.list.length > 0
      "
  >
    {{loadEndMsg}}
  </div>
  <!-- 数据库传来的数据没有可显示的视频时，判断条件成立 -->
  <NoData v-if="dataSource.list && dataSource.list.length == 0"></NoData>
</template>

<script setup>
import { mitter } from "@/eventbus/eventBus.js";
import {ref, reactive, getCurrentInstance, nextTick, computed, onMounted, onUnmounted} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

const props = defineProps({
  dataSource: {
    type: Object,
    default: {},
  },
  loading: {
    type: Boolean,
  },
  loadEndMsg: {
    type: String,
    default: "已经到底啦~~",
  },
  layoutType: {
    type: String,
    default: "grid",  //  布局类型默认为宫格布局
  },
  gridCount: {  //  每行的视频数
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(["loadData"]);
const scrollerHandler = (curScrollTop) => {
  // 当滚动条划到最底部时：window.innerHeight + window.scrollY == document.body.offsetHeight（有时前者也可能大于后者）。
  //  所以若前者 < 后者，则滚动条没有拉到底部，因此不做加载剩余视频等处理
  if(window.innerHeight + curScrollTop < document.body.offsetHeight) {
      return;
  }
  //  如果正在加载视频 或者 当前pageNo >= pageTotal时，则不做任何处理
  if(props.loading || props.dataSource.pageNo >= props.dataSource.pageTotal){
    return;
  }
  //  因为这里改变的是prop.dataSource对象的属性，而并没有改变props.dataSource对象的值，因此不违反单向输出流原则
  props.dataSource.pageNo++;
  emit("loadData"); //  当滑动到底部的时候就会执行VideoList.vue的“@loadData="loadDataList"”代码
};

onMounted(() => {
  mitter.on("windowScroll", (curScrollTop) => {
    scrollerHandler(curScrollTop);
  });
});

onUnmounted(() => {
  mitter.off("windowScroll");
});
</script>

<style scoped lang="scss">
.data-list-grid {
  display: grid;
  grid-gap: 20px;
  padding-bottom: 10px;
}

.reach-bottom {
  text-align: center;
  line-height: 40px;
  color: var(--text3);
}

.bottom-loading {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  img {
    width: 20px;
    margin-right: 10px;
  }
}
</style>