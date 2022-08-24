
import {useNavigate} from 'react-router';
import { io } from 'socket.io-client';

export const game_socket = io('http://localhost:3333', { transports: ['websocket']});


export function game_socket_init() { 
	game_socket.on('connect', () => {
		console.log(game_socket.id);
	});
	game_socket.on('disconnect', () => {
		console.log(game_socket.id);
	});
	game_socket.on('echo', (data) => {
		console.log('echo data: ', data);
	});
}
