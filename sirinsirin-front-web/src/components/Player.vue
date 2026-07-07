<template>
  <div class="player-panel">
    <div class="player-style" ref="playerRef" :style="{height: playerHeight + 'px'}"></div>
    <div class="danmu-panel">
      <div class="watcher">{{onLineCount}} 人正在看，已装填{{danmuCount}}条弹幕</div>
      <div id="danmu" v-show="showDanmu"></div>
      <div class="close-danmu" v-show="!showDanmu">已关闭弹幕</div>
    </div>
    <div id="play"><img :src="proxy.Utils.getLocalImage('play.png')" /></div>
  </div>
</template>

<script setup>
import { mitter } from '@/eventbus/eventBus.js'
import {
  ref,
  reactive,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  inject,
  onBeforeUnmount,
  computed
} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 路由跳转实例

import Hls from "hls.js";
import Artplayer from "artplayer";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import {useLoginStore} from "@/stores/loginStore.js";
import VueCookies from "vue-cookies";
const loginStore = useLoginStore();

const playerRef = ref();
let player = null;

const initPlayer = () => {
  //隐藏右键菜单
  Artplayer.CONTEXTMENU = false
  //自动回放功能的最大记录数，默认为 10
  Artplayer.AUTO_PLAYBACK_MAX = 20
  //自动回放功能的最小记录时长，单位为秒，默认为 5
  Artplayer.AUTO_PLAYBACK_MIN = 10

  player = new Artplayer({
    container: playerRef.value,
    url: ``,
    type: 'm3u8',
    customType: {
      m3u8: function (video, url, art) {
        if (Hls.isSupported()) {
          if (art.hls) art.hls.destroy()
          const hls = new Hls()
          hls.loadSource(url)
          hls.attachMedia(video)
          art.hls = hls
          art.on('destroy', () => hls.destroy())
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url
        } else {
          art.notice.show = '浏览器不支持该播放器'
        }
      },
    },
    theme: '#23ade5', //播放器主题颜色，目前用于 进度条 和 高亮元素 上
    volume: 0.7, //播放器的默认音量
    autoplay: true, //是否自动播放 假如希望默认进入页面就能自动播放视频，muted 必需为 true
    autoMini: false, //当播放器滚动到浏览器视口以外时，自动进入 迷你播放 模式
    fullscreen: true, //设置和获取播放器窗口全屏
    fullscreenWeb: true, //设置和获取播放器网页全屏
    setting: true,
    pip: true, //开启画中画
    playbackRate: true, //是否显示视频播放速度功能，会出现在 设置面板 和 右键菜单 里
    flip: true, //是否显示视频翻转功能，目前只出现在 设置面板 和 右键菜单
    aspectRatio: true, //比例
    //miniProgressBar: true, //迷你进度条，只在播放器失去焦点后且正在播放时出现
    screenshot: true, //截图
    autoPlayback: true, //自动回放
    //自定义图标
    icons: {
      state: document.querySelector('#play'),
    },
    controls: [
      {
        name: 'wide-screen',
        position: 'right',
        html: '<span class="iconfont icon-wide-screen"></span>',
        tooltip: '宽屏模式',
        style: {
          color: '#fff',
          display: 'flex',
        },
        click: function (...args) {
          changeWideScreen();
        },
      },
      {
        name: 'narrow-screen',
        position: 'right',
        html: '<span class="iconfont icon-narrow-screen"></span>',
        tooltip: '退出宽屏',
        style: {
          color: '#fff',
          display: 'none',
        },
        click: function (...args) {
          changeWideScreen()
        },
      },
    ],
    plugins: [
      artplayerPluginDanmuku({
        mount: document.querySelector('#danmu'),
        theme: 'light',
        emitter: true,
        danmuku: function () {
          return new Promise(async (resolve) => {
            //是否展示弹幕
            const danmuList = await loadDanmuList();
            return resolve(danmuList)
          })
        },
        beforeEmit: async (danmu) => {
          let result = await postDanmu(danmu)
          //重新获取一下弹幕列表
          loadDanmuList()
          if (!result) {
            return false;
          }
          mitter.emit('danmSend')
          proxy.Message.success('发布成功')
          return true
        },
      }),
    ],
  });
  player.on('hover', (state) => {
    let display = 'none'
    if (state) {
      display = 'flex'
    }
    player.template.$bottom.style.display = display
  });

//视频播放完成
  player.on('video:ended', (e) => {
    mitter.emit('playEnd')
  });
}

const emit = defineEmits(["changeWideScreen"]);
const wideScreen = ref(false);   //  默认不是宽屏效果
const changeWideScreen = () => {
  wideScreen.value = !wideScreen.value;
  if(wideScreen.value){
    player.controls['wide-screen'].style.display = "none";
    player.controls['narrow-screen'].style.display = "flex";
  }else{
    player.controls['wide-screen'].style.display = "flex";
    player.controls['narrow-screen'].style.display = "none";
  }
  emit("changeWideScreen", wideScreen.value);
}

onMounted(() => {
  nextTick(() => {
    initPlayer();
    //  TODO 需要增加根据当前浏览器屏幕大小改变宽高（当前状态下改变屏幕大小后宽会改变，但高不会改变
    const height = Math.round(playerRef.value.clientWidth - 8) * 0.5625;
    playerHeight.value = height;
    setPlayerHeight(height);
  });

  mitter.on("changeP", (_fileId) => {
    fileId.value = _fileId;
    player.switch = `${proxy.Api.getVideoResource}/${_fileId}/`;
    player.plugins.artplayerPluginDanmuku.load();
  });
  startTimer();
});

onBeforeUnmount(() => {
  if(player){
    player.destroy(false);
  }
  mitter.off("changeP");
  cleanTimer();
});

const playerHeight = ref(500);
const setPlayerHeight = inject("playerHeight");
const fileId = ref();

const isLoginValid = computed(() => {
  const hasUser = Object.keys(loginStore.userInfo).length > 0
  const token = VueCookies.get('token')
  return hasUser && !!token
})

const postDanmu = (danmu) => {
  if(!isLoginValid.value){
    loginStore.setLogin(true);
    return;
  }
  danmu.fileId = fileId.value;
  danmu.videoId = route.params.videoId;
  danmu.time = Math.round(danmu.time);
  return proxy.Request({
    url: proxy.Api.postDanmu,
    params: danmu,
  });
};

const danmuCount = ref(0);
const loadDanmuList = async () => {
  if(!fileId.value) {
    return [];
  }
  let result = await proxy.Request({
    url: proxy.Api.loadDanmu,
    params: {
      fileId: fileId.value,
      videoId: route.params.videoId,
    },
  });
  if(!result || !Array.isArray(result.data)) {  //  这里注意原来的代码为：“ || !Array.isArray(result.data) ”
    return [];  //  这里注意返回的是一个数组，要不然控制台会有莫名的报错信息，原本的代码为“ return; ”
  }
  mitter.emit('loadDanmu', result.data);
  danmuCount.value = result.data.length;
  return result.data;
};

let timer = ref(null);
const startTimer = () => {  //  每隔五秒获取一次观看人数，这种每隔一段时间就刷新页面的方式称为 “轮询”
  timer.value = setInterval(() => {
    reportVideoPlayOnline();
  }, 5000);
};

const onLineCount = ref();
const reportVideoPlayOnline = async () => {
  if(!fileId.value) {
    return;
  }
  let result = await proxy.Request({
    url: proxy.Api.reportVideoPlayOnline,
    params: {
      fileId: fileId.value,
      deviceId: loginStore.deviceId,
    },
    showError: false,
  });
  if(!result) {
    return;
  }
  onLineCount.value = result.data;
};

const cleanTimer = () => {
  if(timer.value !== null) {
    clearInterval(timer.value);
    timer.value = null;
  };
};

const videoInfo = inject("videoInfo");
const showDanmu = computed(() => {
  return (videoInfo.value.interaction == null || videoInfo.value.interaction.indexOf("0") == -1);
});
</script>

<style scoped lang="scss">
.player-panel {
  .player-style {
    width: 100%;

    :deep(.art-video-player.art-mask-show .art-state) {
      //播放按钮
      position: absolute;
      right: 40px;
      bottom: 50px;

      .art-icon-state {
        width: 60px;
        height: 60px;

        img {
          width: 100%;
        }
      }
    }

    //改变播放器的右侧操作按钮
    :deep(.art-controls-right) {
      position: relative;
      display: block;
      width: 280px;

      .art-control {
        position: absolute;
      }

      //截屏
      .art-control-screenshot {
        left: 0;
      }

      //设置按钮
      .art-control-setting {
        left: 46px;
      }

      //画中画
      .art-control-pip {
        left: 92px;
      }

      //宽屏
      .art-control-wide-screen,
      .art-control-narrow-screen {
        left: 138px;

        .iconfont {
          font-size: 20px;
        }
      }

      //网页全屏按钮
      .art-control-fullscreenWeb {
        left: 184px;
      }

      //全屏按钮
      .art-control-fullscreen {
        left: 230px;
      }
    }
  }

  .danmu-panel {
    box-shadow: 0 2px 6px #ddd;
    height: 56px;
    border-top: none;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 15px;

    .watcher {
      width: 250px;
      color: var(--text2);
    }

    #danmu {
      flex: 1;
    }

    .close-danmu {
      flex: 1;
      color: var(--text2);
      text-align: center;
    }
  }

  :deep(.danmu-setting) {
    background: none !important;
    padding: 0;
    border: none;

    .inner-panel {
      width: 300px;
      height: 280px;
      position: relative;

      .inner {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 99999;
        color: #fff;
      }

      .mask {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        background: #000;
        opacity: 0.6;
      }
    }
  }
}
</style>