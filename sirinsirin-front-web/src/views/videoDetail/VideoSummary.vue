<template>
  <div class="summary-panel">
    <!-- 若状态为 “隐藏” 则只显示90px高度的部分 -->
    <div class="summary" :style="{height: expandType ? 'auto' : '90px'}">
      <!-- 该段代码有xss注入风险，因此改成下面的 -->
<!--      <div class="summary-inner" id="summary-inner" v-html="videoInfo.introduction"></div>-->
      <div class="summary-inner" id="summary-inner">{{videoInfo.introduction}}</div>
    </div>
    <div class="expand-btn" v-show="showExpandBtn" @click="expand">
      {{expandType ? "收起" : "展开更多"}}
    </div>
    <div class="tag-list">
      <router-link
          :to="`/search?keyword=${item}`"
          class="tag-item"
          target="_blank"
          v-for="item in videoInfo.tags"
      >{{item}}</router-link>
    </div>
  </div>
</template>

<script setup>
import {ref, getCurrentInstance, nextTick, onMounted, onUnmounted, inject} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 路由跳转实例

const videoInfo = inject("videoInfo");

//  默认不显示完整内容
const showExpandBtn = ref(false);

const expandType = ref(false);

const expand = () => {
  expandType.value = !expandType.value;
};

onMounted(() => {
  const height = document.querySelector("#summary-inner").clientHeight;
  //  如果简介高度大于90，则隐藏，并将按钮更换为 “ 展示更多 ”
  if(height > 90){
    expandType.value = false;
    showExpandBtn.value = true;
  }else{
    expandType.value = true;
    showExpandBtn.value = false;
  }
});

</script>

<style scoped lang="scss">
.summary-panel {
  padding: 20px 0px;
  border-bottom: 1px solid #ddd;

  .summary {
    overflow: hidden;
  }

  .expand-btn {
    display: inline-block;
    margin-top: 5px;
    cursor: pointer;
    &:hover {
      color: var(--blue);
    }
  }

  .tag-list {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;

    .tag-item {
      cursor: pointer;
      text-decoration: none;
      color: var(--text2);
      background: #f1f2f3;
      border-radius: 16px;
      height: 32px;
      line-height: 32px;
      padding: 0px 12px;
      margin: 0 12px 8px 0;
    }
  }
}
</style>