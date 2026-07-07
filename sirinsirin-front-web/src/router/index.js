import { createRouter, createWebHistory } from 'vue-router'
import request from '@/utils/Request'
import { useLoginStore } from '@/stores/loginStore.js'
import VueCookies from 'vue-cookies'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/noEmailCheckCode',
      name: 'noEmailCheckCode',
      component: () => import('@/views/account/NoEmailCheckCode.vue'),
    },
    //  主站
    {
      path: '/',
      name: 'layout',
      component: () => import('../views/layout/Layout.vue'),
      children: [
        {
          path: '/',
          name: 'index',
          component: () => import('../views/index/Index.vue'),
        },
        {
          path: '/v/:pCategoryCode',
          name: 'categoryVideo',
          component: () => import('../views/videoList/CategoryVideo.vue'),
        },
        {
          path: '/v/:pCategoryCode/:categoryCode',
          name: 'subCategoryVideo',
          component: () => import('../views/videoList/CategoryVideo.vue'),
        },
        {
          path: '/video/:videoId',
          name: 'videoDetail',
          component: () => import('../views/videoDetail/VideoDetail.vue'),
        },
        {
          path: '/history',
          name: 'history',
          component: () => import('@/views/history/History.vue'),
        },
        {
          path: '/message',
          name: 'messagehome',
          component: () => import('@/views/message/UserMessage.vue'),
        },
        {
          path: '/message/:messageType',
          name: 'message',
          component: () => import('@/views/message/UserMessage.vue'),
        },
        {
          path: '/hot',
          name: 'hot',
          component: () => import('@/views/hot/Hot.vue'),
        },
        {
          path: '/search',
          name: 'search',
          component: () => import('@/views/search/Search.vue'),
        },
      ],
    },
    //  创作中心
    {
      path: '/ucenter',
      name: 'ucenter',
      redirect: '/ucenter/home',
      component: () => import('../views/ucenter/UcLayout.vue'),
      children: [
        {
          path: '/ucenter/home',
          name: '用户中心首页',
          component: () => import('@/views/ucenter/Home.vue'),
        },
        {
          path: '/ucenter/postVideo',
          name: '上传视频',
          component: () => import('@/views/ucenter/postVideo/Post.vue'),
        },
        {
          path: '/ucenter/editVideo',
          name: '编辑视频',
          component: () => import('@/views/ucenter/postVideo/Post.vue'),
        },
        {
          path: '/ucenter/video',
          name: '视频列表',
          component: () => import('@/views/ucenter/VideoList.vue'),
        },
        {
          path: '/ucenter/comment',
          name: '评论',
          component: () => import('@/views/ucenter/CommentList.vue'),
        },
        {
          path: '/ucenter/danmu',
          name: '弹幕',
          component: () => import('@/views/ucenter/DanmuList.vue'),
        },
      ],
    },
    //  个人空间
    {
      path: '/user/:userId',
      name: 'userhome',
      redirect: '/user/:userId',
      component: () => import('@/views/userhome/UserHomeLayout.vue'),
      children: [
        {
          path: '/user/:userId',
          name: 'uhome',
          component: () => import('@/views/userhome/Home.vue'),
        },
        {
          path: '/user/:userId/video',
          name: 'uhomeMyVideo',
          component: () => import('@/views/userhome/VideoList.vue'),
        },
        {
          path: '/user/:userId/series',
          name: 'uhomeSeries',
          component: () => import('@/views/userhome/VideoSeries.vue'),
        },
        {
          path: '/user/:userId/series/:seriesId',
          name: 'uhomeSeriesDetail',
          component: () => import('@/views/userhome/VideoSeriesDetail.vue'),
        },
        {
          path: '/user/:userId/collection',
          name: 'collection',
          component: () => import('@/views/userhome/Collection.vue'),
        },
        {
          path: '/user/:userId/focus',
          name: 'uhomeFocus',
          component: () => import('@/views/userhome/FocusFansList.vue'),
        },
        {
          path: '/user/:userId/fans',
          name: 'uhomeFans',
          component: () => import('@/views/userhome/FocusFansList.vue'),
        },
      ],
    },
    //  个人中心
    {
      path: '/account/:userId/:type?',
      name: 'account',
      component: () => import('@/views/UserAccount/AccountLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/UserAccount/Home.vue'),
        },
        {
          path: 'userInfo',
          name: 'userInfo',
          component: () => import('@/views/UserAccount/UserInfo.vue'),
        },
        {
          path: 'avatar',
          name: 'avatar',
          component: () => import('@/views/UserAccount/UserAvatar.vue'),
        },
        {
          path: 'security',
          name: 'security',
          component: () => import('@/views/UserAccount/Security.vue'),
        },
      ],
    },
    //  动态
    {
      path: '/dynamic',
      name: '动态首页',
      component: () => import('@/views/dynamic/Index.vue'),
      children: [
        {
          path: '/dynamic/:dynamicId',
          name: '动态详情',
          component: () => import('@/views/dynamic/Detail.vue'),
        },
      ],
    },
  ],
})

// 全局前置守卫修复
router.beforeEach(async (to, from, next) => {
  const token = VueCookies.get('token')
  const loginStore = useLoginStore()
  const hasLocalUser = Object.keys(loginStore.userInfo).length > 0

  // 无token直接清空本地用户信息
  if (!token) {
    if (hasLocalUser) {
      loginStore.saveUserInfo({})
    }
    next()
    return
  }

  // 有token，发起校验请求，这里直接写接口路径，不能用proxy
  try {
    await request({
      url: '/web/account/verifyToken',
      // url: proxy.Api.verifyToken,
      showLoading: false,
      showError: false,
      params: {},
    })
    next()
  } catch (err){
  // 捕获901、网络错误、任意异常，统一清理登录态
  loginStore.saveUserInfo({})
  VueCookies.remove('token')
  next()
  }
})

export default router