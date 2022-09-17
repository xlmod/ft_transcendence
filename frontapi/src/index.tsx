import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app'
import { AuthProvider } from './services/auth.service';


const root = ReactDOM.createRoot( document.getElementById( "root" )! );
root.render(
	<AuthProvider>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</AuthProvider>
);
