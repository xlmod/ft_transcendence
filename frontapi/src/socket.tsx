
import { io, Socket } from 'socket.io-client';


class GameSocket {

	socket: Socket;
	
	constructor() {
		this.socket = io('http://localhost:3333', { transports: ['websocket']});
		this.socket.on("connect", () => {
		});
		this.socket.on("disconnect", () => {
		});
		this.socket.on("echo", (data) => {
			console.log(`echo : ${data}`);
		});
	}

	get_ready() {
		this.socket.emit("ready");
	}
}

export const game_socket = new GameSocket();
