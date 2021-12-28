import React from "react"
import io from "socket.io-client";

export const socket = io.connect("http://192.168.115.117:9000");
export const SocketContext = React.createContext();