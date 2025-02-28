from django.apps import AppConfig
#Import AppConfig class from the Django application


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
#Class for defining the accounts and how 'name' is defined by the account info.
