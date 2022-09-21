import { useState } from 'react';

import { IUser, IChannel } from '../utils/requester';
import { Pseudo } from '../utils/pseudo';
import { Button } from '../utils/button';

import { chat_socket } from '../../socket';

interface IProps
{
	room :IChannel | null,
	member :IUser,
	me :IUser | undefined,
}

export function EntryMember( props :IProps )
{

const [isAdmin, setIsAdmin] = useState< boolean >( props.room?.admin.find(
												admin => admin === props.member.id ) ? true : false );
const [isBanned, setIsBanned] = useState< boolean >( props.room?.ban.find(
												ban => ban === props.member.id ) ? true : false );
const [isMuted, setIsMuted] = useState< boolean >( props.room?.mute.find(
												mute => mute === props.member.id ) ? true : false );

const adminChange = async(member:IUser) => {
        chat_socket.socket.emit("toggle-admin", {id:props.room?.id, uid: member.id}, (response: any) => {
			( response.err === false )
				? setIsAdmin ( !isAdmin )
				: console.log( response.data );
				
		});
        return ;
    };

    const banChange = async(member:IUser) => {
/*
        setTimeout(() => {
            props.room?.ban.filter(user=>user !== member.id)
        }, 10000);
*/  
      chat_socket.socket.emit("toggle-ban", {id:props.room?.id, uid: member.id}, (response: any) => {
			( response.err === false )
				? setIsBanned( !isBanned )
				: console.log( response );
		});
        return ;
    };

    const muteChange = async(member:IUser) => {
        chat_socket.socket.emit("toggle-mute", {id:props.room?.id, uid: member.id}, (response: any) => {
			( response.err === false )
				? setIsMuted( !isMuted )
				: console.log(response);
		});
        return ;
    };

	return (
		<div className="members">
			<div className="pseudo">{ props.member.pseudo }</div>
			<div className="controls">
				{ props.me?.id === props.room?.owner.id &&
				<Button className={`admin ${isAdmin
					? "selected" : "unselected" }`}
					value="adm" fontSize={0.8}
					onClick={()=>adminChange(props.member)} /> }
				<Button className={`ban ${isBanned
					? "unselected" : "selected" }`}
					value="ban" fontSize={0.8}
					onClick={()=>banChange(props.member)} />
				<Button className={`mute ${isMuted
					? "unselected" : "selected" }`}
					value="mut" fontSize={0.8}
					onClick={()=>muteChange(props.member)} />
			</div>
		</div>
	);
}
