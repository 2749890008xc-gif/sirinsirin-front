import './assets/scss/base.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/icon/iconfont.css'
import '@/assets/icon/iconfont-extend.css'

import App from './App.vue'
import router from './router'
import VueCookies from 'vue-cookies'

import Dialog from "@/components/Dialog.vue";
import Avatar from "@/components/Avatar.vue";
import Cover from "@/components/Cover.vue";
import VideoItem from "@/components/VideoItem.vue";
import ImageCoverSelect from "@/components/ImageCoverSelect.vue";
import DataLoadMoreList from "@/components/DataLoadMoreList.vue";
import DataGridList from "@/components/DataGridList.vue";
import NoData from "@/components/NoData.vue";
import Collapse from "@/components/Collapse.vue";
import DataList from "@/components/DataList.vue";
import Table from "@/components/Table.vue";
import MyTab from "@/components/MyTab.vue";

import Verify from "@/utils/Verify";
import Request from "@/utils/Request";
import Message from "@/utils/Message";
import Confirm from "@/utils/Confirm";
import {Api} from "@/utils/Api.js";
import Utils from "@/utils/Utils";

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(ElementPlus)

app.component('Dialog', Dialog)
app.component('Avatar', Avatar)
app.component('Cover', Cover)
app.component('VideoItem', VideoItem)
app.component('DataLoadMoreList', DataLoadMoreList)
app.component('NoData', NoData)
app.component('DataList', DataList)
app.component('Collapse', Collapse)
app.component('ImageCoverSelect', ImageCoverSelect)
app.component('Table', Table)
app.component('MyTab', MyTab)
app.component('DataGridList', DataGridList)

app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.bodyMaxWidth = 2000;    //  定义body最大宽度，原来是1500
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
//  控制首页轮播图中图片的数量
app.config.globalProperties.carouselMaxCount = 5;

// 图片后缀
app.config.globalProperties.imageAccept = ".jpg,.png,.gif,.bmp,.webp";
// 视频后缀
app.config.globalProperties.videoAccept = ".mp4,.avi,.rmvb,.mkv,.mov";
//  分片大小，目前是512kb
app.config.globalProperties.chunkSize = 1024 * 512;
//  同时最大上传数量
app.config.globalProperties.maxUploading = 3;
app.mount('#app')
