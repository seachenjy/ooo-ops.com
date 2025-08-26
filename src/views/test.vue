<template>
    <b>test</b>
</template>
<script setup>
import cloudbase from "@cloudbase/js-sdk";

// 初始化 CloudBase
const app = cloudbase.init({
  env: "dev-2g9eqpv5a6448de5",  // 云开发环境 ID
  clientId: 'AOJ8yAABmOP6KdrrdkA'
});

// 获取函数调用对象
const auth = app.auth();
const callFunction = async () => {
  try {
    // 匿名登录（也可以用微信/自定义登录）
    // if (!auth.hasLoginState()) {
    //   await auth.anonymousAuthProvider().signIn();
    // }

    const res = await app.callFunction({
      name: "bookmanagementmodel",   // 云函数名
      data: {
      "action": "listBooks",
      "data": {
        "page": 1,
        "pageSize": 10
      }
    }
    });

    console.log("函数返回:", res.result);
  } catch (err) {
    console.error("调用失败:", err);
  }
};

callFunction();
</script>