
from django.contrib.auth.models import User
from django.db import transaction
from .models import Doctor, Appointment, AppointmentSlot
from rest_framework import generics
from .serializers import(DoctorSerializer,AppointmentSlotSerializer,AppointmentSerializer,AppointmentReasonSerializer,
                         AdminUserSerializer,AdminDoctorSerializer,AdminPatientStatusSerializer, PatientRegistrationSerializer)
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.exceptions import ValidationError



# Create your views here.

class AdminUserListAPIView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    def get_queryset(self):
        if not self.request.user.is_staff:
            return User.objects.none()
        return  User.objects.all().order_by('id')

class AdminDoctorCreateAPIView(generics.CreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = AdminDoctorSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise ValidationError("Only administrators can add doctors.")
        serializer.save()

class DoctorUpdateAPIView(generics.UpdateAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
       if self.request.user.is_staff:
           return Doctor.objects.all()
       return Doctor.objects.filter(user=self.request.user)

class AdminDoctorDeleteAPIView(generics.DestroyAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.is_staff:
            return Doctor.objects.all()
        return Doctor.objects.none()
    def perform_destroy(self,instance):
        booked_appointments = Appointment.objects.filter(appointment_slot__doctor=instance,status = "Booked").exists()
        if booked_appointments:
            raise ValidationError("Cannot delete doctors with booked appointments")
        instance.delete()

class AdminSlotCreateAPIView(generics.CreateAPIView):
    queryset= AppointmentSlot.objects.all()
    serializer_class = AppointmentSlotSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise ValidationError("Only Admin can add appointment slots this way")
        serializer.save()

class AdminSlotUpdateAPIView(generics.UpdateAPIView):
    serializer_class = AppointmentSlotSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.is_staff:
            return AppointmentSlot.objects.all()
        return AppointmentSlot.objects.none()

class AdminSlotDeleteAPIView(generics.DestroyAPIView):
    serializer_class = AppointmentSlotSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.is_staff:
            return AppointmentSlot.objects.all()
        return AppointmentSlot.objects.none()

    def perform_destroy(self, instance):
        booked_appointments = Appointment.objects.filter(appointment_slot=instance, status="Booked").exists()
        if booked_appointments:
            raise ValidationError( "Cannot delete a slot that has a booked appointment.")
        instance.delete()

class AdminAppointmentListAPIView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if not self.request.user.is_staff:
            return Appointment.objects.none()
        return Appointment.objects.select_related('patient','appointment_slot__doctor').order_by(
            'appointment_slot__date', 'appointment_slot__time')

class AdminAppointmentUpdateAPIView(generics.UpdateAPIView):
    serializer_class = AppointmentReasonSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.is_staff:
            return Appointment.objects.all()
        return Appointment.objects.none()
class AdminAppointmentCancelAPIView(generics.UpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.is_staff:
            return Appointment.objects.all()
        return Appointment.objects.none()

    @transaction.atomic
    def perform_update(self, serializer):
        appointment = serializer.instance
        if appointment.status != "Booked":
            raise ValidationError( "This appointment is not currently booked.")
        appointment.appointment_slot.is_available = True
        appointment.appointment_slot.save(update_fields=['is_available'])
        serializer.save(status="Cancelled")

class AdminPatientStatusUpdateAPIView(generics.UpdateAPIView):
    serializer_class = AdminPatientStatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.filter(
                is_staff=False,
                is_superuser=False
            )
        return User.objects.none()
class DoctorListAPIView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [AllowAny]

class AppointmentSlotListAPIView(generics.ListAPIView):
    queryset = AppointmentSlot.objects.all()
    serializer_class = AppointmentSlotSerializer
    permission_classes = [AllowAny]

class PatientAppointmentListAPIView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user).select_related('appointment_slot__doctor')

class AppointmentCancelAPIView(generics.UpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user).select_related('appointment_slot__doctor')
    @transaction.atomic
    def perform_update(self, serializer):
        appointment = serializer.instance
        if appointment.status != "Booked":
            raise ValidationError({'status': 'This appointment is not currently booked'})
        appointment.appointment_slot.is_available = True
        appointment.appointment_slot.save(update_fields=['is_available'])
        serializer.save(status="Cancelled")

class AppointmentCreateAPIView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def perform_create(self, serializer):
        slot_id = self.request.data.get('appointment_slot')
        try: slot = AppointmentSlot.objects.select_for_update().get(pk=slot_id)
        except Exception as e:
            raise ValidationError({'appointment_slot': 'An error occurred, please try again.'})
        if not slot.is_available:
            raise ValidationError({'appointment_slot': 'This appointment is no longer available'})
        slot.is_available = False
        slot.save(update_fields=['is_available'])
        serializer.save(patient=self.request.user,appointment_slot=slot)

class AppointmentEditReasonAPIView(generics.UpdateAPIView):
    serializer_class = AppointmentReasonSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Appointment.objects.filter(
            patient = self.request.user, status = "Booked"
        )

class PatientRegistrationAPIView(generics.CreateAPIView):
    serializer_class = PatientRegistrationSerializer
    permission_classes = [AllowAny]

class CurrentUserAPIView(generics.RetrieveAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


















