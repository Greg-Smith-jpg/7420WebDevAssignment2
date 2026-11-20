
import axios from 'axios'

const api = axios.create({
    baseURL: 'https://piki-ora-medical-centre-144777.onrender.com/api/'
})

api.interceptors.request.use(function (config) {
    const accessToken = localStorage.getItem('access')

    if (accessToken !== null) {
        config.headers.Authorization = 'Bearer ' + accessToken
    }

    return config
})

api.interceptors.response.use(
    function (response) {
        return response
    },
    async function (error) {
        const originalRequest = error.config

        if (error.response.status === 401 && originalRequest._retry !== true) {
            originalRequest._retry = true

            const refreshToken = localStorage.getItem('refresh')

            if (refreshToken !== null) {
                try {
                    const response = await axios.post('https://piki-ora-medical-centre-144777.onrender.com/api/token/refresh/',
                        {
                            refresh: refreshToken
                        }
                    )

                    const newAccessToken = response.data.access

                    localStorage.setItem('access', newAccessToken)

                    originalRequest.headers.Authorization = 'Bearer ' + newAccessToken

                    return api(originalRequest)
                } catch (refreshError) {
                    localStorage.removeItem('access')
                    localStorage.removeItem('refresh')

                    window.location.href = '/login'
                }
            }
        }

        return Promise.reject(error)
    }
)

export default api
