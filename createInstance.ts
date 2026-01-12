import axios from "axios";

function createInstance(baseURL: string, timeout=12) {
    const instance = axios.create({
        baseURL,
        timeout: timeout * 1000
    })
    instance.interceptors.request.use(config=>{
        const access = localStorage.getItem('access');

        if (access) {
            config.headers.Authorization = `Bearer ${access}`;
        }
        return config;
    })
    return instance;
}

export default createInstance
