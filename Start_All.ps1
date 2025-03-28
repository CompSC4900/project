venv\Scripts\activate
cd .\Clinic360
python manage.py makemigrations accounts
python manage.py makemigrations message
python manage.py makemigrations appointment
python manage.py makemigrations Social
python manage.py migrate

# Start Django server in a new PowerShell window
Start-Process "powershell" -ArgumentList "python manage.py runserver"

# Switch to front-end folder and run dev
cd ..\clinic360-fe
npm run dev
