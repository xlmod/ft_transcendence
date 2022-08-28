import React, { useContext } from "react";

import axios from "axios";
import {Navigate} from 'react-router-dom';

const API_URL = "http://localhost:3333/";

export interface AuthState {
	userData : {},
	isLoggedIn : boolean,
	checkLogin : any
}

export const AuthContext = React.createContext<AuthState>({} as AuthState);

// export const useLogin = () => {
// 	const currentUserState = useContext(AuthContext);
//   return axios
//     .get(API_URL + "user/me", {withCredentials: true})
//     .then((response) => {
// 		console.log(response.data);
//       return true;
//     })
// 	.catch((err) => {
// 		console.log(err);
// 		currentUserState.isLoggedIn = false;
// 		currentUserState.userData = {};
// 		return false;
// 	});
// };

// export const useLogout = () => {
// 	const currentUserState = useContext(AuthContext);
// 	currentUserState.isLoggedIn = false;
// 	currentUserState.userData = {};
// };
