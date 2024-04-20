<template>
    <div>
      <div class="container" ref="container"></div>
  
      <div class="apis">
        <div class="api-box">
          <div class="api-title">初始化状态：</div>
          <span v-if="inited">初始化完成</span>
          <span v-else>正在加载 {{ progress }}%</span>
        </div>
  
        <div class="api-box">
          <div class="api-title">AI对话：</div>
          <textarea
            style="width: 200px; height: 300px"
            v-model="inputValue"
          ></textarea>
          <button @click="ask">ask</button>
          <button @click="speak">speak</button>
          <button @click="stopAct">打断演讲</button>
          <button @click="speakStream">流式演讲</button>
          <button @click="getBundles">获取当前装扮</button>
          <button @click="changeBundles">切换装扮</button>
          <button @click="skeaniAnimation('skeani')">获取一个身体动画</button>
          <button @click="skeaniAnimation('faceani')">获取一个面部动画</button>
          <button @click="skeaniAnimation('lipani')">获取一个唇形动画</button>
          <button @click="skeaniAnimation('drama')">
            获取一个3D剧本、剧本动画动画
          </button>
          <button @click="changeBg">改变背景为css颜色值</button>
          <button @click="changeBgHdr">改变背景为hdr</button>
          <button @click="freshToken">手动刷新token</button>
        </div>
  
        <div class="chat-history" v-if="inited">
          <div
            class="chat-item"
            v-for="(chat, index) in chatHistory"
            :key="index"
          >
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
  
  import { getBundlesList } from "../api/api";
  export default {
    setup() {
      const container = ref(null);
      let cas = null;
      const progress = ref(0);
      const inited = ref(false);
      const inputValue = ref("");
      const chatHistory = ref([]);
  
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
        cas.addHdrScene(
          "https://nexthuman.cn/webapp/hdr/hdr_env02/hdr_env02.hdr"
        );
      };
  
      onMounted(async () => {
        cas = new NextCas(container.value, {
          avatarId: "avatar_257",
          actorId: "641811add41a3f2f91247af5",
          token:
            "next6602d484f39da553d0977600@eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicm9sZS52aXNpdCIsInZpc2l0SWQiOiIxMjMiLCJ2aXNpdE5hbWUiOiIiLCJ0aW1lc3RhbXAiOjE3MTI1NTUxNTY0NjQsImV4cCI6MTcxMjU1NTIxNiwiaWF0IjoxNzEyNTU1MTU2fQ.rd-q7DAhev1B5wMWwvsNOs9tHBOxVH1cOzF_HLX911E",
          // templateName: "introduce", // 有文本框，人，语音，切换，对话记录等
          templateName: "base", // 只有一个人
        });
  
        cas.on("initProgress", (cent) => {
          progress.value = cent;
        });
        console.log(new Date());
        setInterval(() => {
          console.log(new Date());
        }, 1000);
  
        cas.on("ready", () => {
          inited.value = true;
          setTimeout(() => {
            cas.speak("你好，请问有什么可以帮您");
          });
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
        getBundles,
        changeBundles,
        skeaniAnimation,
        changeBg,
        changeBgHdr,
      };
    },
  };
  </script>
  