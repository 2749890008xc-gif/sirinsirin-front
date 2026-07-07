<template>
  <div class="history-list">
    <div class="top-info">
      <div class="iconfont icon-wating">历史记录</div>
      <div>
        <el-button type="primary" @click="cleanAll">清空历史</el-button>
      </div>
    </div>

    <el-timeline>
      <!-- 直接渲染，不使用任何自定义组件，符合el-timeline规范 -->
      <el-timeline-item
          v-for="data in dataSource.list"
          :key="data.videoId"
          :timestamp="proxy.Utils.formatDate(data.lastUpdateTime)"
          placement="top"
      >
        <div class="history-item">
          <div class="cover" @click="goDetail(data.videoId)">
            <Cover :source="data.videoCover" />
          </div>
          <div class="video-info">
            <div @click="goDetail(data.videoId)">
              {{ data.videoName || "已失效视频" }}
            </div>
          </div>
          <div class="op-btns">
            <div class="iconfont icon-delete" @click="delHistory(data.videoId)"></div>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>

    <!-- 加载提示 + 到底提示 -->
    <div class="bottom-loading" v-if="loadingData">
      <img :src="proxy.Utils.getLocalImage('playing.gif')" /> 数据加载中....
    </div>
    <div class="reach-bottom" v-if="isReachEnd">
      已经到底啦~~
    </div>
    <NoData v-if="isEmptyData"></NoData>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted, onUnmounted, computed } from "vue";
const { proxy } = getCurrentInstance();
import { useRouter } from "vue-router";
const router = useRouter();
import { useNavAction } from "@/stores/navActionStore.js";
const navActionStore = useNavAction();

// 数据状态
const loadingData = ref(false);
const dataSource = ref({
  list: [],
  pageNo: 1,
  pageTotal: 0,
});

// ============== 核心：滚动加载逻辑（直接写在页面，兼容el-timeline） ==============
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

const loadNextPage = async () => {
  if (loadingData.value || dataSource.value.pageNo >= dataSource.value.pageTotal) return;
  await loadDataList(dataSource.value.pageNo + 1);
};

const scrollHandler = throttle(() => {
  const { pageNo, pageTotal } = dataSource.value;
  if (!pageTotal || loadingData.value || pageNo >= pageTotal) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;

  if (distanceToBottom <= 100) loadNextPage();
});

// ============== 数据加载 ==============
const loadDataList = async (page = 1) => {
  dataSource.value.pageNo = page;
  loadingData.value = true;
  let result = await proxy.Request({
    url: proxy.Api.playHistory,
    params: { pageNo: dataSource.value.pageNo },
  });
  loadingData.value = false;
  if (!result || !result.data) return;

  if (page > 1) {
    dataSource.value.list = [...dataSource.value.list, ...result.data.list];
  } else {
    dataSource.value.list = result.data.list;
  }
  dataSource.value.pageTotal = result.data.pageTotal;
};

// ============== 计算属性 ==============
const isReachEnd = computed(() => {
  const { pageNo, pageTotal, list } = dataSource.value;
  return pageNo >= pageTotal && !loadingData.value && list?.length > 0;
});
const isEmptyData = computed(() => {
  return dataSource.value.list?.length === 0 && !loadingData.value;
});

// ============== 生命周期 ==============
onMounted(() => {
  loadDataList();
  window.addEventListener("scroll", scrollHandler);
  navActionStore.setShowHeader(true);
  navActionStore.setFixedHeader(true);
  navActionStore.setShowCategory(false);
  navActionStore.setFixedCategory(false);
});

onUnmounted(() => {
  window.removeEventListener("scroll", scrollHandler);
});

// ============== 功能函数 ==============
const cleanAll = () => {
  proxy.Confirm({
    message: "确定要清空历史记录吗？",
    okfun: async () => {
      await proxy.Request({ url: proxy.Api.cleanHistory });
      dataSource.value.list = [];
      proxy.Message.success("删除成功");
    },
  });
};

const delHistory = (videoId) => {
  proxy.Confirm({
    message: "确定要删除记录吗？",
    okfun: async () => {
      await proxy.Request({ url: proxy.Api.delHistory, params: { videoId } });
      dataSource.value.list = dataSource.value.list.filter(i => i.videoId !== videoId);
      proxy.Message.success("删除成功");
    },
  });
};

const goDetail = (videoId) => router.push(`/video/${videoId}`);
</script>

<style scoped lang="scss">
.history-list {
  margin: 20px auto 0;
  width: 1200px;
  .top-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 40px;
    margin-bottom: 20px;
    .icon-wating {
      font-size: 16px;
      &::before {
        margin-right: 5px;
        font-size: 22px;
        color: #e3936c;
        float: left;
      }
    }
  }
  .history-item {
    margin-top: 10px;
    display: flex;
    align-items: center;
    .cover { width: 200px; }
    .video-info {
      flex: 1;
      margin-left: 10px;
      cursor: pointer;
      color: var(--blue3);
    }
    .op-btns .iconfont {
      cursor: pointer;
      color: #e3936c;
    }
  }
}
.bottom-loading {
  height: 40px; display: flex; align-items: center;
  justify-content: center; color: var(--text3);
  img { width: 20px; margin-right: 10px; }
}
.reach-bottom { text-align: center; line-height: 40px; color: var(--text3); }
</style>