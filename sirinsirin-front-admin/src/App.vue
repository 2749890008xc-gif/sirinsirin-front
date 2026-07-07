<template>
  <el-config-provider :locale="zhCn" :message="config">
    <router-view></router-view>
  </el-config-provider>
  
</template>


<script setup>
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

import {ref, reactive, getCurrentInstance, nextTick, onBeforeMount} from "vue"
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import FingerprintJS from "@fingerprintjs/fingerprintjs"

</script>


<style scoped>

</style>
