import { useRef, useEffect, useState } from "react";
import {Buffer} from "buffer";

import { game_socket } from "../../socket";
import { Button } from '../utils/button';

import { Board } from "./gameTypes/Board";
import {Vec} from "./gameTypes/Vec";
import {BASE_WIDTH} from "./gameTypes/base";
import {GAME_SETTINGS} from "./gameTypes/GameSettings";

import './game.css';
import {useParams} from "react-router";

type Room = {
	id: string,
	full: boolean,
	board: Board,
	score_left: number,
	score_right: number,
	player_left: string,
	player_right: string,
	user_left: string,
	user_right: string,
}

interface IProps {
	invitation?: boolean,
}

export function Game(props: IProps): JSX.Element {

	let canvasRef = useRef<HTMLCanvasElement | null>(null);

	const [left, setLeft] = useState<number>(0);
	const [right, setRight] = useState<number>(0);
	const [leftplayer, setLeftplayer] = useState<string>("Player");
	const [rightplayer, setRightplayer] = useState<string>("Player");
	const [state, setState] = useState<string>("");
	const [obsname, setObsname] = useState<string>("");
	const [end, setEnd] = useState<boolean>(false);
	const [winner, setWinner] = useState<string>("");

	const {code} = useParams();

	const board = new Board();
	board.reset();
	board.set_ball_dir(-1, 0);

	const setup_key = (side: string) => {
		let key_pressed = false;
		document.addEventListener('keydown', (e) => {
			let y = 0;
			if (e.key === "ArrowUp") {
				y = -1;
			} else if (e.key === "ArrowDown") {
				y = 1;
			} else {return ;}
			if (!key_pressed) {
				if (side === "left") {
					game_socket.socket.emit("update_paddle", {side, paddle_dir: new Vec(0, y), paddle_pos: board.get_left_pos()});
				} else {
					game_socket.socket.emit("update_paddle", {side, paddle_dir: new Vec(0, y), paddle_pos: board.get_right_pos()});
				}
				key_pressed = true;
			}
		});
		document.addEventListener('keyup', (e) => {
			if (e.key === "ArrowUp" || e.key === "ArrowDown") {
				if (side === "left") {
					game_socket.socket.emit("update_paddle", {side, paddle_dir: new Vec(0, 0), paddle_pos: board.get_left_pos()});
				} else {
					game_socket.socket.emit("update_paddle", {side, paddle_dir:new Vec(0, 0), paddle_pos: board.get_right_pos()});
				}
				key_pressed = false;
			} else {return ;}
		});
	};

	useEffect(() => {

		var side: string = "";
		var game_interval: any = null;

		game_socket.socket.on("room_player_joined", (data: string) => {
			side = data;
			setup_key(side);
			setState("player");
		});

		game_socket.socket.on("room_observer_joined", () => {
			side = "obs";
			setState("observer");
		});

		game_socket.socket.on("room_setting", (room: Room) => {
			setLeftplayer(room.user_left);
			setRightplayer(room.user_right);
			setLeft(room.score_left);
			setRight(room.score_right);
		});

		game_socket.socket.on("start_game", () => {
			board.reset();
			board.set_ball_dir(-1, 0);
			console.log(`start: ${game_interval}`)
			if (game_interval == null) {
				game_interval = setInterval(() => {
					board.tick();
					board.draw();
				}, 16);
			} else {
				clearInterval(game_interval);
			}
		});

		game_socket.socket.on("reset_game", () => {
			if (game_interval != null)
				clearInterval(game_interval);
			game_interval = null;
			board.clear();
		});

		game_socket.socket.on("end_game", (w) => {
			board.clear();
			board.reset();
			GAME_SETTINGS.remove_modifier("accelerate_ball");
			GAME_SETTINGS.remove_modifier("reduce");
			if (game_interval != null)
				clearInterval(game_interval);
			game_interval = null;
			if (w !== "") {
				setWinner(w);
				setEnd(true);
				setTimeout(() => {
					setState("");
					setLeftplayer("Player");
					setRightplayer("Player");
					setLeft(0);
					setRight(0);
					setEnd(false);
					setWinner("");
				}, 1500);
			} else {
				setState("");
				setLeftplayer("Player");
				setRightplayer("Player");
				setLeft(0);
				setRight(0);
			}
		});

		game_socket.socket.on("update_score", (score_left, score_right) => {
			setLeft(score_left);
			setRight(score_right);
		});

		game_socket.socket.on("update_ball", (pos, dir) => {
			board.set_ball_pos(pos.x, pos.y);
			board.set_ball_dir(dir.x, dir.y);
		});

		game_socket.socket.on("update_status", (s) => {
			side = s;
			if (s === "obs")
				setState("observer");
			else {
				setState("player");
			}
		});

		game_socket.socket.on("update_paddle", (s, paddle_pos, paddle_dir) => {
			if (s === "right") {
				board.set_right_dir(paddle_dir.x, paddle_dir.y);
				board.set_right_pos(paddle_pos.x, paddle_pos.y);
			} else if (s === "left") {
				board.set_left_dir(paddle_dir.x, paddle_dir.y);
				board.set_left_pos(paddle_pos.x, paddle_pos.y);
			} else if (side === "obs") {
				if (s === "left") {
					board.set_left_dir(paddle_dir.x, paddle_dir.y);
					board.set_left_pos(paddle_pos.x, paddle_pos.y);
				} else if (s === "right") {
					board.set_right_dir(paddle_dir.x, paddle_dir.y);
					board.set_right_pos(paddle_pos.x, paddle_pos.y);
				}
			}
		});

		game_socket.socket.on("update_hard_paddle", (s, paddle_pos, paddle_dir) => {
			if (s === "right") {
				board.set_right_dir(paddle_dir.x, paddle_dir.y);
				board.set_right_pos(paddle_pos.x, paddle_pos.y);
			} else if (s === "left") {
				board.set_left_dir(paddle_dir.x, paddle_dir.y);
				board.set_left_pos(paddle_pos.x, paddle_pos.y);
			}
		});

		if (canvasRef.current) {
			let canvas = canvasRef.current;
			const ctx = canvas?.getContext("2d");
			canvas.width = 1000;
			canvas.height = 500;
			if (props.invitation && code) {
				const decode = (str:string): string => Buffer.from(str, "base64").toString("binary");
				const obj = JSON.parse(decode(code));
				if (obj.speedball)
					GAME_SETTINGS.add_modifier("accelerate_ball", 2);
				if (obj.paddleshrink)
					GAME_SETTINGS.add_modifier("reduce", 2);
				GAME_SETTINGS.ratio = ((canvas.width / BASE_WIDTH));
				board.set_ctx(ctx, GAME_SETTINGS.ratio)
				game_socket.socket.emit("invite", obj);
			} else {
				GAME_SETTINGS.ratio = ((canvas.width / BASE_WIDTH));
				board.set_ctx(ctx, GAME_SETTINGS.ratio)
			}
		}

		return () => {
			if (game_interval != null)
				clearInterval(game_interval);
			game_interval = null;
			game_socket.socket.emit("quit");
			game_socket.socket.emit("observe_quit");

			game_socket.socket.off("room_player_joined");
			game_socket.socket.off("room_observer_joined");
			game_socket.socket.off("room_setting");
			game_socket.socket.off("start_game");
			game_socket.socket.off("reset_game");
			game_socket.socket.off("end_game");
			game_socket.socket.off("update_score");
			game_socket.socket.off("update_ball");
			game_socket.socket.off("update_status");
			game_socket.socket.off("update_paddle");
			game_socket.socket.off("update_hard_paddle");
		}

	}, []);

	return (
		<main>
			<section id="gameSection">
				<div>
					<div id="gameScore">
						<div id="playerLeft">
							<span id="playerLeftName">
								{leftplayer}
							</span>
							<span id="playerLeftScore">
								{left}
							</span>
						</div>
						<span id="vs">vs</span>
						<div id="playerRight">
							<span id="playerRightScore">
								{right}
							</span>
							<span id="playerRightName">
								{rightplayer}
							</span>
						</div>
					</div>
				</div>
				<canvas ref={canvasRef} id="game"></canvas>
				{ state === "" &&
				<div id="btnCtrl">
					<Button id="game-button-start" value="Start" fontSize={1.2} onClick={() => { game_socket.socket.emit("join_room")}} />
					<div id="obs">
						<div id="obsButton" onClick={() => {game_socket.socket.emit("observe_room", obsname);}} >Observe</div>
						<input id="obsInput" onChange={(event) => {setObsname(event.target.value)}} />
					</div>
				</div>}
				{ state === "player" &&
				<div id="btnCtrl">
					<Button id="game-button-resign" value="Resign" fontSize={1.2} onClick={() => { game_socket.socket.emit("quit")}} />
				</div>}
				{ state === "observer" &&
				<div id="btnCtrl">
					<Button id="game-button-resign" value="Exit" fontSize={1.2} onClick={() => { game_socket.socket.emit("observe_quit")}} />
				</div>}
				{ end && winner === "left" && <div id="game-end-screen">{leftplayer} Won!</div>}
				{ end && winner === "right" && <div id="game-end-screen">{rightplayer} Won!</div>}
			</section>
		</main>
	);

}
