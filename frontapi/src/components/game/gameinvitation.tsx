import {useEffect, useState} from "react";
import {Navigate} from "react-router";
import {Buffer} from "buffer";

import {Button} from "../utils/button";
import {ToggleSwitch} from "../utils/toggleswitch";

import './gameinvite.css'
import {game_socket} from "../../socket";

interface IProps {
	pseudo: string,
	close: (update: boolean) => void,
}

export function Gameinvitation(props: IProps) {

	const [code, setCode] = useState<string>("");

	const onInvite = () => {
		props.close(true);
	};

	if (code !== "")
		return (<Navigate to={"/game"} />);
	return (
		<section id="gameinvite-section">
			<div id="gameinvite-wall">
			</div>
			<div id="gameinvite-window">
				<span id="gameinvite-title">{props.pseudo} invitation!</span>
				<div id="gameinvite-input">
				</div>
				<div id="gameinvite-button">
					<Button id="gameinvite-button-cancel" value="decline" fontSize={0.8} onClick={() => {props.close(false)}} />
					<Button id="gameinvite-button-save" value="accept" fontSize={0.8} onClick={onInvite} />
				</div>
			</div>
		</section>
	);

}
