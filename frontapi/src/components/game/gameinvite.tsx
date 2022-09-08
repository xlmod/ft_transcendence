import {useEffect, useState} from "react";
import {Navigate} from "react-router";
import {Buffer} from "buffer";

import {Button} from "../utils/button";
import {ToggleSwitch} from "../utils/toggleswitch";

import './gameinvite.css'

interface IProps {
	pseudo: string,
	close: (update: boolean) => void,
}

export function Gameinvite(props: IProps) {

	const [speedball, setSpeedball] = useState<boolean>(false);
	const [paddleshrink, setPaddleshrink] = useState<boolean>(false);
	const [code, setCode] = useState<string>("");


	const speedballChange = (event: any) => {
		setSpeedball(event.target.checked);
	};

	const paddleshrinkChange = (event: any) => {
		setPaddleshrink(event.target.checked);
	};

	const onInvite = () => {
		const encode = (str:string): string => Buffer.from(str, "binary").toString("base64");
		let obj = {uid: props.pseudo, speedball:speedball, paddleshrink:paddleshrink, join:false};
		setCode(encode(JSON.stringify(obj)));
	};

	if (code !== "")
		return (<Navigate to={"/game/" + code} />);
	return (
		<section id="gameinvite-section">
			<div id="gameinvite-wall">
			</div>
			<div id="gameinvite-window">
				<span id="gameinvite-title">game options</span>
				<div id="gameinvite-input">
					<label>
					<span className="gameinvite-input-toggle-label">speed ball</span>
						<ToggleSwitch
							checked={false}
							onChange={speedballChange}
						/>
					</label>
					<label>
					<span className="gameinvite-input-toggle-label">paddle shrink</span>
						<ToggleSwitch
							checked={false}
							onChange={paddleshrinkChange}
						/>
					</label>
				</div>
				<div id="gameinvite-button">
					<Button id="gameinvite-button-cancel" value="cancel" fontSize={0.8} onClick={() => {props.close(false)}} />
					<Button id="gameinvite-button-save" value="invite" fontSize={0.8} onClick={onInvite} />
				</div>
			</div>
		</section>
	);

}
