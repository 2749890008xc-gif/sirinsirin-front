<template>
  <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :showCancel="false"
      @close="dialogConfig.show = false"
  >
    <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="80px"
      @submit.prevent
    >
      <!--input输入-->
      <el-form-item label="UID" prop="">
        {{formData.userId}}
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <ImageCoverSelect
            :coverWidth="150"
            :cutWidth="150"
            :scale="1"
            :coverImage="formData.avatar"
        ></ImageCoverSelect>
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input
            clearable
            placeholder="昵称"
            v-model="formData.nickName"
            :maxlength="20"
            show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :value="0">女</el-radio>
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">保密</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="出生日期" prop="birthday">
        <el-date-picker
            v-model="formData.birthday"
            type="date"
            placeholder="请选择出生日期"
            value-format="YYYY-MM-DD"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="学校" prop="school">
        <el-input
            clearable
            placeholder="学校信息"
            v-model="formData.school"
            :maxlength="150"
            show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="简介" prop="personIntroduction">
        <el-input
            clearable
            placeholder="简介"
            type="textarea"
            :rows="3"
            :maxlength="80"
            resize="none"
            show-word-limit
            v-model="formData.personIntroduction"
        ></el-input>
      </el-form-item>
      <el-form-item label="公告" prop="noticeInfo">
        <el-input
            clearable
            placeholder="公告"
            type="textarea"
            :rows="5"
            :maxlength="300"
            resize="none"
            show-word-limit
            v-model="formData.noticeInfo"
        ></el-input>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, provide } from "vue"
import { useRouter, useRoute } from "vue-router"
import {uploadImage} from "@/utils/Api.js";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const dialogConfig = ref({
  show: false,
  title: "修改用户信息",
  buttons: [
    {
      type: "primary",
      text: "确定",
      click: (e) => {
        submitForm();
      },
    },
  ],
});

provide("cutImageCallback", ({ coverImage }) => {
  formData.value.avatar = coverImage;
});

const formData = ref({});
const formDataRef = ref();
const rules = {
  avatar: [{ required: true, message: "请上传头像" }],
  nickName: [{ required: true, message: "请输入昵称" }],
  sex: [{ required: true, message: "请选择性别" }],
};

const show = (data) => {
  dialogConfig.value.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = Object.assign({}, data);
  });
};

defineExpose({
  show,
});

//  TODO 请注意，这里使用 reload 会导致更新完用户信息后只有内容区的头像效果改变，但顶部栏的头像不会立即改变，需要手动刷新。可以试着完善一下
const emit = defineEmits(["reload"]);
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);

    if (params.avatar instanceof File) {
      const avatar = await uploadImage(params.avatar);
      if (!avatar) {
        return;
      }
      params.avatar = avatar;
    }

    let result = await proxy.Request({
      url: proxy.Api.uHomeUpdateUserInfo,
      params,
    });
    if (!result) {
      return;
    }
    dialogConfig.value.show = false;
    proxy.Message.success("修改成功");
    emit("reload");
  });
};
</script>

<style scoped lang="scss">

</style>