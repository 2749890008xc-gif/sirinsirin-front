<template>
  <div class="top-panel">
    <el-card>
      <el-form :model="searchForm" @submit.prevent>
        <el-row :gutter="10">
          <el-col :span="5">
            <!--input输入-->
            <el-form-item label="视频">
              <el-input
                  clearable
                  placeholder="输入视频名称搜索"
                  v-model="searchForm.videoNameFuzzy"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-button type="success" @click="loadDataList">搜索</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
  <el-card class="table-data-card">
    <div class="comment-panel">
      <Table
          ref="tableInfoRef"
          :columns="columns"
          :fetch="loadDataList"
          :dataSource="tableData"
          :options="tableOptions"
          :extHeight="tableOptions.extHeight"
      >
        <template #slotComment="{ index, row }">
          <div class="comment-info">
            <Avatar :avatar="row.avatar" :userId="row.userId"></Avatar>
            <div class="comment">
              <div>
                <router-link
                    target="_blank"
                    class="a-link nick-name"
                    :to="`/user/${row.userId}`"
                >{{ row.nickName }}</router-link>
                <template v-if="row.replyUserId">
                  回复@
                  <router-link
                      target="_blank"
                      class="a-link nick-name"
                      :to="`/user/${row.replyUserId}`"
                  >{{ row.replyNickName }}</router-link>
                  的评论
                </template>
              </div>
              <div class="content">{{ row.content }}</div>
              <div v-if="row.imgPath" class="image-show">
                <!-- 这里的代码原来是：row.imgPath + proxy.imageThumbnailSuffix -->
                <Cover
                    :source="row.imgPath"
                    :preview="true"
                    fit="cover"
                ></Cover>
              </div>
              <div class="time-info">
                <div class="time">{{ row.postTime }}</div>
                <div
                    class="iconfont icon-delete"
                    @click="delComment(row.commentId)"
                ></div>
              </div>
            </div>
          </div>
        </template>

        <template #slotVideo="{ index, row }">
          <router-link
              :to="`/video/${row.videoId}`"
              target="_blank"
              class="a-link"
          >
            <Cover :source="row.videoCover"></Cover>
            <div class="video-name">{{ row.videoName }}</div>
          </router-link>
        </template>
      </Table>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

const columns = [
  {
    label: "评论信息",
    scopedSlots: "slotComment",
  },
  {
    label: "视频信息",
    scopedSlots: "slotVideo",
    width: 150,
  },
];

const tableInfoRef = ref();
const tableOptions = ref({
  extHeight: 20,
});

const searchForm = ref({});
const tableData = ref({});
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
  };
  Object.assign(params, searchForm.value);
  let result = await proxy.Request({
    url: proxy.Api.loadComment,
    params: params,
  });
  if (!result) {
    return;
  }
  Object.assign(tableData.value, result.data);
};

const delComment = (commentId) => {
  proxy.Confirm({
    message: "确定要删除吗？",
    okfun: async () => {
      let result = await proxy.Request({
        url: proxy.Api.delComment,
        params: {
          commentId,
        },
      });
      if (!result) {
        return;
      }
      proxy.Message.success("删除成功");
      loadDataList();
    },
  });
};
</script>

<style lang="scss" scoped>
.comment-panel {
  .comment-info {
    display: flex;
    .comment {
      margin-left: 10px;
    }
  }
  .time-info {
    display: flex;
    font-size: 12px;
    .iconfont {
      margin-left: 5px;
      font-size: 13px;
      cursor: pointer;
    }
  }
  .video-name {
    text-decoration: none;
    color: var(--text3);
    font-size: 13px;
    margin-top: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.image-show {
  width: 100px;
  height: 100px;
  overflow: hidden;
  margin: 5px 0;
}
</style>