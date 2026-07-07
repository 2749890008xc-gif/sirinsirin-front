<template>
  <div
      class="main-container"
      :style="{
      'max-width': proxy.bodyMaxWidth + 'px',
      'min-width': proxy.bodyMinWidth + 'px',
    }"
  >
    <LayoutHeader theme="dark"></LayoutHeader>
  </div>
  <div
      class="user-home-body-container"
      :style="{
        'max-width': proxy.bodyMaxWidth + 'px',
        'min-width': proxy.bodyMinWidth + 'px',
        'background-image': `url(${proxy.Utils.getLocalImage(
              'uhome-bg/' + userInfo.theme + '.png'
            )})`,
      }"
  >
    <div class="user-home-body">
      <div class="user-info-panel">
        <div class="avatar">
          <Avatar
              :width="90"
              :avatar="userInfo.avatar"
              @click="updateUserInfo"
          ></Avatar>
        </div>
        <div class="user-info">
          <div class="user-name">
            <div>{{userInfo.nickName}}</div>
            <div
                :class="[
              'iconfont',
              userInfo.sex == 0 ? 'icon-sexw' : 'icon-sexm',
            ]"
                v-if="userInfo.sex == 0 || userInfo.sex == 1"
            ></div>
            <div
              class="iconfont icon-edit"
              @click="updateUserInfo"
              v-if="myself"
            ></div>
          </div>
          <div class="introduction">
            {{userInfo.personIntroduction}}
          </div>
        </div>
        <div class="focus-panel" v-if="!myself">
          <div
              class="btn-focus btn-cancel-focus"
              @click="cancelFocusUser(currentUserId)"
              v-if="userInfo.haveFocus"
          >
            取消关注
          </div>
          <div class="btn-focus" @click="focusUser(currentUserId)" v-else>
            关注
          </div>
        </div>
      </div>
      <div class="home-nav">
        <div class="nav-panel">
          <router-link
              :class="[
                  'nav-item iconfont',
                  item.icon,
                  item.pathNames.includes(route.name) ? 'active' : ''
              ]"
              v-for="item in navList"
              :to="item.path"
          >{{item.name}}</router-link>
        </div>
        <div class="search">
          <el-input
            placeholder="搜视频"
            style="width: 150px"
            v-model="videoName"
            @keyup.enter="searchVideo"
          >
            <template #suffix>
              <span class="iconfont icon-search"></span>
            </template>
          </el-input>
        </div>
        <div class="count-info">
          <!-- 关注数 -->
          <router-link
              v-if="myself"
              class="count-item"
              :to="`/user/${currentUserId}/focus`"
          >
            <div class="title-info">关注数</div>
            <div class="count-value">{{ userInfo.focusCount }}</div>
          </router-link>
          <div class="count-item" v-else>
            <div class="title-info">关注数</div>
            <div class="count-value">{{userInfo.focusCount}}</div>
          </div>
          <!-- 粉丝数 -->
          <router-link
              v-if="myself"
              class="count-item"
              :to="`/user/${currentUserId}/fans`"
          >
            <div class="title-info">粉丝数</div>
            <div class="count-value">{{ userInfo.fansCount }}</div>
          </router-link>
          <div class="count-item" v-else>
            <div class="title-info">粉丝数</div>
            <div class="count-value">{{ userInfo.fansCount }}</div>
          </div>
          <!-- 获赞数 -->
          <div class="count-item">
            <div class="title-info">获赞数</div>
            <div class="count-value">{{ userInfo.likeCount }}</div>
          </div>
          <!-- 播放数 -->
          <div class="count-item">
            <div class="title-info">播放数</div>
            <div class="count-value">{{ userInfo.playCount }}</div>
          </div>
        </div>
      </div>
      <div class="user-home-content">
        <router-view></router-view>
      </div>
    </div>
    <div class="change-them-btn" @click="selectTheme" v-if="myself"></div>
  </div>
  <UserInfoEdit ref="userInfoEditRef" @reload="loadUserInfo"></UserInfoEdit>
  <UserHomeTheme ref="userHomeThemeRef" @changeTheme="changeTheme"></UserHomeTheme>
  <Account></Account>
</template>

<script setup>
import UserInfoEdit from "./UserInfoEdit.vue"
import {ref, reactive, getCurrentInstance, computed, provide} from "vue";
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import LayoutHeader from "@/views/layout/LayoutHeader.vue";
import Avatar from "@/components/Avatar.vue";
import { useLoginStore } from "@/stores/loginStore.js";
import UserHomeTheme from "@/views/userhome/UserHomeTheme.vue";
import Account from "@/views/account/Account.vue";
const loginStore = useLoginStore();

const currentUserId = route.params.userId;

const navList = ref([
  {
    name: "主页",
    path: "/user/" + currentUserId,
    icon: "icon-home",
    pathNames: ["uhome", "uhomeFans", "uhomeFocus"],
  },
  {
    name: "投稿",
    path: "/user/" + currentUserId + "/video",
    icon: "icon-play",
    pathNames: ["uhomeMyVideo"],
  },
  {
    name: "视频列表",
    path: "/user/" + currentUserId + "/series",
    icon: "icon-playlist",
    pathNames: ["uhomeSeries", "uhomeSeriesDetail"],
  },
  {
    name: "收藏",
    path: "/user/" + currentUserId + "/collection",
    icon: "icon-collection",
    pathNames: ["collection"],
  },
]);

//  判断是否是本人
const myself = computed(() => {
  return loginStore.userInfo.userId == currentUserId;
});

const userInfo = ref({});
provide("userInfo", userInfo);

const loadUserInfo = async () => {
  let result = await proxy.Request({
    url: proxy.Api.uHomeGetUserInfo,
    params: {
      userId: currentUserId,
    },
  });
  if (!result) {
    return;
  }
  userInfo.value = result.data;
};

loadUserInfo();

const userInfoEditRef = ref();
const updateUserInfo = () => {
  userInfoEditRef.value.show(userInfo.value);
};

const videoName = ref();
const searchVideo = () => {
  router.push({
    path: `/user/${route.params.userId}/video`,
    query: {
      videoName: videoName.value,
    },
  });
};

const focusUser = async (focusUserId, changeCountType = 0, fn) => {
  if (Object.keys(loginStore.userInfo).length === 0) {
    loginStore.setLogin(true);
    return;
  }
  let result = await proxy.Request({
    url: proxy.Api.uHomeFocus,
    params: {
      focusUserId,
    },
  });
  if (!result) {
    return;
  }
  if (changeCountType == 0) {
    userInfo.value.haveFocus = true;
    userInfo.value.fansCount++;
  }else{
    userInfo.value.focusCount++;
  }
  if(fn){
    fn();
  }
};

const cancelFocusUser = async (focusUserId, changeCountType = 0, fn) => {
  let result = await proxy.Request({
    url: proxy.Api.uHomeCancelFocus,
    params: {
      focusUserId,
    },
  });
  if (!result) {
    return;
  }
  if (changeCountType === 0) {
    userInfo.value.haveFocus = false;
    userInfo.value.fansCount--;
  }else{
    userInfo.value.focusCount--;
  }
  if(fn){
    fn();
  }
};

provide("cancelFocusUser", (focusUserId, fn) => {
  cancelFocusUser(focusUserId, 1, fn);
});

provide("focusUser", (focusUserId, fn) => {
  focusUser(focusUserId, 1, fn);
});

const userHomeThemeRef = ref();
const selectTheme = () => {
  userHomeThemeRef.value.show(userInfo.value.theme);
};

const changeTheme = (theme) => {
  userInfo.value.theme = theme;
};
</script>

<style scoped lang="scss">
.header-fixed {
  background: #fff;
  height: 64px;
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.user-home-body-container {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  margin: 0 auto;
  .user-home-body {
    margin: 0 auto;
    position: relative;
    min-height: calc(100vh - 64px);
    width: 1300px;
    .header {
      height: 250px;
      overflow: hidden;
    }

    .user-info-panel {
      background: #fff;
      position: relative;
      padding: 5px 30px 5px 0;
      border-radius: 0 0 5px 5px;
      display: flex;
      align-items: center;

      .avatar {
        position: absolute;
        left: 20px;
        top: -35px;
      }

      .user-info {
        flex: 1;
        color: var(--text);
        margin-left: 120px;

        .user-name {
          font-size: 20px;
          font-weight: bold;
          display: flex;
          align-items: center;

          .iconfont {
            font-weight: normal;
            margin-left: 10px;
            color: var(--text3);
            cursor: pointer;
          }

          .icon-sexw {
            font-size: 20px;
            color: #f25d8e;
          }

          .icon-sexm {
            font-size: 20px;
            color: #5fd4f2;
          }
        }

        .introduction {
          color: var(--text3);
          margin-top: 5px;
          min-height: 20px;
        }
      }

      .focus-panel {
        .btn-focus {
          background: #f25d8e;
          color: #fff;
          padding: 8px 25px;
          border-radius: 5px;
          cursor: pointer;

          &:hover {
            opacity: 0.7;
          }
        }

        .btn-cancel-focus {
          background: #fff;
          color: var(--text);
          border: 1px solid #ddd;
        }
      }
    }

    .home-nav {
      top: 0;
      position: sticky;
      margin-top: 10px;
      background: #fff;
      border-radius: 5px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      z-index: 999;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

      .nav-panel {
        display: flex;
        align-items: center;

        .nav-item {
          text-decoration: none;
          margin-right: 35px;
          position: relative;
          display: flex;
          align-items: center;
          color: var(--text2);
          line-height: 65px;
          font-size: 14px;

          &::before {
            margin-right: 5px;
            font-size: 20px;
          }

          &:hover {
            color: var(--blue);

            &::after {
              content: "";
              border: 2px solid var(--blue);
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
            }
          }
        }

        .active {
          color: var(--blue);

          &::after {
            content: "";
            border: 2px solid var(--blue);
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
          }
        }
      }

      .search {
        margin-left: 20px;
        flex: 1;
      }

      .count-info {
        display: flex;
        text-align: center;
        font-size: 13px;

        .count-item {
          padding: 0 10px;
          text-decoration: none;

          .title-info {
            color: var(--text3);
          }

          .count-value {
            margin-top: 5px;
          }
        }

        a.count-item {
          .title-info {
            color: var(--blue2);
          }

          color: var(--blue2);
        }
      }
    }

    .user-home-content {
      margin-top: 10px;
    }
  }
}

.change-them-btn {
  position: absolute;
  top: 64px;
  right: 0;
  width: 58px;
  height: 49px;
  background-image: url("../../assets/theme-trigger.png");
  background-position: 0 0;
  background-repeat: no-repeat;
  cursor: pointer;
  &:hover {
    background-position: -522px 0px;
  }
}
</style>