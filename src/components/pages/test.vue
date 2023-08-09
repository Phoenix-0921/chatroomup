<template>
    <div class="menu">
        <a href="#" class="back"><i class="fa fa-angle-left"></i></a>
        <div class="name">Random chat</div>
    </div>

    <ol class="chat">
        <li class="other">
            <div class="msg">
                對方傳的內容
                <time>時間戳記</time>
            </div>
        </li>
        <button @click="connect" v-if="!connected">連接</button>
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
            console.log("Cookie ID:", this.cookieID);
        },

        connect() {
            var socket = new SockJS('http://localhost:8080/ws');
            this.stompClient = Stomp.over(socket);

            this.stompClient.connect({}, (frame) => {
                this.connected = true;

                // 連接成功後，將 Cookie ID 和 WebSocket ID 送到後端
                this.stompClient.send("/app/connect", {}, JSON.stringify({ 'cookieID': this.cookieID }));
            });
        },

        disconnect() {
            axios.post("http://localhost:8080/chat/disconnect", { cookieID: this.cookieID })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
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