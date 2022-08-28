import { useContext } from 'react';
import { AuthContext } from '../../services/auth.service';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';

export function Chat()
: JSX.Element
{
	const {checkLogin} = useContext(AuthContext);
	checkLogin();
	return (
		<main>
		</main>
	);
}
