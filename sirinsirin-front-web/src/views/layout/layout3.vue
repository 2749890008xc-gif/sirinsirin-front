<!-- 22、33的精灵图动画效果 -->
<template>
  <div class="coin-panel">
    <div class="title-info">给up主投喂<span class="coin-count">{{ coinCount }}</span>枚硬币</div>
    <div class="coin-list">
      <!-- 2枚硬币选项 -->
      <div
          class="coin-item"
          :class="{ active: selectedType === '22' }"
          @click="selectCoin('22')"
      >
        <div
            class="coin-img coin-22"
            :class="{ 'coin-ani': selectedType === '22' }"
        ></div>
      </div>
      <!-- 3枚硬币选项 -->
      <div
          class="coin-item"
          :class="{ active: selectedType === '33' }"
          @click="selectCoin('33')"
      >
        <div
            class="coin-img coin-33"
            :class="{ 'coin-ani': selectedType === '33' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedType = ref('22')
const coinCount = computed(() => selectedType.value === '22' ? 2 : 3)
const selectCoin = (type) => {
  selectedType.value = type
}
</script>

<style scoped>
.coin-panel {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: fit-content;
  background: #fff;
}

.title-info {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}
.coin-count {
  color: #ff6700;
  font-weight: 600;
  margin: 0 4px;
}

.coin-list {
  display: flex;
  gap: 15px;
}

.coin-item {
  cursor: pointer;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: all 0.2s ease;
  /* 防止点击时的重绘闪烁 */
  will-change: border-color, background-color;
}
.coin-item.active {
  border-color: #ff6700;
  background-color: #fff8f0;
}

/* 核心修复：精灵图容器极致优化 */
.coin-img {
  width: 187px; /* 单帧宽度（必须和精灵图单帧完全一致） */
  height: 300px; /* 单帧高度（必须和精灵图单帧完全一致） */
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
  background-size: 187px 300px;
}
/* 2枚硬币 - 精灵图动画（彻底解决闪烁） */
.coin-22.coin-ani {
  background-image: url('@/assets/22-coin-ani.png');
  /* 关键1：steps(24, end) 明确结束位置，避免帧重叠 */
  /* 核心修改：
     1. 动画总时长 = 播放时长(1.2s) + 停顿时长(.5s) = 1.7s
     2. steps(24, end) 只作用于前1.2s的播放阶段，后1s是停顿
     3. infinite 无限循环
     4. forwards动画结束后，元素保持最后一帧的状态（不回归初始状态）
  */
  animation: play22 1.7s steps(24, end) infinite forwards;
  /* 精灵图总宽度：187px * 24帧 = 4488px，高度300px（精准像素，无百分比误差） */
  background-size: 4488px 300px;
}

/* 3枚硬币 - 静态图 */
.coin-33 {
  background-image: url('@/assets/33-coin.png');
  background-size: 187px 300px;
}
/* 3枚硬币 - 精灵图动画 */
.coin-33.coin-ani {
  background-image: url('@/assets/33-coin-ani.png');
  animation: play33 1.7s steps(24, end) infinite forwards;
  background-size: 4488px 300px;
}

/* 用像素替代百分比，消除浮点误差导致的闪烁 */
/* 关键帧：只在0%~80%（1.2s/1.7s）播放动画，80.000000001%%~100%停顿 */
@keyframes play22 {
  0% {
    background-position: 0 0;
  }
  80% {
    background-position: -4488px 0;
  }
  /* 当次动画的循环到下一次循环之间的时间间隔，在进行切换时，有时会出现一闪而过的影子，因此小数点要填的更精确一些*/
  80.000000001%, 100% {
    background-position: -4301px 0; /* 停在最后一帧 */
  }
}

@keyframes play33 {
  0% {
    background-position: 0 0;
  }
  80% {
    background-position: -4488px 0;
  }
  /* 当次动画的循环到下一次循环之间的时间间隔，在进行切换时，有时会出现一闪而过的影子，因此小数点要填的更精确一些*/
  80.000000001%, 100% {
    background-position: -4301px 0; /* 停在最后一帧 */
  }
}
</style>