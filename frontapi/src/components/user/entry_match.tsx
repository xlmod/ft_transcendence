import { IUser, IMatchHistory } from '../utils/requester';
import { Pseudo } from '../utils/pseudo';

interface IProps
{
	pseudoViewer :string,
	date :string,
	leftwin :boolean,
	lscore :number,
	rscore :number,
	luser :IUser,
	ruser :IUser,
}

export function EntryMatch( props :IProps )
{
	// const me :IUser = ( props.pseudoViewer === props?.luser?.pseudo ? props.luser : props.ruser );
	const him :IUser = ( props.pseudoViewer === props?.luser?.pseudo ? props.ruser : props.luser );
	const won :boolean = ( ( ( props.pseudoViewer === props?.luser?.pseudo && props.leftwin )
					|| ( props.pseudoViewer === props?.ruser?.pseudo && !props.leftwin ) )
					? true : false );
	const have :number = ( props.pseudoViewer === props?.luser?.pseudo ? props.lscore : props.rscore );
	const has :number = ( props.pseudoViewer === props?.luser?.pseudo ? props.rscore : props.lscore );
	const dateNew :string = new Date( props.date ).toLocaleDateString( 'fr-FR', {
								day: '2-digit',
								year: '2-digit',
								month: '2-digit',
								hour: '2-digit',
								minute: '2-digit', } );

	return (
		<tr>
			<td>
				<div className="pseudovs">
					<span className="VS">VS </span>
					<Pseudo pseudo={ him?.pseudo ? him.pseudo : "..." }
						pseudoClassName="pseudo-match" menuClassName="menu-match" />
				</div>
				<span className="stats">
					(<span className="victories">V{him?.win ? him.win : 4}</span>|
				<span className="defeats">D{him?.lose ? him.lose : 2}</span>|<span className="elo">E{him?.elo ? him.elo : 42}</span>)
				</span>
			</td>
			<td>
				<span className={ won ? "won" : "lost" }>
					{ ( won ? "won " : "lost " ) }
				</span>
				<span>{ have + "-" + has }</span>
			</td>
			<td>
				{ dateNew }
			</td>
		</tr>
	);
}
