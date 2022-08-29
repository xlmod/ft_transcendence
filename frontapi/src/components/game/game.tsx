import { useContext } from 'react';
import { GameCanvas } from './gameCanvas';
import { AuthContext } from '../../services/auth.service';


export function Game()
:  JSX.Element
{
	const {checkLogin} = useContext(AuthContext);
	checkLogin();

	return (
		<main>
			<GameCanvas />
		</main>
	);
}
