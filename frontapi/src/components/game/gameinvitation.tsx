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

	const onInvite = () => {
		const encode = (str:string): string => Buffer.from(str, "binary").toString("base64");
		let obj = {uid: props.obj.uid, speedball:props.obj.speedball, paddleshrink:props.obj.paddleshrink, join:true};
		props.close(encode(JSON.stringify(obj)));
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
					<Button id="gameinvite-button-cancel" value="decline" fontSize={0.8} onClick={() => {game_socket.socket.emit("invite_decline", props.obj) ;props.close("")}} />
					<Button id="gameinvite-button-save" value="accept" fontSize={0.8} onClick={onInvite} />
				</div>
			</div>
		</section>
	);

}
