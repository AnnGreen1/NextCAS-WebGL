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
            return { data: 'next6602d484f39da553d0977600@eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicm9sZS52aXNpdCIsInZpc2l0SWQiOiIxMjMiLCJ2aXNpdE5hbWUiOiIiLCJ0aW1lc3RhbXAiOjE3MTE1Mzc5NjE3OTAsImV4cCI6MTcxMTYyNDM2MSwiaWF0IjoxNzExNTM3OTYxfQ.JYEwfpWkQO61k6DhaAvR7nZCL6zospSPHKOG3pUqAbY' }
        };

        const ask = async () => {
            chatHistory.value.push({
                source: "guest",
                content: inputValue,
            });
            const askId = await cas.ask(inputValue);

            const index = chatHistory.value.length;
            function reply(data) {
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
            cas.on("reply", reply);
        };

        const speak = () => {
            // Implement your speak function here
            chatHistory.value.push({
                source: "nexthuman",
                content: inputValue,
            });
            chatHistory.value = chatHistory.value;
            cas?.speak(inputValue);
        };

        const stopAct = () => {
            // Implement your stopAct function here
        };

        const speakStream = () => {
            // Implement your speakStream function here
            cas?.call("stopAct");
            // console.log(cas)
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
            container,
            progress,
            inited,
            inputValue,
            chatHistory,
            ask,
            speak,
            stopAct,
            speakStream
        };
    }
};
</script>

<style>
.container {
    width: 375px;
    height: 800px;
    border: 1px solid red;
    flex-shrink: 0;
}

.apis {
    padding: 20px;
    max-width: 500px;
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