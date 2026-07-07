<template>
  <div class="home-body">
    <div class="left-content">
      <HomeVideoList></HomeVideoList>
      <HomeSeries></HomeSeries>
    </div>
    <div class="right-content">
      <div class="part-item">
        <div class="part-title">公告</div>
        <!-- 该段代码有xss注入风险，因此改成下面的 -->
<!--        <div-->
<!--          class="part-content"-->
<!--          v-html="userInfo.noticeInfo || '暂无公告'"-->
<!--        ></div>-->
        <div
            class="part-content"
        >{{userInfo.noticeInfo || '暂无公告'}}</div>
      </div>
      <div class="part-item part-item2">
        <div class="part-title">个人资料</div>
        <div class="part-content">
          <div class="user-info-panel">
            <div class="user-info-item">
              <div class="label">UID</div>
              <div class="value">{{userInfo.userId}}</div>
            </div>
            <div v-if="userInfo.birthday" class="user-info-item">
              <div class="label">生日</div>
              <div class="value">{{userInfo.birthday}}</div>
            </div>
            <div v-if="userInfo.school" class="user-info-item">
              <div class="label">学校</div>
              <div class="value">{{userInfo.school}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, getCurrentInstance, nextTick, provide, inject} from "vue"
import { useRouter, useRoute } from "vue-router"
import HomeVideoList from "@/views/userhome/HomeVideoList.vue";
import HomeSeries from "@/views/userhome/HomeSeries.vue";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const userInfo = inject("userInfo");
</script>

<style scoped lang="scss">
.home-body {
  display: flex;

  .left-content {
    flex: 1;
    background: #fff;
    border-radius: 5px;
    padding: 20px;
  }

  .right-content {
    width: 350px;
    margin-left: 20px;

    .part-item {
      border: 1px solid #f2f2f2;
      border-radius: 5px;
      background: #fff;
      padding: 20px;
      margin-bottom: 15px;

      .part-title {
        font-size: 15px;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        padding-bottom: 15px;
        color: var(--text2);
      }

      .part-content {
        padding-top: 15px;
        color: var(--text2);
        font-size: 13px;

        .user-info-panel {
          .user-info-item {
            margin-top: 8px;
            display: flex;

            .value {
              margin-left: 10px;
              flex: 1;
            }
          }
        }
      }
    }
  }
}
</style>