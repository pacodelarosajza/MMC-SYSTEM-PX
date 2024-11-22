import io from 'socket.io-client';

const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
export const socket = io(`${apiIpAddress}`);
