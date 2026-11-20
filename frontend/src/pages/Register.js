import {useState} from 'react'
import api from '../services/api'


function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    function handleRegister(event) {
        event.preventDefault()

        api.post('register/', {
            username: username,
            password: password
        })
            .then(function (response) {
                setSuccess('Your account has been created successfully. You can now log in.')
                setError('')
                setUsername('')
                setPassword('')
            })
            .catch(function (error) {
                setError('Unable to create your account. The username may already be taken or the password may be too short.')
                setSuccess('')
                console.log(error)
            })
    }

    let errorMessage = null
    let successMessage = null

    if (error !== '') {
        errorMessage = <p>{error}</p>
    }

    if (success !== '') {
        successMessage = <p>{success}</p>
    }

    return (
        <div>
            <h1>Create an Account</h1>
            {errorMessage}
            {successMessage}
            <form onSubmit={handleRegister}>
                <div>
                    <label>Username</label>
                    <input type="text" name="username" value={username} onChange={function (event) {
                        setUsername(event.target.value)
                    }} required/>
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" name="password" value={password} onChange={function (event) {
                        setPassword(event.target.value)
                    }} required/>
                </div>
                <button type="submit">
                    Register
                </button>
            </form>
            <p>Already have an account?
                <a href="/login"> Login here</a>
            </p>
        </div>
    )
}

export default Register
