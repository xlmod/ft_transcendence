import {useEffect, useState} from "react";
import {Navigate} from "react-router";
import {Buffer} from "buffer";

import {Button} from "../utils/button";

import './gameinvite.css'
import {game_socket} from "../../socket";

interface IProps {
	pseudo: string,
	obj: any,
	close: (code: string) => void,
}

export function Gameinvitation(props: IProps) {

	const [code, setCode] = useState<string>("");

	const onInviteAccept = () => {
		let obj = {uid: props.obj.uid, speedball:props.obj.speedball, paddleshrink:props.obj.paddleshrink, join:true};
		game_socket.socket.emit("invite_join", obj);
		console.log("ACCEPT");
		props.close("move");
	};

	const onInviteDecline = () => {
		game_socket.socket.emit("invite_decline", props.obj);
		props.close("");
	};

	return (
		<section id="gameinvite-section">
			<div id="gameinvite-wall">
			</div>
			<div id="gameinvite-window">
				<span id="gameinvite-title">{props.pseudo} invitation!</span>
				<div id="gameinvite-input">
				</div>
				<div id="gameinvite-button">
					<Button id="gameinvite-button-cancel" value="decline" fontSize={0.8} onClick={onInviteDecline} />
					<Button id="gameinvite-button-save" value="accept" fontSize={0.8} onClick={onInviteAccept} />
				</div>
			</div>
		</section>
	);

}
