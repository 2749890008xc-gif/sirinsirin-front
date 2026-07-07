<template>
  <div v-if="dataSource.list != null && dataSource.list.length === 0">
    <NoData msg="空空如也"></NoData>
  </div>
  <div class="data-list-panel">
    <template v-for="item in dataSource.list">
      <slot :data="item"></slot>
    </template>
  </div>
  <div class="pagination" v-if="showPagination && dataSource.pageTotal > 1">
    <el-pagination
        background
        :total="dataSource.totalCount || 0"
        :current-page.sync="dataSource.pageNo"
        layout="prev,pager,next"
        @current-change="handlePageNoChange"
        :page-size="dataSource.pageSize"
    ></el-pagination>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

const props = defineProps({
  dataSource: {
    type: Object,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["loadData"]);
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo;
  emit("loadData");
};
</script>

<style lang="scss" scoped>
.data-list-panel {
  max-height: calc(100% - 50px);
  overflow: auto;
}
.pagination {
  padding: 10px 0px 5px 0px;
  text-align: right;
  overflow: hidden;
  height: 50px;
  :deep(.el-pagination) {
    float: right;
  }
}
</style>