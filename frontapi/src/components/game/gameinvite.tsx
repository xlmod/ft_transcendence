import {useState} from "react";
import {Button} from "../utils/button";
import {ToggleSwitch} from "../utils/toggleswitch";

import './gameinvite.css'

interface IProps {
	close: (update: boolean) => void,
}

export function Gameinvite(props: IProps) {

	const [speedball, setSpeedball] = useState<boolean>(false);
	const [paddleshrink, setPaddleshrink] = useState<boolean>(false);

	const speedballChange = (event: any) => {
		setSpeedball(event.target.checked);
	};

	const paddleshrinkChange = (event: any) => {
		setPaddleshrink(event.target.checked);
	};

	const onInvite = async () => {
		// send to game_scocket
		props.close(true);
	};

	return (
		<section id="gameinvite-section">
			<div id="gameinvite-wall">
			</div>
			<div id="gameinvite-window">
				<div id="gameinvite-input">
					<label>
					<span className="gameinvite-input-toggle-label">speedball</span>
						<ToggleSwitch
							checked={false}
							onChange={speedballChange}
						/>
					</label>
					<label>
					<span className="gameinvite-input-toggle-label">paddleshrink</span>
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
