
import { HOST, PORT } from "./utils/env";
import { io, Socket } from 'socket.io-client';
import React from "react";


class GameSocket {

	socket: Socket;
	status: Map<string, string>;
	status_change: number;
	
	constructor() {
		this.status = new Map();
		this.status_change = 0;
		this.socket = io(`http://${HOST}:${PORT}/game`, { transports: ['websocket']});
		this.socket.on("connect", () => {
			this.socket.emit("get_onlineuser");
		});
		this.socket.on("disconnect", () => {
		});

		this.socket.on("update_userstatus", (uid, status) => {
			this.status.set(uid, status);
			this.status_change += 1;
		});
		this.socket.on("user_disconnect", (uid) => {
			this.status.delete(uid);
		});
	}
}

export const game_socket = new GameSocket();


class ChatSocket {

	socket: Socket;
	
	constructor() {
		this.socket = io(`http://${HOST}:${PORT}/chat`, { transports: ['websocket']});
		this.socket.on("connect", () => {
		});
		this.socket.on("disconnect", () => {
		});
	}
}

export const chat_socket = new ChatSocket();


