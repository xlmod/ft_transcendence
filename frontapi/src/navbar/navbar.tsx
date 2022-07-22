import React from 'react';
import './navbar.css';

export function Navbar()
:  JSX.Element
{
	return (
		<div>
		<div id="navbarIcon">
			<div className="navbarIcon" id="iconGame">
				<svg height="50px" width="50px">
					<text x="12" y="10" font-size="0.7em">4</text>
					<text x="31" y="10" font-size="0.7em">2</text>
					<line x1="25" y1="0" x2="25" y2="50" />
					<rect x="3" y="30" width="3" height="16" />
					<rect x="46" y="15" width="3" height="16" />
					<circle cx="38" cy="26" r="2" />
				</svg>
			</div>

			<div className="navbarIcon" id="iconLeaderboard">
				<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
					width="50px" height="50px" viewBox="0 0 485 485">
					<g>
					<path d="M333.333,311.667V270h-78.372v-42.298c44.555-6.786,79.457-43.32,83.753-88.634C383.749,114.457,412.385,66.731,412.385,15
						V0H67.538v15c0,51.731,28.636,99.457,73.671,124.068c4.296,45.315,39.197,81.848,83.752,88.634V270h-73.294v83.333H0V485h485
						V311.667H333.333z M339.165,103.029V30h42.195C377.39,58.947,362.082,85.23,339.165,103.029z M98.563,30h42.195v73.029
						C117.84,85.23,102.533,58.947,98.563,30z M170.758,129.632V30h138.407v99.632c0,38.159-31.045,69.203-69.204,69.203
						S170.758,167.791,170.758,129.632z M303.333,300v155H181.667V300H303.333z M30,383.333h121.667V455H30V383.333z M455,455H333.333
						V341.667H455V455z"/>
					</g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g>
					</g><g></g><g></g><g></g><g></g>
				</svg>
			</div>

			<div className="navbarIcon" id="iconChat">
				<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
	 				width="50px" height="50px" viewBox="0 0 512 512">
					<g><g>
					<path d="M486.4,0H25.6C11.46,0,0,11.46,0,25.6v384c0,14.14,11.46,25.6,25.6,25.6h153.6L256,512l76.8-76.8h153.6
					c14.14,0,25.6-11.46,25.6-25.6v-384C512,11.46,500.54,0,486.4,0z M486.4,409.6H322.193L256,475.793L189.807,409.6H25.6v-384h460.8
					V409.6z"/>
					</g></g><g><g>
					<rect x="76.8" y="153.6" width="358.4" height="25.6"/>
					</g></g><g><g>
					<rect x="128" y="256" width="256" height="25.6"/>
					</g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g>
					</g><g></g><g></g><g></g><g></g>
				</svg>
			</div>

			<div className="navbarIcon" id="iconUser">
				<svg width="50px" height="50px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
					<g transform="translate( -50, -50 ) scale( 1.4 1.4 )">
					<path d="M208,36H48A12.01375,12.01375,0,0,0,36,48V208a12.01375,12.01375,0,0,0,12,12H198.20093l.01147.001.00879-.001H208a12.01375,12.01375,0,0,0,12-12V48A12.01375,12.01375,0,0,0,208,36ZM63.00146,212a68.00818,68.00818,0,0,1,129.99708,0ZM212,208a4.00458,4.00458,0,0,1-4,4h-6.66211a75.907,75.907,0,0,0-52.74878-53.13037,44,44,0,1,0-41.17822,0A75.907,75.907,0,0,0,54.66211,212H48a4.00458,4.00458,0,0,1-4-4V48a4.00458,4.00458,0,0,1,4-4H208a4.00458,4.00458,0,0,1,4,4Zm-84-52a36,36,0,1,1,36-36A36.04061,36.04061,0,0,1,128,156Z"/>
					</g>
				</svg>
			</div>
		</div>

		<div id="navbarText">
			<div id="buttonGame">Game</div>
			<div id="buttonLeaderboard">Leaderboard</div>
			<div id="buttonChat">Chat</div>
			<div id="buttonUser">User</div>
		</div>
		</div>
	);
}
