const api = {

    login: {
        url: 'auth/login/',
        post: {
            onResponse: {
                // Main response handler
                data: (data, extras={})=>{
                },
            },
            onFailure: {
    
                // Main error handler
                error: (data, code, extras={})=>{
                },
    
                // Code handler
                400: (data, extras={})=>{
                },
    
                // Network error
                network: (extras={})=> {
                }
            }
        }
    },

}

export default api;