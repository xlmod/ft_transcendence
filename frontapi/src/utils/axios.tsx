import axios from 'axios'
import { HOST, PORT } from "./env";

export const iaxios = axios.create({
	baseURL: `http://${HOST}:${PORT}/`,
	withCredentials: true,
  });
