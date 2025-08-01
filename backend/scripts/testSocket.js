import { io } from "socket.io-client";

const socket = io("http://localhost:5030");

socket.on("connect", () => {
  console.log("Connected with id:", socket.id);
});

socket.on("productVisibilityChanged", (data) => {
  console.log("Received event:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
