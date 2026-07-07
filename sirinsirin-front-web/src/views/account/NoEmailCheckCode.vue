<template>
  <!-- 整体容器：全屏居中 -->
  <div class="verify-tip-container">
    <div class="tip-card">
      <p class="tip-text">
        若没有收到验证码，请在邮箱验证码中输入
        <strong class="highlight-code">123456</strong>
      </p>
      <!-- 路由链接：按钮化样式 -->
      <router-link to="/" class="back-home-btn">
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
// 全局容器样式：让内容垂直+水平居中，全屏显示
.verify-tip-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa; // 浅灰色背景，柔和不刺眼
  padding: 20px;
}

// 卡片样式：现代UI核心，阴影+圆角+留白
.tip-card {
  width: 100%;
  max-width: 420px; // 限制最大宽度，适配大屏
  padding: 32px 24px;
  background: #ffffff; // 纯白卡片
  border-radius: 16px; // 大圆角，更圆润
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); // 轻阴影，提升质感
  text-align: center; // 文字居中
}

// 提示文字样式
.tip-text {
  font-size: 16px;
  color: #333333;
  line-height: 1.6;
  margin: 0 0 28px 0; // 底部留白，分隔文字和按钮
}

// 验证码高亮样式：醒目突出
.highlight-code {
  font-size: 18px;
  color: #1677ff; // 主题蓝色（通用科技色）
  font-weight: 600;
  margin: 0 4px;
}

// 返回首页按钮样式：替代原生链接，交互更好
.back-home-btn {
  display: inline-block;
  padding: 10px 28px;
  background-color: #1677ff;
  color: #ffffff;
  border-radius: 8px;
  text-decoration: none; // 去掉下划线
  font-size: 15px;
  transition: all 0.3s ease; // 平滑过渡动画

  // 鼠标悬浮效果
  &:hover {
    background-color: #0958d9;
    transform: translateY(-2px); // 轻微上浮，提升交互感
  }
}
</style>