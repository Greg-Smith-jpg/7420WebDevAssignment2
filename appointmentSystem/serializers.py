from django.contrib.auth.decorators import user_passes_test
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
class AdminDoctorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = Doctor
        fields = [
            'id',
            'name',
            'speciality',
            'email',
            'phone',
            'description',
            'username',
            'password'
        ]
        read_only_fields = ['id']
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=password
        )
        doctor = Doctor.objects.create(
            user=user,
            **validated_data
        )
        return doctor



class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'


class AppointmentSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentSlot
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    appointment_slot_details = serializers.SerializerMethodField()
    patient_username = serializers.CharField(source='patient.username', read_only=True)
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('patient', 'created_at', 'status')

    def get_appointment_slot_details(self, obj):
        return {
            'doctor': {
                'name': obj.appointment_slot.doctor.name,
                'speciality': obj.appointment_slot.doctor.speciality
            },
            'date': obj.appointment_slot.date,
            'time': obj.appointment_slot.time
        }


class AppointmentReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['reason']

class AdminPatientStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['is_active']

class PatientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=3)

    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )

        return user

