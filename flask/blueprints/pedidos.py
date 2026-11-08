
from flask import Blueprint, request, jsonify, flash, get_flashed_messages
from database import obtener_conexion

pedidos_bp = Blueprint('pedidos', __name__, url_prefix='/api/pedidos')


# CONSULTAR TODOS LOS PEDIDOS
@pedidos_bp.route('/', methods=['GET'])
def listar_pedidos():
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute('SELECT * FROM pedidos ORDER BY id_pedido DESC')
        datos = cursor.fetchall()

        return jsonify(datos), 200

    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


# CONSULTAR EL DETALLE DE UN PEDIDO
@pedidos_bp.route('/<int:id_pedido>', methods=['GET'])
def detalle_pedido(id_pedido):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute(
            'SELECT * FROM pedidos WHERE id_pedido = %s',
            (id_pedido,)
        )
        pedido = cursor.fetchone()

        if not pedido:
            return jsonify({'mensaje': 'Pedido no encontrado'}), 404

        cursor.execute(
            '''SELECT * FROM detalle_pedidos
               WHERE id_pedido = %s''',
            (id_pedido,)
        )
        detalles = cursor.fetchall()

        return jsonify({
            'pedido': pedido,
            'detalles': detalles
        }), 200

    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


# REGISTRAR UN PEDIDO CON SUS DETALLES
@pedidos_bp.route('/', methods=['POST'])
def registrar_pedido():
    conexion = None
    cursor = None

    try:
        datos = request.get_json()

        if not datos:
            return jsonify({'mensaje': 'No se recibieron datos'}), 400

        detalles = datos.get('detalles', [])

        if not detalles:
            return jsonify({
                'mensaje': 'El pedido debe contener al menos una pizza'
            }), 400

        conexion = obtener_conexion()
        cursor = conexion.cursor()

        sql_pedido = '''
            INSERT INTO pedidos
            (nombre_cliente, direccion, telefono, fecha_pedido, total)
            VALUES (%s, %s, %s, %s, %s)
        '''

        valores_pedido = (
            datos['nombre_cliente'],
            datos['direccion'],
            datos['telefono'],
            datos['fecha_pedido'],
            datos['total']
        )

        cursor.execute(sql_pedido, valores_pedido)

        id_pedido = cursor.lastrowid

        sql_detalle = '''
            INSERT INTO detalle_pedidos
            (id_pedido, tamano, ingredientes, num_pizzas, subtotal)
            VALUES (%s, %s, %s, %s, %s)
        '''

        for pizza in detalles:
            valores_detalle = (
                id_pedido,
                pizza['tamano'],
                pizza['ingredientes'],
                pizza['num_pizzas'],
                pizza['subtotal']
            )

            cursor.execute(sql_detalle, valores_detalle)

        conexion.commit()

        # MENSAJE FLASH DE CONFIRMACION
        flash('Pedido registrado correctamente', 'success')

        mensajes = get_flashed_messages(with_categories=True)

        mensaje_confirmacion = mensajes[0][1] if mensajes else ''

        return jsonify({
            'mensaje': mensaje_confirmacion,
            'id_pedido': id_pedido,
            'total': datos['total']
        }), 201

    except Exception as ex:
        if conexion:
            conexion.rollback()

        return jsonify({
            'mensaje': 'Error al registrar el pedido',
            'error': str(ex)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


# CONSULTAR VENTAS POR DIA DE LA SEMANA
@pedidos_bp.route('/ventas/dia/<string:dia>', methods=['GET'])
def ventas_por_dia(dia):
    conexion = None
    cursor = None

    dias = {
        'domingo': 1,
        'lunes': 2,
        'martes': 3,
        'miercoles': 4,
        'miércoles': 4,
        'jueves': 5,
        'viernes': 6,
        'sabado': 7,
        'sábado': 7
    }

    dia = dia.lower().strip()

    if dia not in dias:
        return jsonify({
            'mensaje': 'Dia de la semana no valido'
        }), 400

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute('''
            SELECT *
            FROM pedidos
            WHERE DAYOFWEEK(fecha_pedido) = %s
            ORDER BY fecha_pedido DESC
        ''', (dias[dia],))

        ventas = cursor.fetchall()

        cursor.execute('''
            SELECT COALESCE(SUM(total), 0) AS total_acumulado
            FROM pedidos
            WHERE DAYOFWEEK(fecha_pedido) = %s
        ''', (dias[dia],))

        acumulado = cursor.fetchone()

        return jsonify({
            'dia': dia,
            'ventas': ventas,
            'total_acumulado': acumulado['total_acumulado']
        }), 200

    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


# CONSULTAR VENTAS POR MES
@pedidos_bp.route('/ventas/mes/<string:mes>', methods=['GET'])
def ventas_por_mes(mes):
    conexion = None
    cursor = None

    meses = {
        'enero': 1,
        'febrero': 2,
        'marzo': 3,
        'abril': 4,
        'mayo': 5,
        'junio': 6,
        'julio': 7,
        'agosto': 8,
        'septiembre': 9,
        'octubre': 10,
        'noviembre': 11,
        'diciembre': 12
    }

    mes = mes.lower().strip()

    if mes not in meses:
        return jsonify({
            'mensaje': 'Mes no valido'
        }), 400

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute('''
            SELECT *
            FROM pedidos
            WHERE MONTH(fecha_pedido) = %s
            ORDER BY fecha_pedido DESC
        ''', (meses[mes],))

        ventas = cursor.fetchall()

        cursor.execute('''
            SELECT COALESCE(SUM(total), 0) AS total_acumulado
            FROM pedidos
            WHERE MONTH(fecha_pedido) = %s
        ''', (meses[mes],))

        acumulado = cursor.fetchone()

        return jsonify({
            'mes': mes,
            'ventas': ventas,
            'total_acumulado': acumulado['total_acumulado']
        }), 200

    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()
