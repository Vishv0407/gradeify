require('dotenv').config({ path: '../Backend/.env' });

export const frontend = '';
// export const backend = 'http://localhost:4000';
export const backend = process.env.BACKEND_URL;