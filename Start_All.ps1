venv\Scripts\activate
#Changes directory to Clinic360
cd .\Clinic360

#Migrations for the corresponding Python information.
python manage.py makemigrations accounts
python manage.py makemigrations message
python manage.py makemigrations appointment
python manage.py makemigrations social
python manage.py migrate

# Start Django server in a new PowerShell window
Start-Process "powershell" -ArgumentList "python manage.py runserver"

# Switch to front-end folder and run dev
cd ..\clinic360-fe
npm run dev
