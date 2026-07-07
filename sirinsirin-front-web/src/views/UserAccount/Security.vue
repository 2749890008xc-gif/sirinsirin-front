<template>
  <div class="account-security">
    <div class="header">
      <span class="header-icon"></span>
      <span class="header-text">账号安全</span>
    </div>
    <el-form
        autocomplete="off"
        class="info-wrap"
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        @submit.prevent
    >
      <el-form-item class="form-item password-input" prop="password">
        <label class="form-item__label">旧密码:</label>
        <el-input
            class="form-item__content"
            show-password
            placeholder="请输入密码"
            v-model.trim="formData.password"
            :maxlength="150"
            size="large"
        >
        </el-input>
      </el-form-item>
      <el-form-item class="form-item password-input" prop="newPassword">
        <label class="form-item__label">新密码:</label>
        <el-input
            class="form-item__content"
            show-password
            placeholder="设置新密码"
            v-model.trim="formData.newPassword"
            :maxlength="150"
            size="large"
        >
        </el-input>
      </el-form-item>
      <el-form-item class="form-item password-input" prop="rePassword">
        <label class="form-item__label">确认密码:</label>
        <el-input
            class="form-item__content"
            show-password
            placeholder="确认新密码"
            v-model.trim="formData.rePassword"
            :maxlength="150"
            size="large"
        >
        </el-input>
      </el-form-item>
      <div class="prompt">为了您的账号安全，需要验证您的邮箱，验证码将以邮件形式发送至：<strong>{{proxy.Utils.maskEmail(userInfo.email)}}</strong></div>
      <el-form-item class="form-item password-input" prop="emailCheckCode">
        <label class="form-item__label">验证码:</label>
        <el-input
            clearable
            class="form-item__content"
            placeholder="确认邮箱验证码"
            v-model.trim="formData.emailCheckCode"
            :maxlength="150"
            size="large"
        >
        </el-input>
        <el-button
            class="form-item__checkCodeBtn"
            type="primary"
            @click="sendEmailCode"
            :disabled="isSending"
            :loading="isSending"
        >
          {{ isSending ? `${count}秒后重新发送` : '发送验证码' }}
        </el-button>
      </el-form-item>
      <div class="form-item submit-btn">
        <div class="form-item__content">
          <div class="padding-dom"></div>
          <el-form-item label="" prop="" class="btn-wrap">
            <el-button
                class="btn"
                type="primary"
                @click="doSubmit"
                size="large"
            >
              重置密码
            </el-button>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import {ref, getCurrentInstance, nextTick, onMounted, onUnmounted, inject} from "vue";

const {proxy} = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import { useLoginStore } from "@/stores/loginStore.js";
const loginStore = useLoginStore();
import md5 from "js-md5";
import VueCookies from "vue-cookies";

const userInfo = inject('userInfo');

const formData = ref({
  emailCheckCode: '',
  password: '',
  newPassword: '',
  rePassword: '',
});
const formDataRef = ref();

const checkRePassword = (rule, value, callback) => {
  if(value !== formData.value.newPassword) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { validator: proxy.Verify.email, message: '请输入正确的邮箱' }
  ],
  password: [ { required: true, message: '请输入密码' } ],
  newPassword: [
    { required: true, message: '请输入密码' },
    { validator: proxy.Verify.password, message: '密码只能是数字、字母、特殊字符 8-18位' }
  ],
  rePassword: [
    { required: true, message: '请再次输入密码' },
    { validator: checkRePassword, message: '两次输入的密码不一致' }
  ],
  emailCheckCode: [ { required: true, message: '请输入邮箱验证码' } ]
};

const isSending = ref(false);
const count = ref(60);
let timer = null;

// 发送邮箱验证码
const sendEmailCode = async () => {

  // 立即启动倒计时+禁用按钮
  isSending.value = true;
  startCountDown();
  try {
    let result = await proxy.Request({
      url: proxy.Api.sendEmailCode,
      params: {
        email: userInfo.value.email,
        type: 1,
      },
      errorCallback: () => {
        clearInterval(timer);
        isSending.value = false;
        count.value = 60;
      }
    });

    if(!result) {
      clearInterval(timer);
      isSending.value = false;
      count.value = 60;
      proxy.Message.error("邮箱不存在");
      return;
    }

    proxy.Message.success("发送成功，请查收邮箱");
  } catch (error) {
    clearInterval(timer);
    isSending.value = false;
    count.value = 60;
    proxy.Message.error("发送失败，请稍后重试");
  }
};

// 倒计时核心方法
const startCountDown = () => {
  if (timer) clearInterval(timer);
  count.value = 60;
  isSending.value = true;

  timer = setInterval(() => {
    count.value--;
    if (count.value <= 0) {
      clearInterval(timer);
      isSending.value = false;
      count.value = 60;
    }
  }, 1000);
};

const logout = async () => {
  try {
    // 发起登出请求
    await proxy.Request({
      url: proxy.Api.logout,
    });
  } catch (err) {
  } finally {
    // 无论接口成功/失败，都执行清除登录信息 + 跳转
    loginStore.saveUserInfo({});
    VueCookies.remove('token');
    router.push('/'); // 必然执行，跳转首页
    loginStore.setLogin(true);
  }
};

// 提交登录/注册
const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) return;

    let params = {};
    Object.assign(params, formData.value);
    //  TODO 把md5加密改成bcrypt加密或其他更安全的加密
    params.password = md5(params.password);
    params.type = 1;
    params.email = userInfo.value.email;

    let result = await proxy.Request({
      url: proxy.Api.updatePassword,
      params,
    });

    if(!result) return;

    proxy.Message.success("修改成功，请重新登录");
    logout();
  });
};



onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.account-security {
  .header {
    height: 50px;
    padding-left: 30px;
    border-bottom: 1px solid #ddd;

    .header-icon {
      float: left;
      width: 4px;
      height: 16px;
      margin-top: 17px;
      background-color: var(--blue);
      border-radius: 4px;
    }

    .header-text {
      float: left;
      margin: 17px 0 0 5px;
      color: var(--blue);
      font-size: 14px;
      cursor: default;
    }
  }

  .info-wrap {
    padding: 40px 20px 0;
    position: relative;

    .form-item {
      margin-bottom: 22px;
      &.password-input,
      &.submit-btn {
        float: left;
        width: 789px;
      }

      .form-item__label {
        vertical-align: middle;
        font-size: 14px;
        color: #606266;
        box-sizing: border-box;
        width: 260px;
        text-align: right;
        margin-right: 20px;
        float: left;
        line-height: 30px;
        padding: 0;
      }

      .form-item__content {
        line-height: 30px;
        position: relative;
        font-size: 14px;

        .el-input {
          position: relative;
          font-size: 14px;
        }
      }
      .form-item__checkCodeBtn{
        height: 30px;
        padding: 0px 10px;
      }

      /* ========== 核心修复代码：深度覆盖表单错误提示，不改动HTML ========== */
      ::v-deep .el-form-item__error {
        float: none !important;
        position: absolute !important;
        left: 280px !important; /* 和输入框对齐 260+20 */
        top: 32px !important; /* 输入框下方距离 */
        margin: 0 !important;
        padding: 0 !important;
        white-space: nowrap; /* 单行不换行，避免遮挡下方 */
        z-index: 2;
      }
    }

    /* 新增提示文字样式，清除浮动，对齐输入框区域 */
    .prompt {
      clear: both; // 清除上方所有float浮动，强制换行
      width: 225px;
      margin: 0 0 10px 280px; // 左偏移和输入框对齐，上下间距
      font-size: 13px;
      color: #666;
      strong {
        color: #333;
        font-size: 16px;
      }
    }

    .password-input {
      .el-input {
        float: left;
        width: 225px;
        height: 30px;
        margin-right: 40px;
      }

      ::v-deep .el-input__wrapper {
        padding: 0px 15px;
      }
    }

    .submit-btn {
      .form-item__content {
        .padding-dom {
          width: 789px;
          height: 30px;
          border-bottom: 1px solid #e5e9ef;
          margin-bottom: 40px;
        }

        .btn-wrap{
          float: left;
          width: 789px;
          height: 36px;
          position: relative;
          margin-bottom: 20px;
        }

        .btn-wrap {
          .btn {
            height: 36px;
            width: 110px;
            border-radius: 4px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: var(--text2);
            background: #ddd;
            text-align: center;
            line-height: 36px;
            cursor: default;
            border-color: #ddd;

            &.enable {
              cursor: pointer;
              background: #FF7DA1;
              color: #fff;
            }
          }
        }
      }
    }
  }
}
</style>