
from rest_framework import serializers
from .models import Doctor, AppointmentSlot, Appointment
from django.contrib.auth.models import User

class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'role'
        ]
    def get_role(self, obj):
        if obj.is_superuser:
            return "Admin"
        elif obj.is_staff:
            return "Admin"
        elif hasattr(obj, 'doctor_profile'):
            return "Doctor"
        else:
            return "Patient"


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    class Meta:
        fields = [

        ]
class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'


class AppointmentSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentSlot
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('patient', 'created_at', 'status')

class AppointmentReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['reason']


