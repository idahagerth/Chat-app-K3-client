import "./App.css";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

let socket;

function App() {
  const [messageData, setMessageData] = useState({
    body: "",
    user: "",
  });
  const [room, setRoom] = useState("");
  let [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const receivingStyle = {
      fontSize: "large",
      textAlign: "left",
      listStyleType: "none",
      color: "white",
      backgroundColor: "#a4161a",
      borderRadius: "2px",
    };

    const sendStyle = {
      fontSize: "large",
      textAlign: "right",
      listStyleType: "none",
      color: "white",
      backgroundColor: "#ffafcc",
      borderRadius: "2px",
    };

    socket = io("https://chat-app-server-ida.herokuapp.com");

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", (data) => {
      if (data.origin === "server") {
        let information = {
          time: data.time,
          user: data.user,
          message: data.message,
          style: receivingStyle,
        };
        setMessages((msg) => [...msg, information]);
      } else if (data.origin === "sender") {
        let information = {
          time: data.time,
          user: data.user,
          message: data.message,
          style: sendStyle,
        };
        setMessages((msg) => [...msg, information]);
      }
    });

    socket.on("joined_room", (data) => {
      console.log(`${data} Has joined room`);
    });

    return () => socket.off();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    handleMessage(room, messageData.user, messageData.body);
    setMessageData({ ...messageData, body: "" });
  };

  function handleMessage(room, user, message) {
    socket.emit(
      "message",
      JSON.stringify({
        room: `${room}`,
        user: `${user}`,
        message: `${message}`,
      })
    );
  }

  function joinRoom(roomName) {
    const information = {
      room: roomName,
      user: messageData.user,
    };
    socket.emit("join_room", information);
  }

  function leaveRoom(roomName) {
    const information = {
      room: roomName,
      user: messageData.user,
    };
    socket.emit("leave_room", information);
    setMessages([]);
  }

  return (
    <div className="App">
      <div className="chatArea">
        <div className="messageArea">
          <ul className="messageList">
            {messages.map((msg) => (
              <li style={msg.style} key={msg.message}>
                <p>
                  {msg.time} {msg.user} - {msg.message}
                </p>
              </li>
            ))}
          </ul>
          <div ref={bottomRef}></div>
          <div className="controllers">
            <form onSubmit={handleSubmit}>
              <select
                name="usernames"
                id="usernames"
                onChange={(e) =>
                  setMessageData({ ...messageData, user: e.target.value })
                }
              >
                <option value="">Choose username</option>
                <option value="user1">user1</option>
                <option value="user2">user2</option>
                <option value="user3">user3</option>
              </select>

              <input
                id="sendMessage"
                type="text"
                value={messageData.body}
                placeholder="Message"
                onChange={(e) =>
                  setMessageData({ ...messageData, body: e.target.value })
                }
              ></input>
              <button>Send</button>
              <br />

              <input
                id="roomName"
                type="text"
                value={room}
                placeholder="Room name"
                onChange={(e) => setRoom(e.target.value)}
              ></input>
              <button onClick={() => joinRoom(room)}>Join room</button>
              <button onClick={() => leaveRoom(room)}>Leave room</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
