import {BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MyAppointments from './pages/MyAppointments'
import Doctors from './pages/Doctors'
import AdminDashboard from './pages/AdminDashboard'
import {useEffect, useState} from 'react'
import api from './services/api'

import './App.css'


function Navigation() {
    const navigate = useNavigate()

    const accessToken = localStorage.getItem('access')
    let isLoggedIn = false
    let isAdmin = false

    const userRole = localStorage.getItem('role')

    if (userRole === 'Admin') {
        isAdmin = true
    }

    if (accessToken !== null) {
        isLoggedIn = true
    }

    function handleLogout() {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        navigate('/')
    }

    function handleHome() {
        if (isAdmin === true) {
            navigate('/admin')
        } else {
            navigate('/')
        }
    }

    function handleLogin() {
        navigate('/login')
    }

    function handleRegister() {
        navigate('/register')
    }

    function handleAppointments() {
        navigate('/appointments')
    }

    function handleDoctors() {
        navigate('/doctors')
    }

    let appointmentButtonText = ''

    if (localStorage.getItem('role') === 'Admin') {
        appointmentButtonText = 'All Appointments'
    } else {
        appointmentButtonText = 'My Appointments'
    }

    let navigationLinks

    if (isLoggedIn === true) {
        navigationLinks = (
            <>
                <button className="btn btn-outline-primary me-2" onClick={function () {navigate('/my-appointments')}}>{appointmentButtonText}</button>
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
            </>
        )
    } else {
        navigationLinks = (
            <>
                <button className="btn btn-outline-primary me-2" onClick={handleLogin}>Login</button>
                <button className="btn btn-outline-primary" onClick={handleRegister}>Register</button>
            </>
        )
    }

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container">
                <button className="btn btn-outline-primary me-2" onClick={handleHome}>Piki Ora Medical Centre</button>

                <div>
                    <button className="btn btn-outline-primary me-2" onClick={handleDoctors}>View Doctors</button>
                    <button className="btn btn-outline-primary me-2" onClick={handleHome}>Home</button>

                    {navigationLinks}
                </div>
            </div>
        </nav>
    )
}


function App() {
    return (
        <BrowserRouter>
            <div>
                <Navigation/>

                <main className="container mt-4">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/appointments" element={<MyAppointments/>}/>
                        <Route path="/my-appointments" element={<MyAppointments/>}/>
                        <Route path="/doctors" element={<Doctors/>}/>
                        <Route path="/admin" element={<AdminDashboard/>}/>
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}


export default App
