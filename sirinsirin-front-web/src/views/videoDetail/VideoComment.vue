<template>
  <div class="comment-panel">
    <div class="comment-title">
      <div class="title">
        <!-- 原本是：dataSource.totalCount，但这种方式会因为高并发而出现评论数统计不正确的情况，因此舍弃 -->
        评论<span class="comment-count">{{videoInfo.commentCount}}</span>
      </div>
      <div
          :class="['order-type-item', orderType == 0 ? 'active' : '']"
          @click="changeOrder(0)"
      >
        最热
      </div>
      <el-divider direction="vertical" />
      <div
          :class="['order-type-item', orderType == 1 ? 'active' : '']"
          @click="changeOrder(1)"
      >
        最新
      </div>
    </div>
    <div class="comment-content-panel">
      <!-- 发布评论的表单框 -->
      <!-- 不加 “:sendType="0"” 的话会导致你点击回复评论时，发布评论的表单会莫名其妙出现placeholder属性 -->
      <VideoCommentSend :sendType="0"></VideoCommentSend>
    </div>
    <div class="comment-list">
      <DataLoadMoreList
          :dataSource="dataSource"
          :loading="loadingData"
          @loadData="loadCommentList"
          layoutType="list"
          loadEndMsg = "没有更多评论"
      >
        <template #default="{data}">
          <VideoCommentItem :data="data"></VideoCommentItem>
        </template>
      </DataLoadMoreList>
    </div>
  </div>
</template>

<script setup>
import {mitter} from '@/eventbus/eventBus.js';
import {ACTION_TYPE} from "@/utils/Constants.js";
import {ref, getCurrentInstance, nextTick, onMounted, onUnmounted, inject, reactive, computed, provide} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
import VideoCommentSend from "@/views/videoDetail/VideoCommentSend.vue";
import DataLoadMoreList from "@/components/DataLoadMoreList.vue";
import VideoCommentItem from "@/views/videoDetail/VideoCommentItem.vue";
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 路由跳转实例

const videoInfo = inject("videoInfo");

const showReplyHandler = (commentId) => {
  dataSource.value.list.forEach((item) => {
    if(item.commentId != commentId) {
      item.showReply = false;
    }else{
      item.showReply = true;
    }
  });
};
provide("showReply", showReplyHandler);
const showComment = computed(() => {
  return (videoInfo.value.interaction == null || videoInfo.value.interaction.indexOf("1") == -1);
});

const loadingData = ref(false);
const dataSource = ref({});
const orderType = ref(0);
const changeOrder = (type) => {
  orderType.value = type;
  loadCommentList();
};

const loadCommentList = async () => {
  if(!showComment.value) {
    return;
  }
  loadingData.value = true;
  let result = await proxy.Request({
    url: proxy.Api.loadComment,
    params: {
      videoId: route.params.videoId,
      pageNo: dataSource.value.pageNo,
      orderType: orderType.value,
    },
  });
  loadingData.value = false;
  if (!result) {
    return;
  }

  const userActionMap = {};
  const userActionList = result.data.userActionList;
  userActionList.forEach((item) => {
    userActionMap[item.commentId] = item;
  });
  const commentData = result.data.commentData;
  commentData.list.forEach((item) => {
    setCommentActive(userActionMap, item);
    if(item.children){
      item.children.forEach(sub => {
        setCommentActive(userActionMap, sub);
      });
    }
  });
  const dataList = dataSource.value.list;
  dataSource.value = Object.assign({}, commentData);
  if(commentData.pageNo > 1){
    dataSource.value.list = dataList.concat(commentData.list);
  }
};

const setCommentActive = (userActionMap, item) => {
  const userAction = userActionMap[item.commentId];
  if (userAction) {
    if(ACTION_TYPE.COMMENT_LIKE.value == userAction.actionType){
      item.likeCountActive = true;
    }else if(ACTION_TYPE.COMMENT_HATE.value == userAction.actionType){
      item.hateCountActive = true;
    }
  }
};

loadCommentList();

onMounted(() => {
  mitter.on("postCommentSuccess", (comment) => {
    if(comment.pCommentId === 0){
      dataSource.value.list.unshift(comment); //  unshift用于向数组的最开头添加 一个/多个 元素，并返回新的数组长度
      if(!dataSource.value.totalCount){
        dataSource.value.totalCount = 1;
      }else{
        // dataSource.value.totalCount++;
      }
    }else{
      //  遍历一级评论列表，找commentId等于当前二级评论pCommentId的一级评论
      const curComment = dataSource.value.list.find( item => {
        return item.commentId == comment.pCommentId;
      });
      if(!curComment) {
        return;
      }
      if(!curComment.children){
        curComment.children = [];
      }
      curComment.children.push(comment);
      // //  添加子评论的话，评论数量也要加1
      // dataSource.value.totalCount++;
    }

  });
  mitter.on("delCommentCallback", ({pCommentId, commentId}) => {
    if(pCommentId == 0) {
      // 若是一级评论：用filter过滤列表，删除指定ID的一级评论
      // filter会返回新数组，原数组不会被修改，因此需要重新赋值给list
      dataSource.value.list = dataSource.value.list.filter( item => {
        return item.commentId != commentId;
      });
      // // 查找该一级评论的子评论数量
      // const delCount = dataSource.value.list.children.length ? dataSource.value.list.children.length : 0;
      // //  评论数 = 二级评论数 + 1
      // dataSource.value.totalCount -= delCount + 1;
    }else{
      // 查找这条二级评论所属的一级评论（通过pCommentId匹配一级评论的commentId）
      const pComment = dataSource.value.list.find( item => {
        return item.commentId == pCommentId;
      });
      // 过滤该一级评论的children数组，删除指定ID的二级评论
      // 同样用filter返回新数组，重新赋值给children
      pComment.children = pComment.children.filter( item => {
        //  保留 “子评论ID不等于要删除的commentId” 的元素，等价于 “删除ID等于commentId的那条二级评论”
        return item.commentId != commentId;
      });
      // dataSource.value.totalCount--;
    }
  });
  mitter.on("topCommentCallback", () => {
    loadCommentList();
  });
});

onUnmounted(() => {
  mitter.off("delCommentCallback");
  mitter.off("topCommentCallback");
  mitter.off("postCommentSuccess");
});
</script>

<style scoped lang="scss">
.comment-panel {
  margin-top: 20px;
  .comment-title {
    display: flex;
    align-items: center;
    font-size: 15px;
    .title {
      font-size: 20px;
      font-weight: 500;
      .comment-count {
        margin-left: 5px;
        font-size: 14px;
        margin-right: 30px;
        color: var(--text2);
      }
    }
    .order-type-item {
      cursor: pointer;
      &.active {
        color: var(--blue);
      }
    }
  }
  .comment-content-panel {
    padding-left: 10px;
    position: relative;
    .comment-list {
      padding-bottom: 20px;
    }
  }
}
</style>