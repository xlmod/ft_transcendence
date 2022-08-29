import React from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../services/auth.service';
import axios from 'axios';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';

import './user.css';

const API_URL = "http://localhost:3333/";

interface IProps {
	
}

interface IState {
	user: any
}

/*
function Check()
{
	const { checkLogin } = useContext( AuthContext );
	checkLogin();
}
*/

export class User extends React.Component< IProps, IState >
{
	constructor(props: IProps)
	{
		super(props);
		this.state = {
			user: []
		};
		this.getData();
	};

	getData = () => {
//		Check();
		return axios
			.get( API_URL + 'user/me', { withCredentials: true } )
			.then( data => {
				this.setState({
					user: data.data
				});
				console.log( data.data );
				return true;
			})
			.catch( ( error ) => {
				return false;
			});
	};

	render() {
		return (
			<main>
				<section id="userSection">
					<div id="me">
						<h1>ID</h1>
						<img src ={ this.state.user.avatar }/>
						<p>
							<span>First__</span>
							<span>{ this.state.user.firstName }</span>
						</p>
						<p>
							<span>Last__</span>
							<span>{ this.state.user.lastName }</span>
						</p>
						<p>
							<span>Pseudo__</span>
							<span>{ this.state.user.pseudo }</span>
						</p>
						<p>
							<span>Points__</span>
							<span id="points">42</span>
						</p>
					</div>
				</section>
			</main>
		);
	}
}
