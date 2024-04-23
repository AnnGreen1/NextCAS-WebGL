<template>
  <div>
    <div class="container" ref="container"></div>

    <div class="apis" v-show="toggle">
      <div class="api-box">
        <div class="api-title">初始化状态：</div>
        <span v-if="inited">初始化完成</span>
        <span v-else>正在加载 {{ progress }}%</span>
      </div>

      <div class="api-box">
        <div class="api-title">AI对话：</div>
        <textarea style="width: 200px; height: 300px" v-model="inputValue"></textarea>
        <button @click="ask">ask</button>
        <button @click="speak">speak</button>
        <button @click="stopAct">打断演讲</button>
        <button @click="speakStream">流式演讲</button>
        <button @click="getBundles">获取当前装扮</button>
        <button @click="changeBundles">切换装扮</button>
        <button @click="skeaniAnimation('skeani')">获取一个身体动画</button>
        <button @click="skeaniAnimation('faceani')">获取一个面部动画</button>
        <button @click="skeaniAnimation('lipani')">获取一个唇形动画</button>
        <button @click="skeaniAnimation('drama')">获取一个3D剧本、剧本动画动画</button>
        <button @click="changeBg">改变背景为css颜色值</button>
        <button @click="changeBgHdr">改变背景为hdr</button>
        <button @click="freshToken">手动刷新token</button>
        <button @click="changeCamera({ x: 0, y: 1.65, z: 0.8 }, { x: 0, y: 1.61, z: -0.45 }, 500)">脸部视角</button>
        <button @click="changeCamera({ x: 0, y: 1.65, z: 3.2 }, { x: 0, y: 1.34, z: 1.5 }, 500)">全身视角</button>
        <button @click="changeCamera({ x: 0, y: 1.8, z: 3 }, { x: 0, y: 1.8, z: -0.45 }, 500)">上半身视角</button>
        <button @click="changeCamera({ x: 0, y: 1.8, z: -3 }, { x: 0, y: 1.8, z: -0.45 }, 500)">背后视角</button>
      </div>

      <div class="chat-history" v-if="inited">
        <div class="chat-item" v-for="(chat, index) in chatHistory" :key="index">
          <div class="chat-item-avatar">{{ chat.source }}：</div>
          <div class="chat-item-content">{{ chat.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import NextCas from "@nextcas/sdk";

import { getBundlesList, getToken } from "../api/api";
export default {
  setup() {
    const container = ref(null);
    let cas = null;
    const progress = ref(0);
    const inited = ref(false);
    const inputValue = ref("");
    const chatHistory = ref([]);

    const toggle = ref(false);

    // const getToken = async () => {
    //   return {
    //     data: "next6602d484f39da553d0977600@eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicm9sZS52aXNpdCIsInZpc2l0SWQiOiIxMjMiLCJ2aXNpdE5hbWUiOiIiLCJ0aW1lc3RhbXAiOjE3MTI1NDM0MzU0OTAsImV4cCI6MTcxMjYyOTgzNSwiaWF0IjoxNzEyNTQzNDM1fQ.rAjGQxupxNfZxP764jM9eaOELuzvVgLMrK1klSCES5U",
    //   };
    // };

    const ask = async () => {
      chatHistory.value.push({
        source: "guest",
        content: inputValue.value,
      });
      const askId = await cas.ask(inputValue.value);

      const index = chatHistory.value.length;
      function reply(data) {
        // 为了判断回答的是不是这个问题
        if (data.id === askId) {
          if (!chatHistory.value[index]) {
            chatHistory.value.push({
              source: "nexthuman",
              content: data.data.content,
            });
          } else {
            chatHistory.value[index].content += data.data.content;
          }
          chatHistory.value = chatHistory.value;

          if (data.data.last) {
            // 结束了
            cas.off("reply", reply);
          }
        }
      }
      // 监听 replay 事件，reply 函数是一次回答调用多次，实现了“流式”效果，但是是不断拼接较长的字符串，效果还是不太好
      cas.on("reply", reply);
    };

    const speak = () => {
      chatHistory.value.push({
        source: "nexthuman",
        content: inputValue.value,
      });
      cas?.speak(inputValue.value);
    };

    const stopAct = () => {
      cas?.call("stopAct");
    };

    const speakStream = () => {
      const stream = cas?.createSpeackStream();
      stream.next("你好");
      setTimeout(() => {
        stream.next("我是小唯");
        // 非最后一句话使用 next() 方法，最后一句话需要使用 last方法
        stream.last("很高兴见到你");
      }, 1000);
    };

    const getBundles = async () => {
      const currentBundles = await cas.getBundles();
      console.log(currentBundles);
    };
    const changeBundles = async () => {
      let data = {
        category: "hair",
        bodyId: "nh_webreal_female_01", //WebGL次写实(女)
        scope: "free",
        cvs: ["webgl_threejs@1.0"],
        page: 1,
        pageSize: 8,
      };
      getBundlesList(data).then((res) => {
        cas.addBundle(res.data.content[4].id);
      });
    };

    const skeaniAnimation = async (category) => {
      let data = {
        category: category,
        bodyId: "nh_webreal_female_01", //WebGL次写实(女)
        scope: "free",
        cvs: ["webgl_threejs@1.0"],
        page: 1,
        pageSize: 8,
      };
      getBundlesList(data).then((res) => {
        cas.addBundle(res.data.content[0].id);
      });
    };

    const changeBg = async () => {
      cas.setBackground("red");
    };

    const changeBgHdr = async () => {
      // cas.addHdrScene("https://nexthuman.cn/webapp/hdr/hdr_env02/hdr_env02.hdr");
      cas.addHdrScene("http://192.168.16.117:9000/education/music_hall_02_8k.hdr"); // 上传到 minio 的一个 hdr文件 可以实现背景
      // cas.addHdrScene("https://s.cn.bing.net/th?id=OHR.SunsetArchesNP_ZH-CN9875945974_1920x1080.webp");
    };

    const changeCamera = async (position, lookAt, duration) => {
      console.log("执行了", position, lookAt, duration);
      console.log(cas);
      cas.changeCamera(position, lookAt, duration);
      console.log(cas);
      toggle.value = false;
    };

    // const playDrama = () => {
    //     let data = {
    //         accessToken: 'next66056c86bf46ee5d997de368@eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicm9sZS52aXNpdCIsInZpc2l0SWQiOiIxMjMiLCJ2aXNpdE5hbWUiOiIiLCJ0aW1lc3RhbXAiOjE3MTE5Nzg4NzIwOTMsImV4cCI6MTcxMjA2NTI3MiwiaWF0IjoxNzExOTc4ODcyfQ.g3wsXVT23PnWcRzg_TLAwSAKMwyBBAPkHpjVn6RNnLAs',
    //         text: '每天起来我们都应该微笑面对生活[e:customer_service]，也要时常自我加油[m:introduce]，' +
    //             '如果身体疲惫的时候，我们可以做体操舒缓一下身体,' +
    //             '[a:https://cdn.wehome.cn/cmn/mp3/META-1OB66K71-YZGGZ6U3C0QUWDEIT3JN2-E1U315QL-BX1.mp3][m:skeani_341]，' +
    //             '这样就可以时刻为自己的身体注射新的能量啦,[e:happy]比心～～',
    //         actorId: "641811add41a3f2f91247af5",
    //         faceModel: "richu",
    //         faceQuality: "middle"
    //     }
    //     fetch('https://nexthuman.cn/open/srv/drama/create3D', {
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         method: 'post',
    //         body: JSON.stringify(data)
    //     })
    //         .then(function (response) {
    //             console.log(response.json);
    //         })
    //         .then(function (response) {
    //             console.log(response);
    //         });
    //     // cas.playDrama(dramaId);
    // }

    const freshToken = () => {
      console.log("refresh");
      cas?.refresh_token();
    };
    onMounted(async () => {
      // const { data: token } = await getToken();
      toggle.value = Math.random() > 0.5 ? true : false;
      console.log("toggle", toggle.value);
      getToken().then((res) => {
        // 获取装扮  avatar
        let avatardata = {
          category: "avatar",
          bodyId: "nh_webreal_female_01", //WebGL次写实(女)
          scope: "inapp",
          cvs: ["webgl_threejs@1.0"],
          page: 1,
          pageSize: 8,
        };
        let token = res.data;
        // getBundlesList(avatardata).then((res) => {
        cas = new NextCas(container.value, {
          avatarId: "avatar_257",
          actorId: "actor_103437",
          token: token,
          // templateName: "introduce", // 有文本框，人，语音，切换，对话记录等
          templateName: "base", // 只有一个人
        });

        // cas.addBundle(res.data.content[0].id);

        cas.on("initProgress", (cent) => {
          progress.value = cent;
        });
        console.log(new Date());
        setInterval(() => {
          console.log(new Date());
        }, 1000);

        cas.on("ready", () => {
          inited.value = true;
          // changeBgHdr();
          // setTimeout(() => {
          //   cas.speak("你好，请问有什么可以帮您");
          // });
        });

        cas.on("refresh_token", () => {
          console.log("需要重新生成token了");
          getToken().then((res) => {
            console.log(res);
            cas.updateToken(res.token);
          });
          // const { data: token } = getToken();
          // cas.updateToken(token);
        });
        // });
      });
    });

    onBeforeUnmount(() => {
      if (cas) {
        cas.destroy();
      }
    });

    return {
      container, // 挂载节点
      progress, // 数字人初始化进度
      inited, // 数字人初始化完成改变标志
      inputValue, // 用户输入框的 v-model
      chatHistory, // 对话历史
      ask, // 主动对话方法
      speak,
      stopAct,
      speakStream,
      // playDrama,
      getBundles,
      changeBundles,
      skeaniAnimation,
      changeBg,
      changeBgHdr,
      freshToken,
      changeCamera,
      toggle,
    };
  },
};
</script>

<style>
.container {
  position: fixed;
  /* left: 20px;
  top: 10px; */
  /* width: 800px;
  height: 450px; */
  width: 98%;
  height: 100%;
  /* border: 1px solid red; */

  background: url(./image.jpg);
}

.apis {
  position: fixed;
  right: 0;
  top: 10px;
  padding: 20px;
  width: 1000px;
}

.api-box {
  display: flex;
  margin-top: 6px;
}

.api-title {
  font-size: 18px;
  font-weight: bold;
}

.chat-history {
  margin-top: 24px;
  max-height: 400px;
  overflow-y: overlay;
}

.chat-item {
  display: flex;
}

.chat-item-avatar {
  font-weight: bold;
  font-size: 18px;
}

button {
  margin: 0 12px;
}
</style>
