
import {useEffect, useState, Fragment} from 'react'
import api from '../services/api'

function AdminDashboard() {
    const [users, setUsers] = useState([])
    const [error, setError] = useState('')
    const [doctors, setDoctors] = useState([])
    const [slots, setSlots] = useState([])

    const [doctorName, setDoctorName] = useState('')
    const [doctorSpeciality, setDoctorSpeciality] = useState('')
    const [doctorEmail, setDoctorEmail] = useState('')
    const [doctorPhone, setDoctorPhone] = useState('')
    const [doctorDescription, setDoctorDescription] = useState('')
    const [doctorUsername, setDoctorUsername] = useState('')
    const [doctorPassword, setDoctorPassword] = useState('')

    const [showAddDoctorForm, setShowAddDoctorForm] = useState(false)
    const [editingDoctorId, setEditingDoctorId] = useState(null)

    const [viewingDoctorId, setViewingDoctorId] = useState(null)
    const [creatingSlotDoctorId, setCreatingSlotDoctorId] = useState(null)

    const [slotDate, setSlotDate] = useState('')
    const [slotTime, setSlotTime] = useState('')

    function getUsers() {
        api.get('admin/users/')
            .then(function (response) {
                setUsers(response.data)
                setError('')
            })
            .catch(function (error) {
                setError('Unable to load users.')
                console.log(error)
            })
    }

    function getDoctors() {
        api.get('doctors/')
            .then(function (response) {
                setDoctors(response.data)
            })
            .catch(function (error) {
                setError('Unable to load doctors.')
                console.log(error)
            })
    }

    function getSlots() {
        api.get('slots/')
            .then(function (response) {
                setSlots(response.data)
            })
            .catch(function (error) {
                setError('Unable to load appointment slots.')
                console.log(error)
            })
    }

    useEffect(function () {
        getUsers()
        getDoctors()
        getSlots()
    }, [])

    function handlePatientStatus(userId, isActive) {
        api.patch('admin/patients/' + userId + '/status/', {
            is_active: !isActive
        })
            .then(function (response) {
                setUsers(function (previousUsers) {
                    const updatedUsers = previousUsers.map(function (user) {
                        if (user.id === userId) {
                            return {...user, is_active: response.data.is_active}
                        }

                        return user
                    })

                    return updatedUsers
                })

                setError('')
            })
            .catch(function (error) {
                setError('Unable to update patient status.')
                console.log(error)
            })
    }

    function handleShowAddDoctorForm() {
        setEditingDoctorId(null)

        setDoctorName('')
        setDoctorSpeciality('')
        setDoctorEmail('')
        setDoctorPhone('')
        setDoctorDescription('')
        setDoctorUsername('')
        setDoctorPassword('')

        setShowAddDoctorForm(true)
    }

    function handleCancelAddDoctor() {
        setShowAddDoctorForm(false)

        setDoctorName('')
        setDoctorSpeciality('')
        setDoctorEmail('')
        setDoctorPhone('')
        setDoctorDescription('')
        setDoctorUsername('')
        setDoctorPassword('')
    }

    function handleAddDoctor() {
        api.post('admin/doctors/add/', {
            name: doctorName,
            speciality: doctorSpeciality,
            email: doctorEmail,
            phone: doctorPhone,
            description: doctorDescription,
            username: doctorUsername,
            password: doctorPassword
        })
            .then(function (response) {
                alert('Doctor added successfully.')

                handleCancelAddDoctor()

                return api.get('doctors/')
            })
            .then(function (response) {
                setDoctors(response.data)
                setError('')
            })
            .catch(function (error) {
                setError('Unable to add doctor.')
                console.log(error)
            })
    }

    function handleEditDoctor(doctor) {
        setShowAddDoctorForm(false)

        setEditingDoctorId(doctor.id)
        setDoctorName(doctor.name)
        setDoctorSpeciality(doctor.speciality)
        setDoctorEmail(doctor.email)
        setDoctorPhone(doctor.phone)
        setDoctorDescription(doctor.description)
    }

    function handleCancelEdit() {
        setEditingDoctorId(null)

        setDoctorName('')
        setDoctorSpeciality('')
        setDoctorEmail('')
        setDoctorPhone('')
        setDoctorDescription('')
    }

    function handleUpdateDoctor() {
        api.patch('doctors/' + editingDoctorId + '/', {
            name: doctorName,
            speciality: doctorSpeciality,
            email: doctorEmail,
            phone: doctorPhone,
            description: doctorDescription
        })
            .then(function (response) {
                alert('Doctor updated successfully.')

                handleCancelEdit()

                return api.get('doctors/')
            })
            .then(function (response) {
                setDoctors(response.data)
                setError('')
            })
            .catch(function (error) {
                setError('Unable to update doctor.')
                console.log(error)
            })
    }

    function handleDeleteDoctor(doctorId) {
        const confirmDelete = window.confirm('Are you sure you want to delete this doctor?')

        if (confirmDelete === true) {
            api.delete('admin/doctors/' + doctorId + '/delete/')
                .then(function (response) {
                    alert('Doctor deleted successfully.')

                    return api.get('doctors/')
                })
                .then(function (response) {
                    setDoctors(response.data)
                    setError('')
                    getSlots()
                })
                .catch(function (error) {
                    setError('Unable to delete doctor.')
                    console.log(error)
                })
        }
    }

    function handleViewAppointments(doctorId) {
        if (viewingDoctorId === doctorId) {
            setViewingDoctorId(null)
        } else {
            setViewingDoctorId(doctorId)
            setCreatingSlotDoctorId(null)
        }
    }

    function handleShowCreateSlot(doctorId) {
        if (creatingSlotDoctorId === doctorId) {
            setCreatingSlotDoctorId(null)
            setSlotDate('')
            setSlotTime('')
        } else {
            setCreatingSlotDoctorId(doctorId)
            setViewingDoctorId(null)
            setSlotDate('')
            setSlotTime('')
        }
    }

    function handleAddSlot(doctorId) {
        api.post('admin/slots/add/', {
            doctor: doctorId,
            date: slotDate,
            time: slotTime,
            is_available: true
        })
            .then(function (response) {
                alert('Appointment slot added successfully.')

                setCreatingSlotDoctorId(null)
                setSlotDate('')
                setSlotTime('')

                return api.get('slots/')
            })
            .then(function (response) {
                setSlots(response.data)
                setError('')
            })
            .catch(function (error) {
                setError('Unable to add appointment slot.')
                console.log(error)
            })
    }

    function handleDeleteSlot(slotId) {
        const confirmDelete = window.confirm('Are you sure you want to delete this available appointment slot?')

        if (confirmDelete === true) {
            api.delete('admin/slots/' + slotId + '/delete/')
                .then(function (response) {
                    alert('Appointment slot deleted successfully.')

                    return api.get('slots/')
                })
                .then(function (response) {
                    setSlots(response.data)
                    setError('')
                })
                .catch(function (error) {
                    setError('Unable to delete appointment slot.')
                    console.log(error)
                })
        }
    }

    let errorMessage = null

    if (error !== '') {
        errorMessage = <p>{error}</p>
    }

    let addDoctorForm = null

    if (showAddDoctorForm === true) {
        addDoctorForm = (
            <form onSubmit={function (event) {
                event.preventDefault()
                handleAddDoctor()
            }}>
                <input type="text" value={doctorName} onChange={function (event) {
                    setDoctorName(event.target.value)
                }} placeholder="Doctor Name" required/>

                <input type="text" value={doctorSpeciality} onChange={function (event) {
                    setDoctorSpeciality(event.target.value)
                }} placeholder="Speciality" required/>

                <input type="email" value={doctorEmail} onChange={function (event) {
                    setDoctorEmail(event.target.value)
                }} placeholder="Email" required/>

                <input type="text" value={doctorPhone} onChange={function (event) {
                    setDoctorPhone(event.target.value)
                }} placeholder="Phone" required/>

                <textarea value={doctorDescription} onChange={function (event) {
                    setDoctorDescription(event.target.value)
                }} placeholder="Description"></textarea>

                <input type="text" value={doctorUsername} onChange={function (event) {
                    setDoctorUsername(event.target.value)
                }} placeholder="Username" required/>

                <input type="password" value={doctorPassword} onChange={function (event) {
                    setDoctorPassword(event.target.value)
                }} placeholder="Password (minimum 8 characters)" minLength="8" required/>

                <button type="submit">Add Doctor</button>

                <button type="button" onClick={handleCancelAddDoctor}>Cancel</button>
            </form>
        )
    }

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the Piki Ora Medical Centre Admin Dashboard.</p>

            {errorMessage}

            <h2>Manage Users</h2>

            <table>
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>

                {users.map(function (user) {
                    let buttonText = ''

                    if (user.is_active === true) {
                        buttonText = 'Disable'
                    } else {
                        buttonText = 'Enable'
                    }

                    let userStatus = ''

                    if (user.is_active === true) {
                        userStatus = 'Active'
                    } else {
                        userStatus = 'Disabled'
                    }

                    let patientAction = null

                    if (user.role === 'Patient') {
                        patientAction = (
                            <button type="button" onClick={function () {
                                handlePatientStatus(user.id, user.is_active)
                            }}>
                                {buttonText}
                            </button>
                        )
                    }

                    return (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{userStatus}</td>
                            <td>{patientAction}</td>
                        </tr>
                    )
                })}

                </tbody>
            </table>

            <h2>Manage Doctors</h2>

            <button type="button" onClick={handleShowAddDoctorForm}>
                Add New Doctor
            </button>

            {addDoctorForm}

            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Speciality</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {doctors.map(function (doctor) {
                    let editForm = null
                    let appointmentSection = null
                    let createSlotForm = null

                    if (editingDoctorId === doctor.id) {
                        editForm = (
                            <tr>
                                <td colSpan="5">
                                    <h3>Edit Doctor</h3>

                                    <form onSubmit={function (event) {
                                        event.preventDefault()
                                        handleUpdateDoctor()
                                    }}>
                                        <input type="text" value={doctorName} onChange={function (event) {
                                            setDoctorName(event.target.value)
                                        }} placeholder="Doctor Name" required/>

                                        <input type="text" value={doctorSpeciality} onChange={function (event) {
                                            setDoctorSpeciality(event.target.value)
                                        }} placeholder="Speciality" required/>

                                        <input type="email" value={doctorEmail} onChange={function (event) {
                                            setDoctorEmail(event.target.value)
                                        }} placeholder="Email" required/>

                                        <input type="text" value={doctorPhone} onChange={function (event) {
                                            setDoctorPhone(event.target.value)
                                        }} placeholder="Phone" required/>

                                        <textarea value={doctorDescription} onChange={function (event) {
                                            setDoctorDescription(event.target.value)
                                        }} placeholder="Description"></textarea>

                                        <button type="submit">Save Changes</button>

                                        <button type="button" onClick={handleCancelEdit}>
                                            Cancel
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        )
                    }

                    if (viewingDoctorId === doctor.id) {
                        const doctorSlots = slots.filter(function (slot) {
                            return String(slot.doctor) === String(doctor.id) && slot.is_available === true
                        })

                        appointmentSection = (
                            <tr>
                                <td colSpan="5">
                                    <h3>Available Appointments - {doctor.name}</h3>

                                    {doctorSlots.length === 0 && (
                                        <p>No available appointment slots for this doctor.</p>
                                    )}

                                    {doctorSlots.map(function (slot) {
                                        return (
                                            <div key={slot.id}>
                                                <p>Date: {slot.date}</p>
                                                <p>Time: {slot.time}</p>

                                                <button type="button" onClick={function () {
                                                    handleDeleteSlot(slot.id)
                                                }}>
                                                    Delete Appointment
                                                </button>
                                            </div>
                                        )
                                    })}
                                </td>
                            </tr>
                        )
                    }

                    if (creatingSlotDoctorId === doctor.id) {
                        createSlotForm = (
                            <tr>
                                <td colSpan="5">
                                    <h3>Create Appointment - {doctor.name}</h3>

                                    <form onSubmit={function (event) {
                                        event.preventDefault()
                                        handleAddSlot(doctor.id)
                                    }}>
                                        <input type="date" value={slotDate} onChange={function (event) {
                                            setSlotDate(event.target.value)
                                        }} required/>

                                        <input type="time" value={slotTime} onChange={function (event) {
                                            setSlotTime(event.target.value)
                                        }} required/>

                                        <button type="submit">Create Appointment</button>

                                        <button type="button" onClick={function () {
                                            setCreatingSlotDoctorId(null)
                                            setSlotDate('')
                                            setSlotTime('')
                                        }}>
                                            Cancel
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        )
                    }

                    return (
                        <Fragment key={doctor.id}>
                            <tr>
                                <td>{doctor.name}</td>
                                <td>{doctor.speciality}</td>
                                <td>{doctor.email}</td>
                                <td>{doctor.phone}</td>
                                <td>
                                    <button type="button" onClick={function () {
                                        handleViewAppointments(doctor.id)
                                    }}>
                                        View Appointments
                                    </button>

                                    <button type="button" onClick={function () {
                                        handleShowCreateSlot(doctor.id)
                                    }}>
                                        Create Appointment
                                    </button>

                                    <button type="button" onClick={function () {
                                        handleEditDoctor(doctor)
                                    }}>
                                        Edit Details
                                    </button>

                                    <button type="button" onClick={function () {
                                        handleDeleteDoctor(doctor.id)
                                    }}>
                                        Delete Doctor
                                    </button>
                                </td>
                            </tr>

                            {appointmentSection}
                            {createSlotForm}
                            {editForm}
                        </Fragment>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}

export default AdminDashboard
