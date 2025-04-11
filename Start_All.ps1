# Update pip first (optional, but often helpful)
python -m pip install --upgrade pip==24.3.1

# Install the listed packages with specified versions
python -m pip install amqp
python -m pip install asgiref
python -m pip install billiard
python -m pip install celery
python -m pip install click
python -m pip install click-didyoumean
python -m pip install click-plugins
python -m pip install click-repl
python -m pip install Django
python -m pip install django-celery-results
python -m pip install django-cors-headers
python -m pip install djangorestframework
python -m pip install djangorestframework_simplejwt
python -m pip install kombu
python -m pip install pillow
python -m pip install prompt_toolkit
python -m pip install PyJWT
python -m pip install python-dateutil
python -m pip install pytz
python -m pip install six=
python -m pip install sqlparse
python -m pip install tzdata
python -m pip install vine
python -m pip install wcwidth

Write-Host "All packages installed!"

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
