<template>
  <div class="search-body">
    <div class="search-panel">
      <el-input
          placeholder="请输入关键字"
          v-model="keyword"
          size="large"
          @keyup.enter="search"
      >
        <template #prefix>
          <span class="iconfont icon-search"></span>
        </template>
        <template #suffix>
          <el-button type="primary" @click="search" class="search-btn">
            搜索
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="order-btns">
      <div
          :class="['btn', order == item.order ? 'active' : '']"
          v-for="item in orderBtns"
          @click="changeOrder(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="data-list">
      <DataGridList :gridCount="6" :dataSource="dataSource">
        <template #default="{ data }">
          <VideoItem :data="data"></VideoItem>
        </template>
      </DataGridList>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, getCurrentInstance, watch, onMounted} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import {useSearchHistoryStore} from "@/stores/searchHistoryStore.js";
const searchHistoryStore = useSearchHistoryStore();
import {useNavAction} from "@/stores/navActionStore.js";
const navActionStore = useNavAction();

const orderBtns = ref([
  {
    name: '综合排序',
    order: null,
    orderType: null,
  },
  {
    name: '最多播放',
    order: 'play',
    orderType: 0,
  },
  {
    name: '最新发布',
    order: 'latest',
    orderType: 1,
  },
  {
    name: '最多弹幕',
    order: 'danmu',
    orderType: 2,
  },
  {
    name: '最多收藏',
    order: 'collection',
    orderType: 3,
  },
]);


const keyword = ref(route.query.keyword);
const search = () => {
  if (!keyword.value) {
    return;
  }
  // 主动搜索时，添加历史
  searchHistoryStore.addHistory(keyword.value);
  router.push({
    path: "/search",
    query: {
      keyword: keyword.value,
      order: order.value
    }
  });
};
const order = ref(route.query.order);

const changeOrder = (item) => {
  order.value = item.order;
  search();
};

const loadingData = ref(false);
const dataSource = ref({});
const loadDataList = async () => {
  const orderTypeBtn = orderBtns.value.find((item) => {
    return route.query.order == item.order;
  });

  let params = {
    pageNo: dataSource.value.pageNo,
    keyword: route.query.keyword,
    orderType: orderTypeBtn.orderType,
  };
  loadingData.value = true;
  let result = await proxy.Request({
    url: proxy.Api.search,
    params,
  });
  loadingData.value = false;
  if (!result) {
    return;
  }
  dataSource.value = result.data;
};

// 仅保留数据加载，移除自动添加历史
watch(
    () => route.query.keyword,
    (newVal) => {
      if (newVal) {
        loadDataList();
      }
    },
    {
      immediate: true,
      deep: true
    }
);

onMounted(() => {
  // 新增：初始化时从Cookie加载搜索历史
  searchHistoryStore.initHistory();

  navActionStore.setShowHeader(false);
  navActionStore.setFixedHeader(false);
  navActionStore.setFixedCategory(false);
  navActionStore.setShowCategory(false);
  navActionStore.setForceFixedHeader(true);
});
</script>

<style scoped lang="scss">
.search-body {
  padding-top: 80px;

  .search-panel {
    margin: 20px auto;
    width: 700px;

    :deep(.el-input) {
      height: 55px;
    }

    .icon-search {
      color: var(--blue);
      font-weight: bold;
    }

    .search-btn {
      padding: 20px 35px;
    }
  }

  .order-btns {
    display: flex;
    margin-right: 10px;

    .btn {
      padding: 5px 10px;
      cursor: pointer;
      border-radius: 5px;
      color: var(--text2);
      font-size: 14px;

      &:hover {
        color: var(--blue);
      }
    }

    .active {
      background: #dff6fd;
      color: var(--blue);
    }
  }

  .data-list {
    margin-top: 20px;
  }
}
</style>