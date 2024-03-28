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
                <textarea v-model="inputValue"></textarea>
                <button @click="ask">ask</button>
                <button @click="speak">speak</button>
                <button @click="stopAct">打断演讲</button>
                <button @click="speakStream">流式演讲</button>
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import NextCas from "@nextcas/sdk";
export default {
    setup() {
        const container = ref(null);
        let cas = null;
        const progress = ref(0);
        const inited = ref(false);
        const inputValue = ref("");
        const chatHistory = ref([]);

        const getToken = async () => {
            // Implement your getToken function here
            return { data: 'next66056c86bf46ee5d997de368@eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicm9sZS52aXNpdCIsInZpc2l0SWQiOiIxMjMiLCJ2aXNpdE5hbWUiOiIiLCJ0aW1lc3RhbXAiOjE3MTE2MzU4NzkxMTUsImV4cCI6MTcxMTcyMjI3OSwiaWF0IjoxNzExNjM1ODc5fQ.q1fLhjtgcPo04j5ywPrBi-c1ELyQUJcP5cQHmybWTHQ' }
        };

        const ask = async () => {
            chatHistory.value.push({
                source: "guest",
                content: inputValue,
            });
            const askId = await cas.ask(inputValue);

            const index = chatHistory.value.length;
            function reply(data) {
                console.log(data);
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
            // 监听 replay 时间，reply 函数是一次回答调用多次，实现了“流式”效果，但是是不断拼接较长的字符串，效果还是不太好
            cas.on("reply", reply);
        };

        const speak = () => {
            // Implement your speak function here
            chatHistory.value.push({
                source: "nexthuman",
                content: inputValue,
            });
            // console.log(inputValue);
            console.log(inputValue.value);
            // chatHistory.value = chatHistory.value;
            cas?.speak(inputValue.value);
        };

        const stopAct = () => {
            cas?.call("stopAct");
            // console.log(cas)
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

        onMounted(async () => {
            const { data: token } = await getToken();
            cas = new NextCas(container.value, {
                avatarId: "avatar_257",
                actorId: "641811add41a3f2f91247af5",
                token: token,
                templateName: "introduce"
            });

            cas.on("initProgress", (cent) => {
                progress.value = cent;
            });

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
            progress,  // 数字人初始化进度
            inited, // 数字人初始化完成改变标志
            inputValue, // 用户输入框的 v-model
            chatHistory, // 对话历史
            ask, // 主动对话方法
            speak,
            stopAct,
            speakStream
        };
    }
};
</script>

<style>
.container {
    position: fixed;
    left: 20px;
    top:10px;
    width: 375px;
    height: 700px;
    border: 1px solid red;
}

.apis {
    position: fixed;
    right: 0;
    top:10px;
    padding: 20px;
    width: 500px;
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