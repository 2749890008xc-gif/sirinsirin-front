<template>
  <div class="send-panel">
    <Avatar
      :avatar="!isLoginValid.value
        ? ''
        : loginStore.userInfo.avatar"
    />
    <div class="input-panel">
      <template v-if="showSend">
        <el-form
            :model="formData"
            :rules="rules"
            ref="formDataRef"
            @submit.prevent
        >
          <!--input输入-->
          <el-form-item label="" prop="" class="input-area">
            <!-- :autosize="{minRows: 1, maxRows: 5}"：表示最多5行，最少1行 -->
            <el-input
                size="large"
                type="textarea"
                :rows="1"
                clearable
                v-model="formData.content"
                show-word-limit
                :maxlength="500"
                :autosize="{minRows: 1, maxRows: 5}"
                resize="none"
                :placeholder="formData.nickName ? '@'+formData.nickName : ''"
            ></el-input>
            <div class="comment-image" v-if="formData.imgPath">
              <Cover fit="cover" :source="formData.imgPath"></Cover>
              <span class="del iconfont icon-close" @click="delImage"></span>
            </div>
          </el-form-item>
        </el-form>
        <div class="op-panel">
          <div class="op-btns">
<!--            TODO 将效果改为点击表情后，不立即关闭表情面板，关闭表情面板的方式为：再次点击表情按钮-->
            <el-popover
              ref="elPopoverRef"
              :width="400"
              trigger="click"
              :show-arrow="false"
              :offset="5"
              placement="bottom-start"
            >
              <template #reference>
                <div class="iconfont icon-emoji"></div>
              </template>
              <template #default>
                <!-- tab-position="bottom" 用于将表情面板的tab移动到表情面板的下面 -->
                <el-tabs v-model="activeEmoji" tab-position="bottom" @click.stop>
                  <el-tab-pane
                    :label="emoji.name"
                    :name="emoji.name"
                    v-for="emoji in emojiList"
                  >
                    <div class="emoji-list">
                      <div class="emoji-item" v-for="item in emoji.emojiList" @click="sendEmoji(item)">
                        {{ item }}
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </template>
            </el-popover>
            <el-upload
                ref="uploaderRef"
                :multiple="false"
                :show-file-list="false"
                :http-request="selectFile"
                :accept="proxy.imageAccept"
            >
              <div class="iconfont icon-image"></div>
            </el-upload>
          </div>
          <div class="send-btn">
            <el-button type="primary" @mousedown="submitComment">发布</el-button>
          </div>
        </div>
      </template>
      <div v-else class="no-send">UP主已关闭评论</div>
    </div>
  </div>
</template>

<script setup>
import {mitter} from "@/eventbus/eventBus.js";
import emojiList from "@/utils/Emoji.js";
import {ref, getCurrentInstance, nextTick, onMounted, onUnmounted, inject, computed, onBeforeUnmount} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 路由跳转实例
import {useLoginStore} from "@/stores/loginStore.js";
import Cover from "@/components/Cover.vue";
import {uploadImage} from "@/utils/Api.js";
import VueCookies from "vue-cookies";
const loginStore = useLoginStore();

const props = defineProps({
  sendType: {
    type: Number,
  },
  showSend: {
    type: Boolean,
    default: true,
  },
});

const formData = ref({});
const formDataRef = ref();
const rules = {
  title: [{ required: true, message: "请输入内容",}],
};

//  插入图片
const selectFile = (file) => {
  formData.value.imgPath = file.file;
};
const delImage = () => {
  formData.value.imgPath = null;
};

const isLoginValid = computed(() => {
  const hasUser = Object.keys(loginStore.userInfo).length > 0
  const token = VueCookies.get('token')
  return hasUser && !!token
})
//  提交评论
const submitComment = async (event) => {
  event.preventDefault();
  if(!isLoginValid.value) {
    loginStore.setLogin(true);
    return;
  }
  const params = props.sendType == 0 ?
      {content: formData.value.content, imgPath: formData.value.imgPath} :
      Object.assign({}, formData.value);
  if(!params.content) {
    proxy.Message.warning("请输入评论");
    return;
  }
  params.videoId = route.params.videoId;
  if(params.imgPath) {
    const imgPath = await uploadImage(params.imgPath, true);
    params.imgPath = imgPath;
  }
  let result = await proxy.Request({
    url: proxy.Api.postComment,
    params,
  });
  if(!result) {
    return;
  }
  formDataRef.value.resetFields();
  formData.value = {};
  proxy.Message.success("发布成功");
  mitter.emit("postCommentSuccess", result.data);
};

//  插入表情
const elPopoverRef = ref();
const activeEmoji = ref("小黄脸");
const sendEmoji = (emoji) => {
  formData.value.content = formData.value.content
    ? formData.value.content+emoji
    : emoji;
  //  选择完表情后关闭表情面板
  elPopoverRef.value.hide();
};

onMounted(() => {
  mitter.on("initCommentData", (data) => {
    if(props.sendType !== 0){
      formData.value = Object.assign({}, data);
    }
  });
});
//  表示在组件卸载之前就关闭 “initCommentData” 事件
//  如果使用onUnMounted的话会导致：点击回复一级评论或其子评论 -> 点击其他一级评论或其子评论 -> 点回第一次的一级评论或子评论时无法正确显示回复框中的placeholder属性
onBeforeUnmount(() => {
  mitter.off("initCommentData");
});
</script>

<style scoped lang="scss">
.send-panel {
  margin-top: 20px;
  display: flex;

  .input-panel {
    flex: 1;
    margin-left: 15px;

    :deep(.el-form-item) {
      margin-bottom: 0px;
    }

    .no-send {
      background: #ebebeb;
      text-align: center;
      padding: 15px;
      border-radius: 5px;
      color: var(--text3);
    }

    .input-area {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 8px;

      :deep(.el-textarea__inner) {
        box-shadow: none;
        padding: 0px;
      }

      .comment-image {
        margin-top: 5px;
        width: 72px;
        height: 72px;
        display: flex;
        align-items: center;
        position: relative;

        .del {
          position: absolute;
          top: 0px;
          right: 0px;
          background: #0003;
          width: 20px;
          height: 20px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0px 5px 0px 5px;
          cursor: pointer;
        }
      }
    }

    .op-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 5px;

      .op-btns {
        display: flex;
        align-items: center;

        .iconfont {
          cursor: pointer;
          border: 1px solid #ddd;
          padding: 3px 8px;
          margin-right: 5px;
          border-radius: 5px;
        }
      }
    }
  }
}
.emoji-list {
  max-height: 240px; /* 表情面板的高度，可根据需要调整 */
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* 表情项之间的间距 */
  padding: 10px 0;
  .emoji-item {
    float: left;
    font-size: 23px;
    padding: 2px;
    text-align: center;
    border-radius: 3px;
    margin-left: 10px;
    margin-top: 5px;
    cursor: pointer;
    &:hover {
      background: #ddd;
    }
  }
}
</style>