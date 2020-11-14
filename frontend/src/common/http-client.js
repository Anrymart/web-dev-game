import axios from 'axios'

const config = (process.env.NODE_ENV === "development") ? {
    baseURL: `http://localhost:8080/api`,
    headers: {
        'Access-Control-Allow-Origin': 'http://localhost:8080',
        'Access-Control-Allow-Methods': 'POST,GET',
        'Access-Control-Allow-Headers': '*'
    }
} : {
    baseURL: `/api`
};

export const AXIOS = axios.create(config)
