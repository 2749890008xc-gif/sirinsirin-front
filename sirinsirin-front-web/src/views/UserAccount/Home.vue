<template>
  <div class="account-home">
    <div class="index-info">
      <div class="home-head">
        <Avatar
            :width="64"
            :avatar="userInfo.avatar"
        ></Avatar>
      </div>

      <div class="home-right">
        <div class="home-top-msg">
          <span class="home-top-msg-name">{{ userInfo.nickName }}</span>
          <!-- TODO 获取用户的vip类型 -->
          <span class="home-user-spec"  v-if="userInfo.vip !== 0">
<!--            {{ user.vip === 1 ? '月度' : user.vip === 2 ? '季度' : '年度' }}大会员-->
            年度大会员
          </span>
          <span class="home-userstatus" v-else>正式会员</span>
        </div>
        <!-- 用户等级 -->
        <div class="home-top-level">
          <span class="home-top-level-all">
            <div class="home-top-progress-wrap">
              <!-- TODO 获取用户经验值 -->
<!--              <span class="home-top-level-head home-top-level-head-active">LV{{ handleLevel(user.exp) }}</span>-->
<!--              <span class="home-top-level-up">-->
<!--                <span class="home-top-level-upgo" :style="`width: ${user.exp > 28800 ? 100 : (user.exp / 288)}%;`"></span>-->
<!--              </span>-->
              <span class="home-top-level-head home-top-level-head-active">LV{{ proxy.Utils.handleLevel(12000) }}</span>
              <span class="home-top-level-up">
                <span class="home-top-level-upgo" :style="`width: ${12000 > 28800 ? 100 : (12000 / 288)}%;`"></span>
              </span>
              <div class="home-top-level-mask-warp">
                <span class="home-level-mask-icon"></span>
                <span class="home-level-mask-top"></span>
              </div>
            </div>
            <span class="home-top-level-number">
              <!-- TODO 获取用户经验值 -->
<!--              <span class="now-num">{{ user.exp }}</span>-->
              <span class="now-num">{{ 12000 }}</span>
              <span class="num-icon">/</span>
              <span class="max-num">28800</span>
            </span>
            <span class="home-to-update" @click="$router.push(`/account/${userInfo.userId}/userInfo`)">修改资料</span>
            <a :href="`/user/${userInfo.userId}`" target="_blank" class="home-to-space">
              个人空间
              <i class="iconfont icon-youjiantou"></i>
            </a>
          </span>
        </div>
        <!-- 用户硬币数 -->
        <div class="home-top-bp">
          <router-link to="#" class="coin"></router-link>
          <span class="curren-b-num">{{ userCountInfo.currentCoinCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import Avatar from "@/components/Avatar.vue";
const { proxy } = getCurrentInstance();
import {getCurrentInstance, inject, provide, ref} from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

const userInfo = inject("userInfo");
const userCountInfo = inject("userCountInfo");
</script>

<style scoped lang="scss">
.account-home {
  padding: 50px 20px 0;
  width: 829px;

  .index-info {
    border-bottom: 1px solid #e5e9ef;
    padding-bottom: 40px;
    position: relative;

    .home-head {
      display: inline-block;
      vertical-align: top;
      position: relative;
      cursor: pointer;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
      }

      .gotoSpace {
        position: absolute;
        text-align: center;
        width: 64px;
        height: 64px;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, .66);
        font-size: 12px;
        color: #fff;
        border-radius: 64px;
        line-height: 64px;
        cursor: pointer;
        display: none;
      }

      &:hover .gotoSpace {
        display: block;
      }
    }

    .home-right {
      display: inline-block;
      margin-left: 16px;
      width: 684px;

      .home-top-msg {
        display: flex;
        align-items: center;

        .home-top-msg-name {
          display: inline-block;
          font-size: 18px;
          font-weight: 700;
          color: var(--text1);
          margin-right: 8px;
          cursor: default;
        }

        .home-user-spec {
          background-color: #fb7299;
          color: #fff;
          border-radius: 4px;
          display: inline-block;
          cursor: pointer;
          font-size: 12px;
          box-sizing: border-box;
          padding: 2px 4px;
        }

        .home-userstatus {
          border: 1px solid #99a2aa;
          margin: 0 8px;
          color: #99a2aa;
          border-radius: 4px;
          cursor: default;
          font-size: 12px;
          box-sizing: border-box;
          padding: 2px 4px;
        }
      }

      .home-top-level {
        position: relative;

        .home-top-level-all {
          display: inline-flex;
          align-items: center;
          width: 684px;
          margin-top: 10px;
          height: 24px;

          .home-top-progress-wrap {
            display: inline-flex;
            position: relative;

            .home-top-level-head {
              width: 62px;
              height: 24px;
              font-weight: 700;
              color: #fff;
              padding-left: 10px;
              font-size: 12px;
              line-height: 24px;
              cursor: default;
              display: inline-block;
              background: url('@/assets/bilibili/icons.png') no-repeat;

              &.home-top-level-head-active {
                background-position: -264px -852px;
              }
            }

            .home-top-level-up {
              width: 280px;
              height: 24px;
              line-height: 24px;
              background-color: #e5e9ef;
              margin-left: -15px;
              border-top-right-radius: 4px;
              border-bottom-right-radius: 4px;
              display: inline-block;
              position: relative;
              text-indent: -9999px;
              text-align: center;

              .home-top-level-upgo {
                position: absolute;
                top: 0;
                left: 0;
                background-color: #ff905a;
                width: 0;
                height: 24px;
                transition: all .3s ease-in-out;
                transition-delay: .3s;
                border-radius: 0 4px 4px 0;
              }
            }
          }

          .home-top-level-number {
            height: 24px;
            color: #99a2aa;
            margin-left: 8px;
            font-size: 12px;
            line-height: 24px;
            cursor: default;

            .now-num {
              color: var(--text1);
            }

            .num-icon {
              margin: 0 2px;
            }

            .max-num {
            }
          }

          .home-to-update {
            right: 90px;
            line-height: 20px;
            font-size: 12px;
          }

          .home-to-space {
            right: 0;
            display: inline-flex;
            justify-content: center;

            .icon-youjiantou {
              font-size: 12px;
            }
          }

          .home-to-space,
          .home-to-update {
            position: absolute;
            top: 8px;
            width: 84px;
            height: 24px;
            display: inline-block;
            border-radius: 4px;
            border: 1px solid #ced3db;
            color: #6d757a;
            text-align: center;
            cursor: pointer;
            line-height: 23px;
            font-size: 12px;
            text-decoration-line: none;

            &:hover {
              border: 1px solid var(--blue);
              color: var(--blue);
            }
          }
        }
      }

      .home-top-bp {
        margin-top: 15px;
        display: flex;
        align-items: center;

        .coin {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 8px;
          background: url(@/assets/bilibili/icons.png) no-repeat;
          background-position: -150px -470px;
        }

        .curren-b-num {
          display: inline-block;
          margin-right: 12px;
          font-size: 15px;
          color: var(--text2);
          cursor: default;
        }
      }
    }
  }
}
</style>