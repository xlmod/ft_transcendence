import CSS from 'csstype';

import './textinput.css';

interface IProps {
	id?: string,
	placeholder?: string,
	onChange?: (event:any) => void,
	value?: string,
	style?: CSS.Properties,
	error?: boolean,
	tooltiperror?: string,
}

export function Textinput(props: IProps) {

	return(
		<input
			id={props.id}
			className={props.error ? "generic-textinput-error" : "generic-textinput"}
			onChange={props.onChange}
			style={props.style}
			placeholder={props.placeholder}
			value={props.value}
			type="text"
		/>
	);
}
