<template>
    <div class="menu">
        <a href="#" class="back"><i class="fa fa-angle-left"></i></a>
        <div class="name">Random chat {{ this.cookieID }}</div>
    </div>

    <ol class="chat">
        <li class="other">
            <div class="msg">
                對方傳的內容
                <time>時間戳記</time>
            </div>
        </li>
        <button @click="connectAndMatch" v-if="!connected">連接</button>
        <button @click="disconnect" v-if="connected">斷開連接</button>
        <li class="self">
            <div class="msg">
                <p>我傳送的內容</p>
                <time>時間戳記</time>
            </div>
        </li>
        <ul>
            <li v-for="message in messages" :class="message.sender">
                <div class="msg">
                    <p>{{ message.content }}</p>
                    <time>{{ message.timestamp }}</time>
                </div>
            </li>
        </ul>

    </ol>
    <div class="typezone">
        <div class="typezone">
            <form>
                <textarea type="text" placeholder="Say something" v-model="newMessage" @keydown.enter.prevent="sendMessage">
        </textarea>
                <input type="submit" class="send" value="" @click="sendMessage($event)" />
            </form>
        </div>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    name: 'test1',
    data() {
        // 這裡出現的變數才可以在網頁內使用
        return {
            cookieName: 'my_cookie_id',
            cookieID: '', //cookieID做辨認
            showWarning: false, // 開關警告訊息用
            messages: [], // 存儲聊天消息的數組
            newMessage: "", // 用於綁定輸入框的值
            result: "",
            connected: false,
            stompClient: null,
            chatMessages: [],
            heartbeatIntervalId: null, // 心跳間隔的計時器 ID
        }
    },
    //新增watch方法
    watch: {
        // 監看
    },
    created() {
        this.cookieID = this.getOrCreateCookieID();
        console.log("Cookie ID:", this.cookieID); //進入就創建cookieID
    },

    //vue 的方法放這裡
    methods: {
        generateUUID() {
            let dt = new Date().getTime();
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = (dt + Math.random() * 16) % 16 | 0;
                dt = Math.floor(dt / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        },
        getOrCreateCookieID() {
            let cookieID = this.getCookie(this.cookieName);
            if (!cookieID) {
                cookieID = this.generateUUID();
                this.setCookie(this.cookieName, cookieID, 365);
            }
            return cookieID;
        },
        getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                return parts.pop().split(';').shift();
            }
        },
        setCookie(name, value, days) {
            const d = new Date();
            d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
            const expires = `expires=${d.toUTCString()}`;
            document.cookie = `${name}=${value}; ${expires}; path=/`;
        },
        showCookieID() {
            this.cookieID = this.getOrCreateCookieID();
        },

        async connectAndMatch() {
      try {
        const waitingDataResponse = await axios.get('http://localhost:8080/chat/checkWaiting', {
          params: {
            cookieID: this.cookieID,
          },
        });

        const waitingData = waitingDataResponse.data;
        if (waitingData) {
          const otherWebSocketId = waitingData.websocketId;
          // 建立 WebSocket 连接并进行匹配
          // ...
        } else {
          const matchResponse = await axios.post('http://localhost:8080/chat/match', null, {
            params: {
              cookieID: this.cookieID,
            },
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const receivedWebSocketId = matchResponse.data.websocketId;
          // 处理匹配结果，建立 WebSocket 连接
          // ...
        }
      } catch (error) {
        console.error('匹配請求失敗:', error);
        console.error('錯誤詳細資訊:', error.response);
      }
    },
    


        connectWebSocket() {
            // 使用 wss 协议连接 WebSocket
            var socket = new SockJS('https://localhost:8080/ws'); // 或 ws://localhost:8080/ws
            this.stompClient = Stomp.over(socket);
            var connectHeaders = {
                'websocketID': this.websocketId,
            };
            this.stompClient.connect(connectHeaders, (frame) => {
                this.connected = true;
                console.log(connectHeaders);
                console.log('Connected: ' + frame);
                this.stompClient.subscribe('/topic/getResponse', (response) => {
                    console.log(response);
                    const responseMessage = JSON.parse(response.body).responseMessage;
                    this.showConversation(responseMessage);
                });
            });
            this.heartbeatIntervalId = setInterval(() => {
                this.sendHeartbeat();
            }, 5000); // 5 秒發送一次心跳訊號
        },



        sendHeartbeat() {
            if (this.stompClient && this.connected) {
                this.stompClient.send("/app/heartbeat", {});
            }
        },
        disconnect() {
            if (this.stompClient !== null) {
                this.stompClient.disconnect();
            }
            this.connected = false;
            console.log('Disconnected');
            if (this.heartbeatIntervalId) {
                clearInterval(this.heartbeatIntervalId);
                this.heartbeatIntervalId = null;
            }
        },


        sendName() {
            var name = this.newMessage;
            console.log(name);
            this.newMessage = ''; // 清空輸入框的內容
            console.log(this.stompClient);
            this.stompClient.send("/app/messageControl", {}, JSON.stringify({ 'message': name }));
        },
        sendMessage(event) {
            event.preventDefault();
            if (this.newMessage.trim() !== "") {
                this.messages.push({
                    sender: "self",
                    content: this.newMessage,
                    timestamp: new Date().toLocaleTimeString()
                });
                this.sendName(); // 在這裡調用 `sendName` 方法
            }
        },
        showConversation(responseMessage) {
            if (responseMessage && !this.chatMessages.includes(responseMessage)) {
                this.messages.push({
                    sender: 'other', // 假設從後端收到的是對方的訊息，因此設為'other'
                    content: responseMessage,
                    timestamp: new Date().toLocaleTimeString(),
                });
            }
        }
    }
}

</script>
<style scoped> @import '/src/css/chatroom.css';
</style>