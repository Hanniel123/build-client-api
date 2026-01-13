import createInstance from "./createInstance";
import { type AxiosInstance } from "axios";
import { Endpoint, RequestConfig, RequestType, type Endpoints } from "./types";
import { DEBUG } from "./config";
import { Debug } from "./debug";

type GetFieldType = {
    (
        data: Object
    ): string
}

type NoAuthConfigType = {
    message: string,
    getField: GetFieldType
}

const defaultRequestConfig: RequestConfig = {
    // secure: false,
    urlSuffix: '',
    params: {},
    method: 'post',
    extras: {}
}

class BuildClientAPI {
    #apiInstance: AxiosInstance | null = null;
    #refreshEndpoint: string = "";
    #noAuthConfig: NoAuthConfigType = {
        message: "No auth",
        getField: (data: Object)=>{
            return data.details[0];
        }
    }
    #endpoints: undefined | Endpoints = undefined;

    constructor(origin="", noAuthConfig: NoAuthConfigType | null) {
        this.#apiInstance = createInstance(origin, 15);
        if (noAuthConfig)
            this.#noAuthConfig = noAuthConfig;
        
        // Auth interceptors
        this.#apiInstance.interceptors.response.use(res=>res, async err=> {
            if (err.response?.status === 401 && this.#noAuthConfig.getField(err.response?.data) === this.#noAuthConfig.message) {
                const refresh = localStorage.getItem('refresh');
                const r = await this.#apiInstance?.post(this.#refreshEndpoint, {refresh});
                localStorage.setItem('access', r?.data. access);
                return this.#apiInstance(err.config);
                // this.#apiInstance = this.#apiInstance(err.config);
            }
            return Promise.reject(err);
        })
    }

    load(endpoints: Endpoints) {
        this.#endpoints = endpoints;
    }

    async request(endpoint: string, data: any, config: RequestConfig={
        ...defaultRequestConfig
    }): Promise<any> {

        // Check if endpoints are defined
        if (!this.#endpoints) {
            Debug.warn("[Build API]: endpoints are undefined");
            return;
        }

        // Check endpoint validity
        if (!this.#endpoints?.[endpoint]) {
            Debug.error(`[Build API]: Endpoint ${endpoint} not found`);
            return;
        }

        // Send request
        const endpointObj = this.#endpoints?.[endpoint];
        let requestType = endpointObj[config.method];
        
        if (requestType) {
            return this.#send(endpointObj, requestType, data, config);
        }
    }

    #refresh(newHandler: Function, req: RequestType, extras: any) {
        const refresh = localStorage.getItem('refresh');

        this.#apiInstance?.post(this.#refreshEndpoint, {
            refresh
        }, {})
        .then((response)=>{
            localStorage.setItem('access', response.data.access);
            newHandler();
        })
        .catch((error)=>{
            if (error.response) {
                const data = error.response.data;
                const status = error.response.status;

                // Call main error handler
                req.onFailure.error?.(data, status, extras);

                // Call status error handler
                const handler = req.onFailure[status];
                handler?.(data, extras);
            } else {
                // Call network error
                req.onFailure.network?.(extras);
            }
        })
        .finally(()=>{
            
        })
    }

    #send(endpoint: Endpoint, req: RequestType, data: any, config: RequestConfig) {
        // const access = localStorage.getItem('access');

        // Authorization headers
        // const headers = config.secure ? {
        //     Authorization: `Bearer ${access}`
        // }: {};
        
        // Format url
        let completeURL = endpoint.path + config.urlSuffix;
        const paramsLength = Object.keys(config.params).length;
        if (paramsLength > 0)
            completeURL += '?'
        Object.keys(config.params).map((key, index)=>{
            completeURL += index === 0 ? `${key}=${config.params[key]}`: `&${key}=${config.params[key]}`;
        })

        const refreshHandler = ()=>{
            this.#send(endpoint, req, data, config);
        }

        // Request
        return this.#apiInstance?.request({method: config.method, url: completeURL, data})
        .then((response)=>{
            req.onResponse(response.data, config.extras);
        })
        .catch((error)=>{
            if (error.response) {
                const data = error.response.data;
                const status = error.response.status;
                // if (status === 401 && this.#noAuthConfig.getField(data) === this.#noAuthConfig.message) {
                //     this.#refresh(refreshHandler, req, config.extras);
                //     return;
                // }

                // Call main error handler
                req.onFailure.error?.(data, status, config.extras);

                // Call status error handler
                const handler = req.onFailure[status];
                if (handler)
                    handler(data, config.extras);

            } else {
                // Call network error handler
                req.onFailure.network?.(config.extras);
            }
        })
    }
}

export default BuildClientAPI;
