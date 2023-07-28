<template>
<div class="menu">
  <a href="#" class="back"><i class="fa fa-angle-left"></i></a>
  <div class="name">Random chat</div>
<div class="members">You</div>

</div>
<button @click="matchUsers">連接</button>
<ol class="chat">
<li class="other">
<div class="msg">
對方傳的內容
<time>時間戳記</time>
</div>
</li>

<li class="self">
<div class="msg">
<p>我傳送的內容</p>
<time>時間戳記</time>
</div>
</li>
<ul>
  <li v-for="message in messages" :class="message.sender">
    <div class="msg"  >
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
        name: 'Chatroom',
	    data() {
		 // 這裡出現的變數才可以在網頁內使用
		  return {
		   showWarning: false, // 開關警告訊息用
       messages: [], // 存儲聊天消息的數組
       newMessage: "", // 用於綁定輸入框的值
       result: ""
		}
	},
	   //新增watch方法
	  watch: {
		   // 監看
      },

	   //vue 的方法放這裡
	  methods: {
      matchUsers() {
        this.showWarning = true; // 顯示提示訊息，表示正在等待配對
        // 發送POST請求到後端的隨機配對API
        console.log("我點下了按鈕");
        axios.post('/chat/match')
          .then(response => {
            // 在前端處理後端回傳的數據
            if (response.data.success) {
              this.result = `用戶 ${response.data.user1Id} 和用戶 ${response.data.user2Id} 成功匹配，可以進行匿名聊天！`;
            } else {
              this.result = '目前找不到足夠的用戶進行配對，請稍後再試。';
            }
          })
          .catch(error => {
            console.error('錯誤:', error);
            this.result = '發生錯誤，請稍後再試。';
          })
          .finally(() => {
            this.showWarning = false; // 配對完成或出現錯誤時，關閉提示訊息
          });
      },
      sendMessage(event) {
      event.preventDefault(); // 阻止表單提交的預設行為
    
      if (this.newMessage.trim() !== "") {
        this.messages.push({
          sender: "self",
          content: this.newMessage,
          timestamp: new Date().toLocaleTimeString() // 添加時間戳記
        });
        this.newMessage = ""; // 清空輸入框
      }
    }
    },
    
   }
</script>
<style scoped> 
@import '/src/css/chatroom.css';
</style>