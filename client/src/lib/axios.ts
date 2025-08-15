import axios from 'axios';


const api = axios.create({
    baseURL: process.env.API_URL || 'https://shophub.thebigphotocontest.com/api',
    withCredentials: true,
});


export default api;