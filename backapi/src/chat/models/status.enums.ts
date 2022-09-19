export type bantime = { uuid: string, since: Date, until: Date }; 

export enum UserStatus {
	online = 'online',
	offline = 'offline',
	gaming = 'gaming',
}

export enum ChannelState {
	public = 'public',
	protected = 'protected',
	private = 'private',
	procated = 'procated',
	dm = 'dm'
}
