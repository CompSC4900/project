cd .\Clinic360
python manage.py makemigrations accounts
python manage.py makemigrations messages
python manage.py migrate

# Start Django server in a new PowerShell window
Start-Process "powershell" -ArgumentList "python manage.py runserver"

# Switch to front-end folder and run dev
cd ..\Clinic360-fe
npm run dev
