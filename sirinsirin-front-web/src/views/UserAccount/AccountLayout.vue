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
  <div class="top-header">
    <div class="top-img"></div>
  </div>
  <div class="account-panel">
    <div class="left-panel">
      <div class="account-title">个人中心</div>
      <div
          :class="[
          'account-part',
          route.name === item.pathNames[0] ? 'active' : ''
        ]"
          v-for="item in navList"
          @click="selectAccountType(item)"
      >
        <div :class="['iconfont-extend', item.icon]">{{ item.name }}</div>
      </div>
    </div>
    <div class="right-panel">
      <div class="home" v-if="curNav.type === 1">
        <Home></Home>
      </div>
      <div class="home" v-if="curNav.type === 2">
        <UserInfo></UserInfo>
      </div>
      <div class="home" v-if="curNav.type === 3">
        <UserAvatar></UserAvatar>
      </div>
      <div class="security" v-if="curNav.type === 4">
        <Security></Security>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, getCurrentInstance, computed, provide, onMounted, watch} from "vue";
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import LayoutHeader from "@/views/layout/LayoutHeader.vue";
import { useLoginStore } from "@/stores/loginStore.js";
import Home from './Home.vue';
import Security from "./Security.vue";
import UserAvatar from "./UserAvatar.vue";
import UserInfo from "./UserInfo.vue";
import VueCookies from "vue-cookies";
const loginStore = useLoginStore();

const currentUserId = route.params.userId;

const navList = ref([
  {
    name: "首页",
    path: "/account/" + currentUserId,
    icon: "icon-shouye1",
    type: 1,
    typeCode: '',
    pathNames: ["home"],
  },
  {
    name: "我的信息",
    path: "/account/" + currentUserId + "/userInfo",
    icon: "icon-yonghu",
    type: 2,
    typeCode: 'userInfo',
    pathNames: ["userInfo"],
  },
  {
    name: "我的头像",
    path: "/account/" + currentUserId + "/avatar",
    icon: "icon-anquan1-copy",
    type: 3,
    typeCode: 'avatar',
    pathNames: ["avatar"],
  },
  {
    name: "账号安全",
    path: "/account/" + currentUserId + "/security",
    icon: "icon-touxiang",
    type: 4,
    typeCode: 'security',
    pathNames: ["security"],
  },
]);
const curNav = ref({});

const userInfo = ref({});
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

const userCountInfo = ref({});
const loadUserCountInfo = async () => {
  const token = VueCookies.get('token');
  if(!token) {
    return;
  }
  let result = await proxy.Request({
    url: proxy.Api.getUserCountInfo,
    params: {},
  });
  if (!result) {
    return;
  }
  userCountInfo.value = result.data;
}

const selectAccountType = (item) => {
  curNav.value = item;
  if (item.typeCode === '') {
    // 首页只传userId，不带type
    router.push(`/account/${currentUserId}`);
  } else {
    router.push(`/account/${currentUserId}/${item.typeCode}`);
  }
};

// 根据当前路由匹配侧边栏激活项
const setCurNav = () => {
  const name = route.name;
  const matchItem = navList.value.find(item => item.pathNames[0] === name);
  if (matchItem) curNav.value = matchItem;
};

// 向下提供用户信息，Home/UserInfo等子组件直接注入，不用重复调接口
provide("userInfo", userInfo);
provide("userCountInfo", userCountInfo);

// 监听路由对象（path/name/params变化都会触发）
watch(route, () => {
  setCurNav();
}, { deep: true });

onMounted(() => {
  setCurNav();
  loadUserInfo();
  loadUserCountInfo();
});
</script>

<style scoped lang="scss">
.top-header {
  width: 100%;
  height: 106px;
  background: url("@/assets/account_top_bg.png") repeat-x;
  .top-img{
    width: 980px;
    height: 106px;
    margin: 0 auto;
    background: url("@/assets/account_top.png") no-repeat;
  }
}

.account-panel {
  display: flex;
  height: calc(100vh - 180px);
  width: 1200px;
  margin: 0px auto;

  .left-panel {
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-color: #fff;
    width: 200px;
    border-radius: 5px;
    padding: 5px 10px 20px 10px;
    border: 1px solid #ddd;
    margin: 10px 0px;

    .account-title {
      font-size: 20px;
      line-height: 45px;
      padding-left: 10px;
      font-weight: 600;
      color: #262626;
      border-bottom: 1px solid #ddd;
    }

    .account-part {
      cursor: pointer;
      line-height: 50px;
      border-radius: 5px;
      padding: 0px 10px;
      align-items: center;
      display: flex;
      font-size: 14px;

      &:hover {
        background: #f8f8f8;
      }

      .iconfont {
        &::before {
          margin-right: 5px;
        }
      }
      .iconfont-extend {
        &::before {
          margin-right: 5px;
        }
      }
    }

    .active {
      color: var(--blue);
      background: #f8f8f8;
    }
  }

  .right-panel {
    flex: 1;
    margin-left: 10px;
    background: #fff;
    border-radius: 5px;
    border: 1px solid #ddd;
    margin: 10px 0px;
    margin-left: 10px;

    .home {
      height: 100%;
      display: flex;
      justify-content: center;
    }

    .message-list {
      height: 100%;
      padding: 10px;
      overflow: auto;
    }
  }
}
</style>