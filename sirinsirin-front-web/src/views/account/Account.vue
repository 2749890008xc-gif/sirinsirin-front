<template>
  <Dialog
      :show="loginStore.showLogin"
      :buttons="dialogConfig.buttons"
      width="1000px"
      :showCancel="false"
      @close="closeDialog"
  >
    <div class="dialog-panel">
      <div class="bg">
        <img src="@/assets/login_bg.png" alt="">
      </div>
      <el-form
          class="login-register"
          :model="formData"
          :rules="rules"
          ref="formDataRef"
          @submit.prevent
      >
        <div class="tab-panel">
          <div :class="[opType == 1 ? 'active' : '']" @click="showPanel(1)">登录</div>
          <el-divider direction="vertical" />
          <div :class="[opType == 0 ? 'active' : '']" @click="showPanel(0)">注册</div>
        </div>
        <!-- input输入 -->
        <el-form-item prop="email">
          <el-input
              clearable
              placeholder="请输入邮箱"
              v-model.trim="formData.email"
              :maxlength="150"
              size="large"
          >
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" v-if="opType==1">
          <el-input
              show-password
              placeholder="请输入密码"
              v-model.trim="formData.password"
              :maxlength="150"
              size="large"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <div v-if="opType==0">
          <el-form-item prop="nickName">
            <el-input
                clearable
                placeholder="请输入昵称"
                v-model.trim="formData.nickName"
                :maxlength="150"
                size="large"
            >
              <template #prefix>
                <span class="iconfont icon-account"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="registerPassword">
            <el-input
                show-password
                placeholder="请输入密码"
                v-model.trim="formData.registerPassword"
                :maxlength="150"
                size="large"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="reRegisterPassword">
            <el-input
                show-password
                placeholder="请再次输入密码"
                v-model.trim="formData.reRegisterPassword"
                :maxlength="150"
                size="large"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="emailCheckCode">
            <div class="email-code-panel">
              <div class="input">
                <el-input
                    clearable
                    placeholder="请输入邮箱验证码"
                    v-model.trim="formData.emailCheckCode"
                    :maxlength="6"
                    size="large"
                >
                  <template #prefix>
                    <span class="iconfont icon-checkcode"></span>
                  </template>
                </el-input>
              </div>
              <el-button
                  size="large"
                  type="primary"
                  @click="sendEmailCode"
                  :disabled="isSending || !formData.email.trim()"
                  :loading="isSending"
              >
                {{ isSending ? `${count}秒后重新发送` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </div>
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <div class="input">
              <el-input
                  clearable
                  placeholder="请输入验证码"
                  v-model.trim="formData.checkCode"
                  :maxlength="4"
                  size="large"
              >
                <template #prefix>
                  <span class="iconfont icon-checkcode"></span>
                </template>
              </el-input>
            </div>
            <img
                :src="checkCodeInfo.checkCode"
                @click = "changeCheckCode"/>
          </div>
        </el-form-item>
        <el-form-item label="" prop="">
          <el-button
              type="primary"
              @click="doSubmit"
              class="login-btn"
              size="large"
          >
            <span v-if="opType==0">注册</span>
            <span v-if="opType==1">登录</span>
          </el-button>
        </el-form-item>
        <div v-if="opType == 0" class="no-email-check-code">
          <router-link
              to="/noEmailCheckCode"
              class="no-email-check-code-link"
          >没收到验证码？</router-link>
        </div>
      </el-form>
    </div>
  </Dialog>
</template>

<script setup>
import {ref, getCurrentInstance, nextTick, onMounted, onUnmounted} from "vue";
const { proxy } = getCurrentInstance();
import { useLoginStore } from '@/stores/loginStore.js';
const loginStore = useLoginStore();
import md5 from "js-md5";
import Dialog from "@/components/Dialog.vue";

const checkCodeInfo = ref({});
const changeCheckCode = async () => {
  let result = await proxy.Request({ url: proxy.Api.checkCode });
  if(!result) return;
  checkCodeInfo.value = result.data;
};

const dialogConfig = ref({ buttons: [] });

const formData = ref({
  email: '',
  password: '',
  nickName: '',
  registerPassword: '',
  reRegisterPassword: '',
  emailCheckCode: '',
  checkCode: ''
});
const formDataRef = ref();

const checkRePassword = (rule, value, callback) => {
  if(value !== formData.value.registerPassword) {
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
  nickName: [ { required: true, message: '请输入昵称' } ],
  registerPassword: [
    { required: true, message: '请输入密码' },
    { validator: proxy.Verify.password, message: '密码只能是数字、字母、特殊字符 8-18位' }
  ],
  reRegisterPassword: [
    { required: true, message: '请再次输入密码' },
    { validator: checkRePassword, message: '两次输入的密码不一致' }
  ],
  checkCode: [ { required: true, message: '请输入图片验证码' } ],
  emailCheckCode: [ { required: true, message: '请输入邮箱验证码' } ]
};

const opType = ref(1);
const isSending = ref(false);
const count = ref(60);
let timer = null;

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (!formData.value.email.trim()) {
    proxy.Message.error("请输入邮箱");
    return;
  }
  const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
  if (!emailReg.test(formData.value.email)) {
    proxy.Message.error("请输入正确的邮箱格式");
    return;
  }

  // 立即启动倒计时+禁用按钮
  isSending.value = true;
  startCountDown();

  try {
    let result = await proxy.Request({
      url: proxy.Api.sendEmailCode,
      params: {
        email: formData.value.email,
        type: 0,
      },
      errorCallback: () => {
        changeCheckCode();
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

// 重置表单
const resetForm = () => {
  changeCheckCode();
  nextTick(() => {
    if (formDataRef.value) {
      formDataRef.value.resetFields();
    }
    formData.value = {
      email: '',
      password: '',
      nickName: '',
      registerPassword: '',
      reRegisterPassword: '',
      emailCheckCode: '',
      checkCode: ''
    };
    // 重置倒计时
    if(timer) clearInterval(timer);
    isSending.value = false;
    count.value = 60;
  })
};

// 提交登录/注册
const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) return;

    let params = {};
    Object.assign(params, formData.value);
    params.checkCodeKey = checkCodeInfo.value.checkCodeKey;
    if(opType.value === 1) {
      //  TODO 把md5加密改成bcrypt加密或其他更安全的加密
      params.password = md5(params.password);
    }

    let result = await proxy.Request({
      url: opType.value === 0 ? proxy.Api.register : proxy.Api.login,
      params,
      errorCallback: () => changeCheckCode()
    });

    if(!result) return;

    if(opType.value === 0) {
      proxy.Message.success("注册成功，请登录");
      showPanel(1);
    } else if(opType.value === 1) {
      proxy.Message.success("登录成功");
      loginStore.setLogin(false);
      loginStore.saveUserInfo(result.data);
    }
  });
};

// 关闭弹窗
const closeDialog = () => {
  loginStore.setLogin(false);
  resetForm();
};

// 切换登录/注册
const showPanel = (type) => {
  opType.value = type;
  resetForm();
};

onMounted(() => {
  showPanel(1);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.dialog-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .bg{
    width: 500px;
    height: 641px;
    overflow: hidden;
    img{
      width: 100%;
      margin-left: 50px;
    }
  }

  .login-register{
    width: 350px;
    .tab-panel{
      margin: 10px auto;
      display: flex;
      width: 130px;
      font-size: 18px;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      .active{
        color: var(--blue2);
      }
    }
    .login-btn{
      width: 100%;
    }
  }
  .no-email-check-code{
    text-align: center;

    .no-email-check-code-link{
      text-decoration: none;
      color: var(--text3);

      &:hover{
        color: var(--blue2);
      }
    }
  }
}

.check-code-panel, .email-code-panel{
  display: flex;
  align-items: center;
  width: 100%;
  .input{ flex: 1; }
  img{ cursor: pointer; }
}
</style>