
import { io, Socket } from 'socket.io-client';


class GameSocket {

	socket: Socket;
	
	constructor() {
		this.socket = io('http://localhost:3333/game', { transports: ['websocket']});
		this.socket.on("connect", () => {
		});
		this.socket.on("disconnect", () => {
		});
	}
}

export const game_socket = new GameSocket();
