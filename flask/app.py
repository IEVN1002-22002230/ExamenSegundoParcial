from flask import Flask, jsonify
from flask_cors import CORS
from blueprints.pedidos import pedidos_bp
from config import config
from database import obtener_conexion

app = Flask(__name__)

app.config.from_object(config['development'])

CORS(app)

app.register_blueprint(pedidos_bp)
@app.route('/', methods=['GET'])
def inicio():
    return jsonify({
        'mensaje': 'API Pizzeria funcionando',
        'exito': True
    })


@app.route('/api/estado', methods=['GET'])
def estado():
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute('SELECT DATABASE()')

        base_datos = cursor.fetchone()

        return jsonify({
            'mensaje': 'Conexion correcta con MySQL',
            'base_datos': base_datos[0],
            'exito': True
        }), 200

    except Exception as ex:
        return jsonify({
            'mensaje': 'Error al conectar con MySQL',
            'error': str(ex),
            'exito': False
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        if conexion is not None and conexion.is_connected():
            conexion.close()


def pagina_no_encontrada(error):
    return jsonify({
        'mensaje': 'Pagina no encontrada',
        'exito': False
    }), 404


if __name__ == '__main__':
    app.register_error_handler(404, pagina_no_encontrada)

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )