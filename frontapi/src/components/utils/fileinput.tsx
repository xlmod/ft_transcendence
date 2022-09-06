import CSS from 'csstype';

import './fileinput.css';

interface IProps {
	id?: string,
	placeholder?: string,
	onChange?: (event:any) => void,
	style?: CSS.Properties,
	error?: boolean,
}

export function Fileinput(props: IProps) {

	return(
		<input
			id={props.id}
			className={props.error ? "generic-fileinput-error" : "generic-fileinput"}
			onChange={props.onChange}
			style={props.style}
			placeholder={props.placeholder != undefined ? props.placeholder : ""}
			type="file"
			accept="image/png, image/jpg, image/gif, image/jpeg"
		/>
	);
}
