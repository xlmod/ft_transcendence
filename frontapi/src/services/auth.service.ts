import React from "react";

export interface AuthState {
	userData : {},
	isLoggedIn : boolean,
	checkLogin : any,
	logout : any
}

export const AuthContext = React.createContext<AuthState>({} as AuthState);