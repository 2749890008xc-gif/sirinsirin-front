import './assets/base.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/icon/iconfont.css'

import App from './App.vue'
import router from './router'
import VueCookies from 'vue-cookies'

import Dialog from "@/components/Dialog.vue";
import Avatar from "@/components/Avatar.vue";
import Cover from "@/components/Cover.vue";
import Table from "@/components/Table.vue";
// import VideoItem from "@/components/VideoItem.vue";

// import DataLoadMoreList from "@/components/DataLoadMoreList.vue"
// import NoData from "@/components/NoData.vue";
import Player from "@/components/Player.vue";

import Verify from "@/utils/Verify";
import Request from "@/utils/Request";
import Message from "@/utils/Message";
import Confirm from "@/utils/Confirm";
import {Api} from "@/utils/Api";
import Utils from "@/utils/Utils";

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(ElementPlus)

app.component('Dialog', Dialog)
app.component('Avatar', Avatar)
app.component('Cover', Cover)
// app.component('VideoItem', VideoItem)
// app.component('DataLoadMoreList', DataLoadMoreList)
// app.component('NoData', NoData)

app.component('Table', Table)

app.component('Player', Player)


app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.bodyMaxWidth = 1500;    //  定义body最大宽度
app.config.globalProperties.bodyMinWidth = 1250;    //  定义body最小宽度

app.config.globalProperties.Verify = Verify;
app.config.globalProperties.Request = Request;
app.config.globalProperties.Message = Message;
app.config.globalProperties.Api = Api;
app.config.globalProperties.Utils = Utils;
app.config.globalProperties.Confirm = Confirm;
//顶部分类，表示一行多少个分类
app.config.globalProperties.rowCategoryCount = 10;

app.config.globalProperties.imageThumbnailSuffix = "_thumbnail.jpg";
app.config.globalProperties.bodyPadding = 150;
app.mount('#app')
