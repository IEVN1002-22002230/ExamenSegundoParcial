
class DevelopmentConfig:
    DEBUG = True

    # Clave necesaria para utilizar mensajes Flash
    SECRET_KEY = 'pizzeria_clave_secreta_2026'

    MYSQL_HOST = 'localhost'
    MYSQL_PORT = 3306
    MYSQL_USER = 'asa'
    MYSQL_PASSWORD = 'root'
    MYSQL_DB = 'pizzeria_db'


config = {
    'development': DevelopmentConfig
}
