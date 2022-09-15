import {iaxios} from "../utils/axios";
import React, { Component, useContext, PropsWithChildren } from "react";
import {  Navigate } from 'react-router-dom';
import { game_socket } from '../socket';
import { getTFAAuth, postTFACode } from "../components/utils/requester";

export interface AuthState {
	userData?: any,
	isLoading: boolean,
    isTFA: boolean,
	isLoggedIn : boolean,
    pseudo: string,
    code: string,
    obj: any,
	checkLogin : any,
	waitPostTFACode: any,
	logout : any
}

export const AuthContext:any = React.createContext<AuthState|null>(null);
export const useAuth: any = () => useContext(AuthContext);

export class AuthProvider extends Component<PropsWithChildren, AuthState> {
	constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            isLoggedIn: false,
            isTFA: false,
            userData: null,
            pseudo: "",
            code: "",
            obj: {},
			checkLogin : this.initializeAuth,
			waitPostTFACode: this.waitPostTFACode,
			logout : this.logout
        };
		this.removeInvite = this.removeInvite.bind(this);
    }

	checkLogin = () => {
		return iaxios
			.get("user/me", {withCredentials: true})
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
		await iaxios.get('auth/logout', { withCredentials: true } );
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
        game_socket.socket.on("invitation", (pseudo, obj) => { 
			this.setState({pseudo: pseudo, obj: obj});
		});
    }
	componentWillUnmount(){
		game_socket.socket.off("invitation");
	}

    // initialize the auth0 library
    initializeAuth = async () => {
        const authState = await this.checkLogin();
        const tfa = await getTFAAuth();
        this.setState( authState );
        this.setState({isTFA:tfa});
        // check to see if they have been redirected after login
        if (!authState.isLoggedIn && !tfa) {
			this.setState({isLoading:true});

            window.history.replaceState({}, document.title, "/signin");
        }
        else if (tfa)
        {
            this.setState({isLoading:true});

            window.history.replaceState({}, document.title, "/tfa");
        }
        this.setState({ isLoading: false });
    };
    removeInvite = (code: string) => {
		if (code !== "")
			this.setState({code: code});
		this.setState({pseudo: ""});
	};
    

	waitTFAAuth = async() => {
		const _connected :boolean = await getTFAAuth();
		this.setState( {isTFA : _connected} );
	};

	waitPostTFACode = async( _code :string ) => {
		const _auth :boolean = await postTFACode( _code );
		this.setState( {isTFA : !_auth, isLoggedIn: _auth} );
	};

    render() {
		const { checkLogin, waitPostTFACode, logout, isLoading, isLoggedIn, userData, isTFA } = this.state;
        const { children } = this.props;
        const configObject = {
            isLoading,
            isLoggedIn,
            waitPostTFACode,
            userData,
			isTFA,
            checkLogin: checkLogin,
            logout: logout
        };
        if (this.state.code != "") {
			let tmpCode = this.state.code;
			this.setState({code: ""});
			return (<Navigate to={"/game/" + tmpCode} />);
		}
        return (<AuthContext.Provider value={configObject}>{children}</AuthContext.Provider>);
    }
}
interface IRequireAuth {
	cmp : JSX.Element
}

export function RequireAuth(props:IRequireAuth) {
	const {isLoggedIn, isLoading, isTFA} = useAuth();
	if (isLoading)
		return (<div id="loader"></div>);
	else if (isTFA)
		return (<Navigate to="/tfa" />);
	else if (!isLoading && !isLoggedIn && !isTFA)
		return (<Navigate to="/signin" />);
	else
		return (props.cmp);
}