import {useEffect, useState} from 'react'
import api from '../services/api'

export function formatAppointmentTime(time) {
    const appointmentDate = new Date('2000-01-01T' + time)

    const formattedTime = appointmentDate.toLocaleTimeString('en-NZ', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })

    return formattedTime
}

function MyAppointments() {
    const [appointments, setAppointments] = useState([])
    const [error, setError] = useState('')
    const [editingAppointmentId, setEditingAppointmentId] = useState(null)
    const [editedReason, setEditedReason] = useState('')


    useEffect(function () {
        function getAppointments() {
            const userRole = localStorage.getItem('role')

            let appointmentsUrl = 'appointments/'

            if (userRole === 'Admin') {
                appointmentsUrl = 'admin/appointments/'
            }

            api.get(appointmentsUrl)
                .then(function (response) {
                    let sortedAppointments = response.data

                    if (userRole === 'Admin') {
                        sortedAppointments = response.data.sort(function (appointmentA, appointmentB) {
                            const doctorA = appointmentA.appointment_slot_details.doctor.name
                            const doctorB = appointmentB.appointment_slot_details.doctor.name

                            return doctorA.localeCompare(doctorB)
                        })
                    }

                    setAppointments(sortedAppointments)
                    setError('')
                })
                .catch(function (error) {
                    setError('Unable to load appointments.')
                    console.log(error)
                })
        }

        getAppointments()
    }, [])

    function handleEditReason(appointment) {
        setEditingAppointmentId(appointment.id)
        setEditedReason(appointment.reason)
    }

    function handleCancelEdit() {
        setEditingAppointmentId(null)
        setEditedReason('')
    }

    function handleSaveReason(appointmentId) {
        const userRole = localStorage.getItem('role')

        let updateUrl = 'appointments/' + appointmentId + '/edit-reason/'

        if (userRole === 'Admin') {
            updateUrl = 'admin/appointments/' + appointmentId + '/update/'
        }

        api.patch(updateUrl, {
            reason: editedReason
        })
            .then(function (response) {
                setAppointments(function (previousAppointments) {
                    const updatedAppointments = previousAppointments.map(function (appointment) {
                        if (appointment.id === appointmentId) {
                            return {...appointment, reason: response.data.reason}
                        }

                        return appointment
                    })

                    return updatedAppointments
                })

                setEditingAppointmentId(null)
                setEditedReason('')
                setError('')
            })
            .catch(function (error) {
                setError('Unable to update the appointment reason.')
                console.log(error)
            })
    }

    function handleCancelAppointment(appointmentId) {
        const userRole = localStorage.getItem('role')

        let cancelUrl = 'appointments/' + appointmentId + '/cancel/'
        let appointmentsUrl = 'appointments/'

        if (userRole === 'Admin') {
            cancelUrl = 'admin/appointments/' + appointmentId + '/cancel/'
            appointmentsUrl = 'admin/appointments/'
        }

        api.patch(cancelUrl)
            .then(function () {
                return api.get(appointmentsUrl)
            })
            .then(function (response) {
                let sortedAppointments = response.data

                if (userRole === 'Admin') {
                    sortedAppointments = response.data.sort(function (appointmentA, appointmentB) {
                        const doctorA = appointmentA.appointment_slot_details.doctor.name
                        const doctorB = appointmentB.appointment_slot_details.doctor.name

                        return doctorA.localeCompare(doctorB)
                    })
                }

                setAppointments(sortedAppointments)
                setError('')
            })
            .catch(function (error) {
                setError('Unable to cancel the appointment.')
                console.log(error)
            })
    }

    let errorMessage = null

    if (error !== '') {
        errorMessage = <p>{error}</p>
    }
    let pageTitle = 'My Appointments'

    if (localStorage.getItem('role') === 'Admin') {
        pageTitle = 'All Appointments'
    }
    return (
        <div>
            <h1>{pageTitle}</h1>

            {errorMessage}

            <div>
                {appointments.map(function (appointment) {

                    let editButton = null
                    let editForm = null
                    let cancelButton = null

                    if (appointment.status === 'Booked') {
                        editButton = (
                            <button type="button" onClick={function () {
                                handleEditReason(appointment)
                            }}>Edit Appointment</button>
                        )

                        cancelButton = (
                            <button type="button" onClick={function () {
                                handleCancelAppointment(appointment.id)
                            }}>Cancel Appointment</button>
                        )
                    }

                    if (editingAppointmentId === appointment.id) {
                        editForm = (
                            <div>
                                <textarea rows="3" value={editedReason} onChange={function (event) {
                                    setEditedReason(event.target.value)
                                }}/>
                                <button type="button" onClick={function () {
                                    handleSaveReason(appointment.id)
                                }}>Save
                                </button>
                                <button type="button" onClick={handleCancelEdit}>Cancel</button>
                            </div>
                        )
                    }

                    return (
                        <div key={appointment.id}>
                            <h2>{appointment.reason}</h2>
                            {localStorage.getItem('role') === 'Admin' && (
                                <p>
                                    Patient: {appointment.patient_username}
                                </p>
                            )}

                            <p>
                                Who: Dr {appointment.appointment_slot_details.doctor.name}
                            </p>

                            <p>
                                When: {formatAppointmentTime(appointment.appointment_slot_details.time)} -- {appointment.appointment_slot_details.date}
                            </p>

                            <p>
                                Appointment Status: {appointment.status}
                            </p>

                            {editButton}
                            {editForm}
                            {cancelButton}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MyAppointments
