import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import api from '../services/api'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const response = await api.post('token/', {
                username: username,
                password: password
            })

            localStorage.setItem('access', response.data.access)
            localStorage.setItem('refresh', response.data.refresh)

            api.get('user/')
                .then(function (userResponse) {
                    localStorage.setItem('username', userResponse.data.username)
                    localStorage.setItem('role', userResponse.data.role)
                    navigate('/')
                })
                .catch(function (error) {
                    console.log(error)
                    alert('Unable to retrieve your account details.')
                })

        } catch (error) {
            alert('Invalid username or password')
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit">
                    Login
                </button>
            </form>
        </div>
    )
}

export default Login
