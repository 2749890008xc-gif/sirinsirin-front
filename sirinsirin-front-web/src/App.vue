<template>
  <el-config-provider :locale="zhCn" :message="config">
    <router-view></router-view>
  </el-config-provider>
  
</template>


<script setup>
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

import {ref, reactive, getCurrentInstance, nextTick, onBeforeMount, provide} from "vue"
import FingerprintJS from "@fingerprintjs/fingerprintjs";
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import VueCookies from "vue-cookies";
import { Api } from "@/utils/Api.js"
import Request from "@/utils/Request"
import { useLoginStore } from "@/stores/loginStore.js";
const loginStore = useLoginStore();

import { useCategoryStore } from "@/stores/categoryStore.js";
const categoryStore = useCategoryStore();

import {useSysSettingStore} from "@/stores/sysSetting.js";
const sysSettingStore = useSysSettingStore();

// 获取系统设置信息
const getSysSetting = async () => {
  let result = await proxy.Request({
    url: Api.getSysSetting,
  });
  if (!result) {
    return;
  }
  sysSettingStore.saveSetting(result.data);
};

const config = ref({
  max: 1. //  这里设置消息弹窗最多只存在一个。默认模式下可以存在多个
});

const autoLogin = async () => {
  const token = VueCookies.get("token");
  if(!token){
    return;
  }
  let result = await Request({
    url: Api.autoLogin,
  });
  if(!result){
    return;
  }
  savaLoginInfo(result.data);
}

const savaLoginInfo = (loginInfo) => {
  if (!loginInfo) {
    loginStore.saveUserInfo({});
  }else{
    loginStore.saveUserInfo(loginInfo);
  }
}

let categoryList = [];
let categoryMap = {};

const loadCategory = async () => {
  let result = await Request({
    url: Api.loadAllCategory,
  });
  if(!result){
    return;
  }
  categoryList = result.data;
  result.data.forEach((element) => {
    categoryMap[element.categoryCode] = element;
    element.children.forEach((sub) => {
      categoryMap[sub.categoryCode] = sub;
    });
  });
  categoryStore.saveCategoryMap(categoryMap);
  categoryStore.saveCategoryList(categoryList);
}

const getDeviceId = async () => {
  let deviceId = VueCookies.get("deviceId");
  if(!deviceId){
    const fpPromise = await FingerprintJS.load();
    const result = await fpPromise.get();
    deviceId = result.visitorId;
    VueCookies.set("deviceId", deviceId, -1); //  -1表示永不过期
  }
  loginStore.saveDeviceId(deviceId);
};

onBeforeMount(() => {
  autoLogin();
  loadCategory();
  getDeviceId();
  getSysSetting();
});

</script>


<style scoped>

</style>
