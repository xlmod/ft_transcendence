import { useState } from "react";
import {Navigate} from "react-router";

import { iaxios } from "../../utils/axios";
import { deleteUser } from '../utils/requester';
import {Button} from "../utils/button";

import './userdelete.css'

interface IProps
{
	close :( update :boolean ) => void,
}

export function Userdelete( props :IProps ) {

	const [connected, setConnected] = useState< boolean >( true );

	const waitDelete = async() => {
		await deleteUser();
		setConnected( false );
	}

	if( !connected )
		return( <Navigate to="/signin" /> );
	return (
		<section>
			<div id="userdelete-wall">
			</div>
			<div id="userdelete-window">
				<p>Are you super sure ?</p>
				<p>Your account will be</p>
				<p>permanently deleted.</p>
				<div id="userdelete-choices">
					<Button id="userdelete-cancel"
						value="cancel" fontSize={0.8} onClick={() => { props.close( false ); } } />
					<Button id="userdelete-delete"
						value="delete permanently" fontSize={0.8} onClick={ () => { waitDelete(); } } />
				</div>
			</div>
		</section>
	);
}
