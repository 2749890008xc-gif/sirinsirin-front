<template>
  <div :class="['header-bar', 'header-bar-' + theme]">
    <div class="menu">
      <el-popover
        :width="categoryPartCount * (150 + 21) + 24"
        trigger="hover"
        :show-arrow="false"
        :offset="22"
        placement="bottom-start"
      >
        <template #reference>
          <router-link class="iconfont icon-logo" to="/">首页</router-link>
        </template>
        <div class="nav-list">
          <div class="nav-part" v-for="index in categoryPartCount">
            <router-link
              class="nav-item"
              v-for="item in categoryStore.categoryList.slice(
                (index-1) * partCount,
                index * partCount
              )"
              :to="`/v/${item.categoryCode}`"
            >
              <span class="icon" v-if="item.icon">
                <img :src="`${proxy.Api.sourcePath}${item.icon}`" />
              </span>
              <span class="category-name">{{item.categoryName}}</span>
            </router-link>
          </div>
        </div>
      </el-popover>
    </div>
    <div class="search-body">
      <div class="search-panel" @click.stop>
        <div class="search-panel-inner">
          <div :class="['input-panel', showHistory ? 'focus-input' : '']">
            <input
                @focus="onSearchFocus"
                v-model="keyword"
                ref="searchInputRef"
                :placeholder="placeholder"
                @keyup.enter="search"
            />
            <div class="iconfont icon-search" @click="search"></div>
          </div>
          <div class="history-panel" v-if="showHistory">
            <div class="search-title">
              <div class="title">搜索历史</div>
              <div class="btn-clean" @click="searchHistoryStore.cleanHistory()">
                清空
              </div>
            </div>
            <div class="search-tag-list">
              <el-tag
                  v-for="tag in searchHistoryStore.searchHistory"
                  :key="tag"
                  closable
                  type="info"
                  class="search-tag"
                  @click="searchKeyword(tag)"
                  @close="searchHistoryStore.delHistory(tag)"
              >{{ tag }}</el-tag>
            </div>
            <div class="hot-search-title">热搜</div>
            <div class="hot-search-list">
              <div
                  class="search-item"
                  v-for="(item, index) in hotSearchList"
                  @click="searchKeyword(item)"
              >
                {{ index + 1 }} {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="user-panel">
      <div class="user-avatar">
        <template v-if="isLoginValid">
          <Avatar
              class="avatar"
              :avatar="loginStore.userInfo.avatar"

              :userId="loginStore.userInfo.userId"
              :width="35"
              :lazy="false"
              @mouseover="getCountInfo(); getUserInfo()"
          ></Avatar>
          <div class="user-info-panel">
            <div class="nick-name">{{loginStore.userInfo.nickName}}</div>
            <div class="vip-level-tag">
              <!-- TODO 获取用户的vip类型 -->
<!--              <div class="vip-tag" v-if="user.vip !== 0">-->
<!--                {{ user.vip === 1 ? '月度' : user.vip === 2 ? '季度' : '年度' }}大会员-->
<!--              </div>-->
              <div class="vip-tag" v-if="true">
                季度大会员
              </div>
              <!-- TODO 获取用户经验值 -->
<!--              <VLevel class="level" :level="handleLevel(user.exp)" :size="12"></VLevel>-->
              <VLevel class="level" :level="proxy.Utils.handleLevel(12000)" :size="12"></VLevel>
              <div class="sex female" v-if="userInfo.data?.sex == 0"><el-icon size="12"><Female /></el-icon></div>
              <div class="sex male" v-if="userInfo.data?.sex == 1"><el-icon size="12"><Male /></el-icon></div>
            </div>
            <div class="coins">
              <span class="coins-text">硬币: </span>
              <span class="coins-num">{{ userCountInfo.currentCoinCount }}</span>
            </div>
            <div class="count-info">
              <div class="count-info-item">
                <div class="count-value">{{ userCountInfo.focusCount }}</div>
                <div class="count-title">关注</div>
              </div>
              <div class="count-info-item">
                <div class="count-value">{{ userCountInfo.fansCount }}</div>
                <div class="count-title">粉丝</div>
              </div>
              <div class="count-info-item">
                <!-- TODO 获取用户动态数量 -->
                <div class="count-value">{{ userCountInfo.currentCoinCount }}</div>
                <div class="count-title">动态</div>
              </div>
            </div>
            <router-link
                :to="`/account/${loginStore.userInfo.userId}`"
                class="item iconfont icon-user"
            >
              <span class="item-name">个人中心</span>
              <span class="iconfont icon-left"></span>
            </router-link>
            <router-link
                :to="`/ucenter/video`"
                class="item iconfont icon-play"
            >
              <span class="item-name">投稿管理</span>
              <span class="iconfont icon-left"></span>
            </router-link>
            <div class="logout item iconfont icon-logout" @click="logout">退出登录</div>
          </div>
        </template>
        <Avatar
            v-else
            :width="35"
            :lazy="false"
            @click="login"
        ></Avatar>
      </div>
      <div class="user-panel-item" @click="navJump('/message')">
        <el-badge :value="loginStore.messageNoReadCount" :hidden="loginStore.messageNoReadCount == 0">
          <div class="iconfont icon-message"></div>
        </el-badge>
        <div>消息</div>
      </div>
      <div class="user-panel-item" @click="navJump(`/user/${loginStore.userInfo.userId}/collection`)">
        <div class="iconfont icon-collection"></div>
        <div>收藏</div>
      </div>
      <div class="user-panel-item" @click="navJump('/history')">
        <div class="iconfont icon-history"></div>
        <div>历史</div>
      </div>
      <div class="user-panel-item" @click="navJump('/ucenter/home')">
        <div class="iconfont icon-light"></div>
        <div>创作中心</div>
      </div>
      <div class="btn-upload" @click="navJump('/ucenter/postVideo')">
        <el-button type="primary" @click="" size="large">
          <span class="iconfont icon-upload"></span>
          <span>投稿</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {mitter} from "@/eventbus/eventBus.js";
import {ref, reactive, getCurrentInstance, watch, computed ,onMounted} from 'vue';
import { Female, Male } from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import { useLoginStore } from "@/stores/loginStore.js";
import Avatar from "@/components/Avatar.vue";
const loginStore = useLoginStore();
import {useSearchHistoryStore} from "@/stores/searchHistoryStore.js";
const searchHistoryStore = useSearchHistoryStore();

import { useCategoryStore } from "@/stores/categoryStore.js";
import VLevel from "@/components/VLevel.vue";
import VueCookies from "vue-cookies";
const categoryStore = useCategoryStore();

const props = defineProps({
  theme:{
    type: String,
    default: "light", //  light指白色，dark指黑色
  },
  hotSearchList:{
    type: Array,
    default: [],
  },
})

// 新增页面初始化标记
let pageFirstLoad = true;

const login = () => {
  // 页面刚初始化时，禁止自动弹窗，仅用户手动点击才弹
  if (pageFirstLoad) {
    pageFirstLoad = false;
    return;
  }
  loginStore.setLogin(true);
};
const userId = computed(() => loginStore.userInfo.userId || '');
const userInfo = ref({});

const isLoginValid = computed(() => {
  const hasUser = Object.keys(loginStore.userInfo).length > 0
  const token = VueCookies.get('token')
  return hasUser && !!token
})

const getUserInfo = async () => {
  if (!userId.value) return;
  try {
    let result = await proxy.Request({
      url: proxy.Api.uHomeGetUserInfo,
      params: {userId: userId.value},
    });
    if(!result) throw new Error('invalid');
    userInfo.value.data = result.data;
  } catch (err){
  // token失效，清除登录信息
  loginStore.saveUserInfo({});
  VueCookies.remove('token');
  }
}

const userCountInfo = ref({});
const getCountInfo = async () => {
  try {
    let result = await proxy.Request({
      url: proxy.Api.getUserCountInfo,
      params: {},
    });
    if(!result) throw new Error('invalid');
    userCountInfo.value = result.data;
  } catch (err){
  loginStore.saveUserInfo({});
  VueCookies.remove('token');
  }
};

const logout = async () => {
  proxy.Confirm({
    message: "确定要退出吗？",
      okfun: async () => {
        try{
          let result = await proxy.Request({
            url: proxy.Api.logout,
          });
        }catch(err){

      }finally {
        loginStore.saveUserInfo({});
        VueCookies.remove('token'); // 新增删除cookie
        router.push('/'); // 必然执行，跳转首页
      }
    },
  });
};


const partCount = 5;
const categoryPartCount = computed(() => {
  return Math.ceil(categoryStore.categoryList.length / partCount);
});

const navJump = (url) => {
  if (!isLoginValid.value) {
    return;
  }
  window.open(url, "_blank");
};

const placeholder = ref("守岸人");
const keyword = ref();

const searchKeyword = (item) => {
  // 主动搜索时，添加历史（可选：填充到输入框优化体验）
  keyword.value = item;
  searchHistoryStore.addHistory(item);
  router.push({
    path: "/search",
    query: { keyword: item },
  });
};

const search = () => {
  if (!keyword.value) {
    keyword.value = placeholder.value;
  }
  // 主动搜索时，添加历史
  searchHistoryStore.addHistory(keyword.value);
  router.push({
    path: "/search",
    query: { keyword: keyword.value },
  });
};

const searchInputRef = ref();
const showHistory = ref(false);
const onSearchFocus = () => {
  showHistory.value = true;
};

onMounted(() => {
  searchHistoryStore.initHistory();

  const token = VueCookies.get('token')
  const hasUser = Object.keys(loginStore.userInfo).length > 0
  if (!token && hasUser) {
    loginStore.saveUserInfo({})
  }

  // 挂载200ms后取消初始化锁定，允许手动点击弹窗
  setTimeout(() => {
    pageFirstLoad = false;
  }, 200)

  document.addEventListener("click", () => {
    showHistory.value = false;
  });
  mitter.on("windowScroll", () => {
    if (showHistory.value) {
      showHistory.value = false;
      searchInputRef.value.blur();
    }
  });
});

// //  监听 userId 变化，自动重新获取
// watch(userId, (newVal) => {
//   if (newVal) getUserInfo();
// }, { immediate: true });
</script>

<style lang="scss" scoped>
.header-bar {
  width: 100%;  //  这个越大，导航栏右侧除了首页，剩下的都会越来越偏右。原来是100%
  height: 64px;
  padding: 0 25px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;

  .menu{
    display: flex;
    align-items: center;
    a{
      text-decoration: none;
    }

    .icon-logo{
      font-size: 16px;
      &::before{
        float: left;
        //margin-top: -3px;
        font-size: 24px;
        margin-right: 5px;
      }
    }
  }

  .search-body{
    color: #61666d;
    .search-panel{
      margin: 0 auto;
      position: relative;
      max-width: 80%;
      .search-panel-inner{
        width: 100%;
        position: absolute;
        top: 10px;
        left: 0;
        border: 1px solid #e3e5e7;
        border-radius: 8px;
        overflow: hidden;
        z-index: 1001;
        .input-panel{
          display: flex;
          align-items: center;
          background: #f1f2f3;
          input{
            width: 100%;
            border: none;
            background: #f1f2f3;
            border-radius: 5px;
            padding: 8px 10px;
            margin: 3px 10px 3px 10px;
            &:focus{
              outline: none;
            }
          }
          .iconfont{
            font-size: 20px;
            margin-right: 10px;
            color: #2f3238;
            width: 35px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            cursor: pointer;
            &:hover{
              background: #ddd;
            }
          }
        }
        .focus-input {
          background: #fff;
        }

        .history-panel {
          background: #fff;
          padding: 10px;
          text-align: left;

          .search-title {
            display: flex;
            justify-content: space-between;

            .title {
              font-size: 16px;
            }

            .btn-clean {
              cursor: pointer;
              font-size: 13px;
              color: #9499a0;

              &:hover {
                color: #40c5f1;
              }
            }
          }

          .search-tag-list {
            margin-top: 10px;

            .el-tag {
              cursor: pointer;
              margin-right: 5px;
              margin-top: 5px;

              :deep(.el-tag__content) {
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 200px;
                overflow: hidden;
              }
            }
          }

          .hot-search-title {
            margin-top: 10px;
            font-size: 16px;
          }

          .hot-search-list {
            margin-top: 5px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;

            .search-item {
              width: 50%;
              padding: 8px 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;

              &:hover {
                background: #d6d9dd;
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }
  .user-panel{
    display: flex;
    justify-content: center;
    align-items: center;
    .user-avatar{
      position: relative;
      margin-right: 13px;
      width: 35px;
      height: 35px;
      .avatar{
        transition: transform 0.3s ease;
        position: absolute;
        z-index: 1001;  //  原本为10001，但因为出现弹窗后该头像仍然可以点击，因此调低
        left: 0;
        top: 0;
      }
      .avatar:hover{
        position: absolute;
        z-index: 1001;  //  原本为10001，但因为出现弹窗后该头像仍然可以点击，因此调低
        left: 0;
        top: 0;
      }
      .user-info-panel{
        padding: 40px 20px 10px;
        background: #fff;
        width: 300px;
        position: absolute;
        top: 60px;
        left: -155px;
        border-radius: 5px;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;

        .nick-name{
          font-size: 16px;
          text-align: center;
          line-height: 40px;
          color: var(--text);
          font-weight: 600;
        }
        .vip-level-tag {
          display: flex;
          align-items: center;
          justify-content: center;

          .vip-tag {
            display: inline-block;
            box-sizing: border-box;
            max-width: 58px;
            height: 16px;
            color: #fff;
            background: var(--Pi5);
            border-radius: 2px;
            line-height: 16px;
            font-size: 10px;
            padding: 0 3px;
            margin-right: 10px;
            overflow: hidden;
            white-space: nowrap;
            font-weight: 400;
            cursor: pointer;
          }

          .level{
            margin-right: 10px;
          }

          .sex {
            height: 14px;
            width: 14px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .female {
            background-color: var(--Pi2);
            color: var(--Pi5);
          }
          .male {
            background-color: var(--Lb2);
            color: var(--Lb5_u);
          }
          .iconfont {
            font-size: 12px;
            margin-right: 10px;
            line-height: 14px;
          }
        }
        .coins {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin: 6px 0;

          .coins-text {
            margin-right: 5px;
            color: var(--text3);
          }

          .coins-num {
            color: var(--text);
          }
        }
        .count-info{
          margin: 10px 0;
          display: flex;
          justify-content: space-around;
          .count-info-item{
            text-align: center;
            .count-title{
              color: var(--text3);
              margin-top: 5px;
            }
            .count-value{
              text-align: center;
              color: var(--text);
            }
          }
        }
        .item{
          font-size: 14px;
          display: block;
          text-align: left;
          line-height: 40px;
          color: var(--text2);
          padding: 0 20px;
          text-decoration: none;
          display: flex;
          justify-content: space-between;
          .item-name{
            flex: 1;
          }
          &::before{
            margin-right: 15px;
          }
          //&::before{  //  把这个写上的话会导致用户中心、投稿管理前面的图标样式出现问题
          //  background: #e8e8e8;
          //  border-radius: 5px;
          //}
        }
        .logout{
          display: block;
          margin-top: 10px;
          border-top: 1px solid #ddd;
          cursor: pointer;
        }
      }
      &:hover{
        overflow: visible;
        .avatar{
          transform: scale(2.5) translateY(10px) translateX(-10px);
        }
        .user-info-panel{
          opacity: 1;
          pointer-events: auto;
        }
      }
    }

    .user-panel-item{
      text-align: center;
      cursor: pointer;
      padding: 0 13px;
      .iconfont{
        text-align: center;
        font-size: 20px;
        font-weight: normal;
      }
    }
    .btn-upload{
      margin-left: 10px;
      .el-button{
        background: #fb7299;
        border-color: #fb7299;
        border-radius: 8px;
        padding: 0px 20px;
        .iconfont{
          &::before{
            margin: 5px;
          }
        }
      }
    }
  }
}
.header-bar-light{
  color: #fff;
  .menu-item{
    color: #fff;
  }
  a{
    color: #fff;
  }
}
.header-bar-dark{
  color: #61666D;

  .menu-item{
    color: #61666D;
  }
  a{
    color: #61666D;
  }
}

.nav-list{
  display: flex;
  .nav-part{
    &:last-child{
      border-right: none;
    }
    padding: 0 10px;
    border-right: 1px solid #ddd;
    .nav-item{
      display: flex;
      padding: 0 10px;
      height: 35px;
      border-radius: 3px;
      cursor: pointer;
      align-items: center;
      width: 150px;
      text-decoration: none;
      color: #2f3238;
      &:hover{
        background: #ddd;
      }
      .icon{
        width: 25px;
        height: 25px;
        overflow: hidden;
        margin-right: 5px;
        img{
          width: 100%;
        }
      }
      .category-name{
        flex: 1;
      }
    }
  }
}
</style>