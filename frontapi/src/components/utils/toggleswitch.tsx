import {useEffect, useRef} from 'react';
import CSS from 'csstype';

import './toggleswitch.css';

interface IProps {
	id?: string,
	onChange: (event:any) => void,
	style?: CSS.Properties,
	error?: boolean,
	checked: boolean
}

export function ToggleSwitch(props: IProps) {

	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (inputRef.current) {
			if (props.checked) {
				inputRef.current.click();
			}
		}
	}, []);

	return(
		<label className="generic-toggleswitch" id={props.id}>
			<input ref={inputRef} onChange={props.onChange} style={props.style} type="checkbox"/>
			<span className="generic-toggleswitch-slider"></span>
		</label>
	);
}
