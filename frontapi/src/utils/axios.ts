import axios from 'axios'

export const iaxios = axios.create({
	baseURL: 'http://localhost:3333/',
	withCredentials: true,
  });