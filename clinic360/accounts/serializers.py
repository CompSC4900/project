from rest_framework import serializers
from .models import Clinic360User
from django.core.validators import RegexValidator
from django.contrib.auth.password_validation import validate_password

class CreateAccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    zip_code = serializers.CharField(required=True, validators=[RegexValidator(
        regex=r'^\d{5}$',
        message='Zip code must be 5 digits',
    )])
    phone_number = serializers.CharField(required=True, validators=[RegexValidator(
        regex=r'^\d{10}$', # Formatting is handled on the front end
        message='Phone number must be 10 digits',
    )])

    class Meta:
        model = Clinic360User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'address', 'city', 'state', 'zip_code', 'birth_date', 'gender', 'phone_number')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields don't match."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            address=validated_data['address'],
            city=validated_data['city'],
            state=validated_data['state'],
            zip_code=validated_data['zip_code'],
            birth_date=validated_data['birth_date'],
            gender=validated_data['gender'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
        )