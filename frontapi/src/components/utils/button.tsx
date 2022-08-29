import { useState } from 'react';
import CSS from 'csstype';
import '../../globals.css';

export function Button( name: string, size: number, action: any )
: JSX.Element
{
	let buttonStyles: CSS.Properties = {
		fontSize: size + "em",
		fontFamily: 'Skwar',
		cursor: 'pointer',
		border: '1px solid var( --cNeon )',
		borderRadius: '2px',
		padding: '0.5rem',
	};

	return(
		<button id={ name } className="genericButtons" onClick={ action } style={ buttonStyles }>
			{ name }
		</button>
	);
}
