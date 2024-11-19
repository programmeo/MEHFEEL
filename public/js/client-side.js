const usrname = prompt("Enter Your Name")
const socket = io({ query: { name: `${usrname}` } });
// const socket = io();
socket.on()

socket.emit('joinRoom', '<%= roomName %>'); // Join the room

// document.getElementById('sendBtn').addEventListener('click', () => {
//     const msg = document.getElementById('msgInput').value;
//     // socket.emit('chatMessage', `${usrname}: ${msg}`, '<%= roomName %>');
//     socket.emit('chatMessage', `${msg}`, '<%= roomName %>');
//     document.getElementById('msgInput').value = '';
// });

// socket.on('message', (msg) => {
//     const item = document.createElement('li');
//     item.textContent = msg;
//     document.getElementById('messages').appendChild(item);
// });

let ChatContainer = document.querySelector(".chat-container")
let InputContainer = document.querySelector('.input-container>input')
let SendBtn = document.querySelector(".sendbtn")

InputContainer.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      SendBtn.click();
    }
  });

function SendMessage() {
    let ChatMasssage = document.createElement('div');
    ChatMasssage.setAttribute('class', 'block float-end');
    ChatContainer.appendChild(ChatMasssage);
    ChatMasssage.textContent = InputContainer
    InputContainer.value = ""

    // Keep the focus on the input after sending the message
    InputContainer.focus();

    //make scroll at the end on every click
    ChatContainer.scrollTop = ChatContainer.scrollHeight;
}

socket.on('user name', (msg) => {
  let displayName = document.createElement('div')
  displayName.textContent = msg
  document.getElementById("main").appendChild(displayName)
})

console.log(ChatContainer);
