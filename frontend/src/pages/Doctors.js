import {useEffect, useState} from 'react'
import api from '../services/api'
import {formatAppointmentTime} from './MyAppointments'

function Doctors() {
    const [doctors, setDoctors] = useState([])
    const [error, setError] = useState('')
    const [appointmentSlots, setAppointmentSlots] = useState([])
    const [selectedDoctorId, setSelectedDoctorId] = useState(null)
    const [selectedSlotId, setSelectedSlotId] = useState(null)
    const [appointmentReason, setAppointmentReason] = useState('')

    useEffect(function () {
        function getDoctors() {
            api.get('doctors/')
                .then(function (response) {
                    setDoctors(response.data)
                    setError('')
                })
                .catch(function (error) {
                    setError('Unable to load doctors.')
                    console.log(error)
                })
        }

        getDoctors()
    }, [])

    useEffect(function () {
        function getAppointmentSlots() {
            api.get('slots/')
                .then(function (response) {
                    setAppointmentSlots(response.data)
                })
                .catch(function (error) {
                    setError('Unable to load appointment slots.')
                    console.log(error)
                })
        }

        getAppointmentSlots()
    }, [])

    function handleViewSlots(doctorId) {
        setSelectedDoctorId(doctorId)
    }

    function getDoctorSlots(doctorId) {
        const filteredSlots = appointmentSlots.filter(function (slot) {
            if (slot.doctor === doctorId && slot.is_available === true) {
                return true
            }

            return false
        })

        return filteredSlots
    }

    function handleBookAppointment() {
        api.post('appointments/book/', {
            appointment_slot: selectedSlotId,
            reason: appointmentReason
        })
            .then(function (response) {
                alert('Your appointment has been booked successfully.')
                setSelectedSlotId(null)
                setAppointmentReason('')

                return api.get('slots/')
            })
            .then(function (response) {
                setAppointmentSlots(response.data)
                setError('')
            })
            .catch(function (error) {
                setError('Unable to book the appointment. The selected slot may no longer be available.')
                console.log(error)
            })
    }

    let errorMessage = null

    if (error !== '') {
        errorMessage = <p>{error}</p>
    }

    return (
        <div>
            <h1>Our Doctors</h1>
            {errorMessage}
            <div>
                {doctors.map(function (doctor) {
                    return (
                        <div key={doctor.id}>
                            <h2>{doctor.name}</h2>
                            <p>Speciality: {doctor.speciality}</p>
                            <p>Email: {doctor.email}</p>
                            <p>Phone: {doctor.phone}</p>
                            <p>About: {doctor.description}</p>
                            <button type="button" onClick={function () {
                                handleViewSlots(doctor.id)
                            }}> View Available Slots
                            </button>

                            {selectedDoctorId === doctor.id && (
                                <div>
                                    <h3>Available Appointment Slots</h3>
                                    {getDoctorSlots(doctor.id).map(function (slot) {
                                        let bookAppointmentButton = null
                                        let appointmentReasonInput = null
                                        if (selectedSlotId === slot.id) {
                                            appointmentReasonInput = (
                                                <textarea rows="1" value={appointmentReason}
                                                          onChange={function (event) {
                                                              setAppointmentReason(event.target.value)
                                                          }} placeholder="Reason for appointment"></textarea>)
                                            bookAppointmentButton = (
                                                <button type="button" onClick={handleBookAppointment}>Book
                                                    Appointment</button>)
                                        }
                                        return (
                                            <div key={slot.id}>
                                                <p>
                                                    Date: {slot.date} - Time: {formatAppointmentTime(slot.time)}
                                                    <button type="button" onClick={function () {
                                                        setSelectedSlotId(slot.id)
                                                    }}>Select Slot
                                                    </button>
                                                </p>

                                                {appointmentReasonInput}
                                                {bookAppointmentButton}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Doctors
