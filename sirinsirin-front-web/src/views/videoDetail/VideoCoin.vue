<template>
  <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="430px"
      :showCancel="false"
      @close="dialogConfig.show = false"
      style="position: relative; top: 10%;"
  >
    <div class="coin-panel">
      <div class="title-info">给up主投喂<span class="coin-count">{{coinCount}}</span>枚硬币</div>
      <div class="coin-list">
        <div
          :class="['coin-item', coinCount == 1 ? 'active' : '']"
          @click="setCoinCount(1)"
        >
<!--          <img :src="proxy.Utils.getLocalImage('coin1.png')" />-->
          <div
              class="coin-img coin-22"
              :class="{ 'coin-ani': coinCount == 1 }"
          ></div>
          <div class="coin-count-inner">1硬币</div>
        </div>
        <div
            :class="['coin-item', coinCount == 2 ? 'active' : '']"
            @click="setCoinCount(2)"
        >
<!--          <img :src="proxy.Utils.getLocalImage('coin2.png')" />-->
          <div
              class="coin-img coin-33"
              :class="{ 'coin-ani': coinCount == 2  }"
          ></div>
          <div class="coin-count-inner">2硬币</div>
        </div>
      </div>
      <div class="sub-btn">
        <el-button type="primary" @click="submitCoin">确定</el-button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import {doUserAction} from "@/utils/Api.js";
import {ACTION_TYPE} from "@/utils/Constants.js";
import {ref, getCurrentInstance, nextTick, onMounted, onUnmounted, provide, inject} from 'vue';
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";

const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 路由跳转实例

const dialogConfig = ref({
  show: false,
  buttons: [],
});

const coinCount = ref(1);
const setCoinCount = (count) => {
  coinCount.value = count;
}

const videoInfo = inject("videoInfo");
const submitCoin = () => {
  doUserAction({
    videoId: route.params.videoId,
    actionType: ACTION_TYPE.VIDEO_COIN.value,
    actionCount: coinCount.value,
  }, () => {
    videoInfo.value.coinCountActive = true;
    videoInfo.value.coinCount += coinCount.value;
    dialogConfig.value.show = false;
    proxy.Message.success("投币成功");
  });
};

const show = () => {
  dialogConfig.value.show = true;
};
defineExpose({
  show,
});
</script>

<style scoped lang="scss">
.coin-panel {
  .title-info {
    text-align: center;
    font-size: 16px;

    .coin-count {
      font-size: 18px;
      padding: 0 3px;
      color: var(--blue2);
    }
  }

  .coin-list {
    margin-top: 30px;
    display: flex;
    justify-content: space-around;

    .coin-item {
      width: 150px;
      border: 2px dashed #ddd;
      border-radius: 5px;
      overflow: hidden;
      position: relative;
      cursor: pointer;

      &:hover {
        border: 2px dashed var(--blue);

        .coin-count-inner {
          color: var(--blue);
        }
      }

      img {
        width: 100%;
      }

      .coin-count-inner {
        position: absolute;
        left: 10px;
        top: 10px;
        color: var(--text3);
      }
    }

    .active {
      border: 2px solid var(--blue);

      .coin-count-inner {
        color: var(--blue);
      }
    }
  }

  .sub-btn {
    text-align: center;
    margin: 30px 0 5px 0;
  }
}

/* 核心修复：精灵图容器极致优化 */
.coin-img {
  width: 150px; /* 单帧宽度，精灵图单帧宽度（187px)的80% */
  height: 240px; /* 单帧高度，精灵图单帧高度（300px)的80% */
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: auto;
  /* 开启硬件加速，减少浏览器重绘闪烁 */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  /* 禁用默认过渡，避免动画冲突 */
  transition: none !important;
}

/* 2枚硬币 - 静态图 */
.coin-22 {
  background-image: url('@/assets/22-coin.png');
  background-size: 150px 240px;
}
/* 2枚硬币 - 精灵图动画（彻底解决闪烁） */
.coin-22.coin-ani {
  background-image: url('@/assets/22-coin-ani.png');
  /* 关键1：steps(24, end) 明确结束位置，避免帧重叠 */
  /* 核心修改：
     1. 动画总时长 = 播放时长(1.2s) + 停顿时长(.2s) = 1.4s
     2. steps(24, end) 只作用于前1.2s的播放阶段，后.2s是停顿
     3. infinite 无限循环
     4. forwards动画结束后，元素保持最后一帧的状态（不回归初始状态）
  */
  animation: play22 1.7s steps(24, end) infinite forwards;
  /* 精灵图总宽度：150px * 24帧 = 3590px，高度240px（精准像素，无百分比误差） */
  background-size: 3590px 240px;
}

/* 3枚硬币 - 静态图 */
.coin-33 {
  background-image: url('@/assets/33-coin.png');
  background-size: 150px 240px;
}
/* 3枚硬币 - 精灵图动画 */
.coin-33.coin-ani {
  background-image: url('@/assets/33-coin-ani.png');
  animation: play33 1.7s steps(24, end) infinite forwards;
  background-size: 3590px 240px;
}

/* 用像素替代百分比，消除浮点误差导致的闪烁 */
/* 关键帧：只在0%~80%（1.2s/1.4s）播放动画，80.000000001%%~100%停顿 */
@keyframes play22 {
  0% {
    background-position: 0 0;
  }
  /*注释的部分用于设置循环之间的时间间隔*/
  //85.7% {
  //  background-position: -3590px 0;
  //}
  ///* 当次动画的循环到下一次循环之间的时间间隔，在进行切换时，有时会出现一闪而过的影子，因此小数点要填的更精确一些*/
  //85.700000001%, 100% {
  //  background-position: -4301px 0; /* 停在最后一帧 */
  //}
  100%{
    background-position: -3590px 0;
  }
}

@keyframes play33 {
  0% {
    background-position: 0 0;
  }
  /*注释的部分用于设置循环之间的时间间隔*/
  //85.7% {
  //  background-position: -4488px 0;
  //}
  ///* 当次动画的循环到下一次循环之间的时间间隔，在进行切换时，有时会出现一闪而过的影子，因此小数点要填的更精确一些*/
  //85.700000001%, 100% {
  //  background-position: -4301px 0; /* 停在最后一帧 */
  //}
  100%{
    background-position: -3590px 0;
  }
}
</style>