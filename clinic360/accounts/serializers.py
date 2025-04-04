from rest_framework import serializers
from .models import Clinic360User
from django.core.validators import RegexValidator
from django.contrib.auth.password_validation import validate_password
#Importing the Clinic360User model and regex validators from Django.

class AccountSerializer(serializers.ModelSerializer):
    zip_code = serializers.CharField(required=True, validators=[RegexValidator(
        regex=r'^\d{5}$',
        message='Zip code must be 5 digits',
        #Regex validator and message for if the number of digits is outside the accepted bound.
    )])
    phone_number = serializers.CharField(required=True, validators=[RegexValidator(
        regex=r'^\d{10}$', # Formatting is handled on the front end
        message='Phone number must be 10 digits',
        #Regex validator and message for the phone number needing 10 digits.
    )])

    class Meta:
        model = Clinic360User
        fields = ('email', 'first_name', 'last_name', 'address', 'city', 'state', 'zip_code', 'birth_date', 'gender', 'phone_number')

class CreateAccountSerializer(AccountSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Clinic360User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'address', 'city', 'state', 'zip_code', 'birth_date', 'gender', 'phone_number')
        #Serialization model and the necessary fields

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Password fields don't match."})
            #Serializer to ensure in validation that the passwords match and an error message if not.
        return attrs

    def create(self, validated_data):
        is_active = validated_data.pop('is_active', False)
        user = Clinic360User.objects.create_user(
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
            #Validated date for a specific Clinic360 user
        )
        user.is_active = is_active
        user.save()
        return user
