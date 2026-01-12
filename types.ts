/**
 * 
 */
type GlobalResponseHandler = {
    (
        data: any,
        extras: any
    ): void
}

type ErrorHandler = {
    (
        data: any,
        code: number,
        extras: any
    ): void
}

type NetworkErrorHandler = {
    (
        extras: any
    ): void
}

type CodeErrorHandler = {
    (
        data: any,
        extras: any
    ): void
}



type RequestType<P = any, R = any> = {
    onResponse: (data: R, extras: any)=> void,
    onFailure: {
        error: undefined | ErrorHandler,
        [key:number]: undefined | CodeErrorHandler,
        network: undefined | NetworkErrorHandler
    }
}

type Endpoint = {
    path: string,
    post: undefined | RequestType,
    put: undefined | RequestType,
    get: undefined | RequestType,
    patch: undefined | RequestType
}

type Endpoints = {
    [key:string]: Endpoint
}

type RequestConfig = {
    method: 'post' | 'get' | 'put' | 'patch',
    // secure: boolean,
    urlSuffix: string,
    params: {
        [key:string]: any
    },
    extras: any
}

export {
    Endpoint,
    RequestType,
    CodeErrorHandler,
    NetworkErrorHandler,
    ErrorHandler,
    GlobalResponseHandler,
    RequestConfig,
    Endpoints
}
