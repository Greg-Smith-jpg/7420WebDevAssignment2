from django.urls import path

from . import views


urlpatterns = [
    # api end points
    path('api/doctors/', views.DoctorListAPIView.as_view(), name='api_doctors'),
    path('api/slots/', views.AppointmentSlotListAPIView.as_view(), name='api_slots'),
    path('api/appointments/', views.PatientAppointmentListAPIView.as_view(), name='api_appointments'),
    path('api/appointments/book/', views.AppointmentCreateAPIView.as_view(), name='api_book_appointment'),
    path('api/appointments/<int:pk>/cancel/',views.AppointmentCancelAPIView.as_view(),name='api_cancel_appointment'),
    path('api/appointments/<int:pk>/edit-reason/',views.AppointmentEditReasonAPIView.as_view(),name='api_edit_appointment_reason'),
    path('api/admin/users/',views.AdminUserListAPIView.as_view(),name='api_admin_users'),
    path('api/admin/doctors/add/',views.AdminDoctorCreateAPIView.as_view(),name='api_add_doctor'),
    path('api/doctors/<int:pk>/',views.DoctorUpdateAPIView.as_view(),name='api_update_doctor'),
    path('api/admin/doctors/<int:pk>/delete/',views.AdminDoctorDeleteAPIView.as_view(),name='api_delete_doctor'),
    path('api/admin/slots/add/',views.AdminSlotCreateAPIView.as_view(),name='api_add_slot'),
    path('api/admin/slots/<int:pk>/update/',views.AdminSlotUpdateAPIView.as_view(),name='api_update_slot'),
    path('api/admin/slots/<int:pk>/delete/',views.AdminSlotDeleteAPIView.as_view(),name='api_delete_slot'),
    path('api/admin/appointments/',views.AdminAppointmentListAPIView.as_view(),name='api_admin_appointments'),
    path('api/admin/appointments/<int:pk>/update/',views.AdminAppointmentUpdateAPIView.as_view(),name='api_admin_update_appointment'),
    path('api/admin/appointments/<int:pk>/cancel/',views.AdminAppointmentCancelAPIView.as_view(),name='api_admin_cancel_appointment'),
    path('api/admin/patients/<int:pk>/status/',views.AdminPatientStatusUpdateAPIView.as_view(),name='api_admin_patient_status'),
    path('api/register/', views.PatientRegistrationAPIView.as_view(), name='api_register'),
    path('api/user/', views.CurrentUserAPIView.as_view(), name='api_current_user'),
]
