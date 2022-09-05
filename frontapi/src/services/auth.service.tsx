import axios from "axios";
import React, { Component, useContext, PropsWithChildren } from "react";
import { Navigate } from 'react-router-dom';
import { game_socket } from '../socket';

export interface AuthState {
	userData?: any,
	isLoading: boolean,
	isLoggedIn : boolean,
	checkLogin : any,
	logout : any
}

export const AuthContext:any = React.createContext<AuthState|null>(null);
export const useAuth: any = () => useContext(AuthContext);

const API_URL = "http://localhost:3333/";
export class AuthProvider extends Component<PropsWithChildren, AuthState> {
	constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            isLoggedIn: false,
            userData: null,
			checkLogin : this.checkLogin,
			logout : this.logout
        };
    }

	checkLogin = () => {
		return axios
			.get(API_URL + "user/me", {withCredentials: true})
			.then((response) => {
					return {
						userData: response.data,
						isLoggedIn : true
					};
			})
			.catch((err) => {
				return {
					userData: null,
					isLoggedIn : false
				};
			});
	};
	logout = async () => {
		this.setState({isLoading:true});
		await axios.get( API_URL + 'auth/logout', { withCredentials: true } );
		this.setState({
			userData: null,
			isLoggedIn : false
		});
		game_socket.socket.disconnect();	
		this.setState({isLoading:true});
		window.history.replaceState({}, document.title, "/signin");
		this.setState({isLoading:false});
	}
    componentDidMount() {
        this.initializeAuth();     
    }
    // initialize the auth0 library
    initializeAuth = async () => {
        const authState = await this.checkLogin();
        this.setState( authState );
        // check to see if they have been redirected after login
        if (!authState.isLoggedIn) {
			this.setState({isLoading:true});

            window.history.replaceState({}, document.title, "/signin");

			this.setState({isLoading:false});
        }
        this.setState({ isLoading: false });
    };
    
    render() {
		const { checkLogin, logout, isLoading, isLoggedIn, userData } = this.state;
        const { children } = this.props;
        const configObject = {
            isLoading,
            isLoggedIn,
            userData,
            checkLogin: checkLogin,
            logout: logout
        };
        return (<AuthContext.Provider value={configObject}>{children}</AuthContext.Provider>);
    }
}
interface IRequireAuth {
	cmp : JSX.Element
}

export function RequireAuth(props:IRequireAuth) {
	const {isLoggedIn, isLoading} = useAuth();
	if (isLoading)
		return (<div id="loader"></div>);
	else if (!isLoading && !isLoggedIn)
		return (<Navigate to="/signin" />);
	else
		return (props.cmp);
}