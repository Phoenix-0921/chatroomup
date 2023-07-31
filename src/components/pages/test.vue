<template>
    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <form class="form-inline" @submit.prevent="connect">
                    <div class="form-group">
                        <label for="connect">WebSocket 連接:</label>
                        <button id="connect" class="btn btn-default" :disabled="connected" type="submit">連接</button>
                        <button id="disconnect" class="btn btn-default" :disabled="!connected" type="button"
                            @click="disconnect">關閉連接</button>
                    </div>
                </form>
            </div>
            <div class="col-md-6">
                <form class="form-inline" @submit.prevent="sendName">
                    <div class="form-group">
                        <label for="name">發送訊息</label>
                        <input v-model="message" type="text" id="name" class="form-control" placeholder="請輸入訊息">
                    </div>
                    <button id="send" class="btn btn-default">發送</button>
                </form>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <table id="conversation" class="table table-striped">
                    <thead>
                        <tr>
                            <th>我的聊天室</th>
                        </tr>
                    </thead>
                    <tbody id="chatRoom">
                        <tr v-for="(message) in chatMessages" :key="index">
                            <td>{{ message }}</td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { Client } from '@stomp/stompjs';
export default {
    name: 'Test',
    data() {
        return {
            connected: false,
            
            message: '',
            chatMessages: [],
            heartbeatIntervalId: null, // 心跳間隔的計時器 ID
        };
    },
    methods: {
        connect() {
            const client = new Client({
                brokerURL: 'ws://localhost:5173/ws',
                onConnect: () => {
                    this.connected = true;
                    console.log('Connected to WebSocket server');

                    // 訂閱 '/topic/getResponse' 頻道
                    client.subscribe('/topic/getResponse', message => {
                        console.log(`Received: ${message.body}`);
                        const responseMessage = JSON.parse(message.body).responseMessage;
                        this.showConversation(responseMessage);
                    });

                    // 發送第一則訊息
                    client.publish({ destination: '/topic/getResponse', body: 'First Message' });
                },
            });

            client.activate(); // 啟動 WebSocket 連接
        },

        disconnect() {
            if (this.stompClient !== null) {
                this.stompClient.disconnect();
            }
            this.connected = false;
            console.log("Disconnected");
        },
        // 移除 sendName 方法中的 showConversation 呼叫
        sendName() {
            var name = this.message;
            this.message = '';  // 清空輸入框的內容
            console.log(name);
            console.log(this.stompClient);
            this.stompClient.send("/app/messageControl", {}, JSON.stringify({ 'message': name }));
        },
        showConversation(responseMessage) {
            if (responseMessage && !this.chatMessages.includes(responseMessage)) {
                this.chatMessages.push(responseMessage);
            }
        }

    }

}


</script>

<style scoped></style>