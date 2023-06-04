from flask import Flask, request, jsonify, Response, render_template
from flask_cors import CORS
import pandas as pd
import json
import requests
import mysql.connector  # for connecting to mysql
from datetime import timedelta


class TimedeltaEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
            # Format the timedelta object with leading zeros for hours, minutes, and seconds
            hours = obj.seconds // 3600
            minutes = (obj.seconds % 3600) // 60
            seconds = obj.seconds % 60
            formatted_time = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            return formatted_time
        return super().default(obj)


try:
    # configuration of db info
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="DATABASE_FINAL_PROJECT"
    )
    # initiate the db
    mycursor = mydb.cursor()
except mysql.connector.Error as err:
    print("Failed to connect to MySQL: {}".format(err))
    mycursor = None

app = Flask(__name__, static_folder='static')
CORS(app)

token = json
with open('API_tokens.json') as f:
    token = json.load(f)

app_id = token['Client Id']
app_key = token['Client Secret']
auth_url = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token"


class Auth():

    def __init__(self, app_id, app_key):
        self.app_id = app_id
        self.app_key = app_key

    def get_auth_header(self):
        content_type = 'application/x-www-form-urlencoded'
        grant_type = 'client_credentials'

        return {
            'content-type': content_type,
            'grant_type': grant_type,
            'client_id': self.app_id,
            'client_secret': self.app_key
        }


class data():

    def __init__(self, app_id, app_key, auth_response):
        self.app_id = app_id
        self.app_key = app_key
        self.auth_response = auth_response

    def get_data_header(self):
        auth_JSON = json.loads(self.auth_response.text)
        access_token = auth_JSON.get('access_token')

        return {
            'authorization': 'Bearer '+access_token
        }

# define routes and API endpoints here

# render html


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/bus/', methods=['GET'])
def bus():
    return render_template('bus.html')


@app.route('/train/', methods=['GET'])
def train():
    return render_template('train.html')


@app.route('/bike/', methods=['GET'])
def bike():
    return render_template('bike.html')


@app.route('/like/', methods=['GET'])
def like():
    return render_template('like.html')


@app.route('/database/', methods=['GET'])
def database():
    return render_template('database.html')


# API

@app.route('/api/get_bus/', methods=['GET'])
def get_bus():
    SQL = "SELECT * FROM BUS"
    mycursor.execute(SQL)
    data = mycursor.fetchall()

    json_array = []
    for row in data:
        item = {
            'route_id': row[0],
            'url': row[1],
            'type': row[2],
            'type_zh': row[3],
            'route_name': row[4],
        }
        json_array.append(item)

    # json.dumps() is used to convert a Python object into a json string
    json_data = json.dumps(json_array)
    return json_data


@app.route('/api/like_bus/', methods=['GET', 'POST'])
def like_bus():
    bus = request.get_json()
    print(bus)
    SQL = '''
        INSERT INTO LIKE_BUS (route_id, route_name, type, type_zh, url)
        VALUES ('{}', '{}', '{}', '{}', '{}')
    '''
    SQL = SQL.format(bus['route_id'], bus['route_name'], bus['type'],
                     bus['type_zh'], bus['url'])
    mycursor.execute(SQL)
    mydb.commit()

    return {'status': 'success'}


@app.route('/api/get_like_bus/', methods=['GET'])
def get_like_bus():
    SQL = "SELECT * FROM LIKE_BUS"
    mycursor.execute(SQL)
    data = mycursor.fetchall()

    json_array = []
    for row in data:
        item = {
            'route_id': row[0],
            'route_name': row[1],
            'type': row[2],
            'type_zh': row[3],
            'url': row[4],
        }
        json_array.append(item)

    # json.dumps() is used to convert a Python object into a json string
    json_data = json.dumps(json_array)
    return json_data


@app.route('/api/get_bike/', methods=['GET'])
def get_bike():

    SQL = "SELECT * FROM BIKE"
    mycursor.execute(SQL)
    data = mycursor.fetchall()

    json_array = []
    for row in data:
        item = {
            'station_id': row[0],
            'bikes_capacity': row[1],
            'station_name': row[2],
            'station_address': row[3],
            'position_lon': str(row[4]),
            'position_lat': str(row[5]),
            'geo_hash': row[6]
        }
        json_array.append(item)

    # json.dumps() is used to convert a Python object into a json string
    json_data = json.dumps(json_array)

    return json_data


@app.route('/api/rest_bike/<stationID>/', methods=['Get'])
def rest_bike(stationID):
    # TDX API services
    url = "https://tdx.transportdata.tw/api/basic/v2/Bike/Availability/City/Tainan"
    a = Auth(app_id, app_key)
    auth_response = requests.post(auth_url, a.get_auth_header())
    d = data(app_id, app_key, auth_response)
    data_response = requests.get(url, headers=d.get_data_header())
    #
    data_list = json.loads(data_response.text)

    for station in data_list:
        if station['StationID'] == stationID:
            response = {
                'StationID': stationID,
                'AvailableRentBikes': station['AvailableRentBikes'],
                'AvailableReturnBikes': station['AvailableReturnBikes']
            }
            return jsonify(response)

    return None


@app.route('/api/like_bike/', methods=['POST'])
def like_bike():
    data = request.get_json()
    station_id = data['stationID']
    print(station_id)
    SQL = '''
    INSERT INTO LIKE_BIKE (station_id, station_name, station_address)
    SELECT station_id, station_name, station_address
    FROM BIKE
    WHERE station_id = %s
    '''
    mycursor.execute(SQL, (station_id,))
    mydb.commit()

    SQL = "SELECT * FROM LIKE_BIKE"
    mycursor.execute(SQL)
    data = mycursor.fetchall()
    for x in data:
        print(x)
    return jsonify({'status': 'success'})


@app.route('/api/get_like_bike', methods=['GET', 'POST'])
def get_like_bike():
    SQL = "SELECT * FROM LIKE_BIKE"
    mycursor.execute(SQL)
    data = mycursor.fetchall()

    json_array = []
    for row in data:
        item = {
            'station_id': row[0],
            'station_name': row[1],
            'station_address': row[2],
            'notes': row[3]
        }
        json_array.append(item)

    # json.dumps() is used to convert a Python object into a json string
    json_data = json.dumps(json_array)

    return json_data


@app.route('/api/get_train/', methods=['GET'])
def get_train():
    SQL = "SELECT * FROM TRAIN"
    mycursor.execute(SQL)
    data = mycursor.fetchall()
    json_array = []
    for row in data:
        item = {
            'station_id': row[0],
            'station_address': row[1],
            'station_phone': row[2],
            'station_name': row[3]
        }
        json_array.append(item)

    # json.dumps() is used to convert a Python object into a json string
    json_data = json.dumps(json_array)
    return json_data


@app.route('/api/search_train', methods=['GET', 'POST'])
def search_train():
    data = request.get_json()
    startID = data.get('startID')
    startName = data.get('startName')
    startIndex = data.get('startIndex')
    destinationID = data.get('destinationID')
    destinationName = data.get('destinationName')
    destinationIndex = data.get('destinationIndex')
    direction = destinationIndex - startIndex

    #  direction > 0: southbound, direction < 0: northbound
    table = 'TRAIN_SOUTH_STATION' if direction > 0 else 'TRAIN_NORTH_STATION'
    SQL = '''
        SELECT t1.train_id, t1.arr_time AS start_arr_time, t1.station_name AS start_station_name, t2.arr_time AS dest_arr_time, t2.station_name AS dest_station_name
        FROM {} t1, {} t2
        WHERE t1.station_name = '{}' AND t2.station_name = '{}' AND t1.train_id = t2.train_id
        ORDER BY start_arr_time;
        '''
    SQL = SQL.format(table, table, startName, destinationName)
    mycursor.execute(SQL)
    data = mycursor.fetchall()

    json_array = []
    for row in data:
        item = {
            'trainID': row[0],
            'startStation': row[2],
            'startTime': row[1],
            'destinationStation': row[4],
            'destinationTime': row[3],
            'duration': row[3] - row[1]
        }
        json_array.append(item)
    json_data = json.dumps(json_array, cls=TimedeltaEncoder)
    return json_data


@app.route('/api/like_train/', methods=['POST'])
def like_train():
    data = request.get_json()
    train = data['train']
    print(train['trainID'])
    train_id = train['trainID']
    start_station = train['startStation']
    destination_station = train['destinationStation']
    start_time = train['startTime']
    destination_time = train['destinationTime']
    duration = train['duration']

    # Check if the data already exists
    SQL = '''
    SELECT * FROM LIKE_TRAIN
    WHERE train_id = %s AND start_station = %s AND destination_station = %s AND start_time = %s AND destination_time = %s AND duration = %s
    '''
    mycursor.execute(SQL, (train_id, start_station,
                     destination_station, start_time, destination_time, duration))
    result = mycursor.fetchall()

    if result:
        # Data already exists, do not insert
        print("Data already exists, not performing insertion")
    else:
        # Data does not exist, perform the insertion
        SQL = '''
        INSERT INTO LIKE_TRAIN (train_id, start_station, destination_station, start_time, destination_time, duration)
        VALUES (%s, %s, %s, %s, %s, %s)
        '''
        mycursor.execute(SQL, (train_id, start_station,
                         destination_station, start_time, destination_time, duration))
        mydb.commit()

        SQL = "SELECT * FROM LIKE_TRAIN"
        mycursor.execute(SQL)
        data = mycursor.fetchall()
        for x in data:
            print(x)
    return jsonify({'status': 'success'})


@app.route('/api/get_like_train', methods=['GET', 'POST'])
def get_like_train():
    SQL = "SELECT * FROM LIKE_TRAIN"
    mycursor.execute(SQL)
    data = mycursor.fetchall()

    json_array = []
    for row in data:
        item = {
            'train_id': row[0],
            'start_station': row[1],
            'destination_station': row[2],
            'start_time': row[3],
            'destination_time': row[4],
            'duration': row[5]
        }
        json_array.append(item)

    # json.dumps() is used to convert a Python object into a json string
    json_data = json.dumps(json_array)

    return json_data

# UPDATE


@app.route('/api/update_bike/<stationID>', methods=['PUT'])
def update_bike(stationID):
    data = request.get_json()
    notes = data.get('notes')
    SQL = '''
        UPDATE LIKE_BIKE
        SET notes = '{}'
        WHERE station_id = {}
        '''
    SQL = SQL.format(notes, stationID)
    mycursor.execute(SQL)
    mydb.commit()
    return {"message": f'Updated station with id: {stationID}'}


# DELETE

@app.route('/api/delete_bus/', methods=['DELETE'])
def delete_bus():
    data = request.get_json()
    print(data)
    SQL = '''
    DELETE FROM LIKE_BUS
    WHERE route_name = '{}'
    '''
    SQL = SQL.format(data['route_name'])
    mycursor.execute(SQL)
    return {"message": f'Deleted bus with route_name: {data["route_name"]}'}


@app.route('/api/delete_bike/<stationID>', methods=['DELETE'])
def delete_bike(stationID):
    # Perform deletion logic here using the provided stationID
    SQL = '''
        DELETE FROM LIKE_BIKE
        WHERE station_id = {}
        '''
    SQL = SQL.format(stationID)
    mycursor.execute(SQL)

    return {"message": f'Deleted station with id: {stationID}'}


@app.route('/api/delete_train/', methods=['DELETE'])
def delete_train():
    data = request.get_json()
    print(data)
    SQL = '''
    DELETE FROM LIKE_TRAIN
    WHERE train_id = {} AND start_station = '{}' AND destination_station = '{}' AND start_time = '{}' AND destination_time = '{}' AND duration = '{}'
    '''
    SQL = SQL.format(data['train_id'], data['start_station'], data['destination_station'],
                     data['start_time'], data['destination_time'], data['duration'])
    mycursor.execute(SQL)
    mydb.commit()
    return {"message": "Deleted train"}


# get other data
@app.route('/api/get_train_north_station/', methods=['GET'])
def get_train_north_station():
    SQL = '''
    SELECT * FROM TRAIN_NORTH_STATION
    '''
    mycursor.execute(SQL)
    data = mycursor.fetchall()
    json_array = []
    for row in data:
        item = {
            'station_id': row[0],
            'train_id': row[1],
            'order_num': row[2],
            'arr_time': row[3],
            'station_name': row[4]
        }
        json_array.append(item)
    # json_data = json.dumps(json_array)
    json_data = json.dumps(json_array, cls=TimedeltaEncoder)
    return json_data


@app.route('/api/get_train_south_station/', methods=['GET'])
def get_train_south_station():
    SQL = '''
    SELECT * FROM TRAIN_SOUTH_STATION
    '''
    mycursor.execute(SQL)
    data = mycursor.fetchall()
    json_array = []
    for row in data:
        item = {
            'station_id': row[0],
            'train_id': row[1],
            'order_num': row[2],
            'arr_time': row[3],
            'station_name': row[4]
        }
        json_array.append(item)
    json_data = json.dumps(json_array, cls=TimedeltaEncoder)
    return json_data

# some simple syntax for flask beginner


@app.route('/api/test/', methods=['GET'])
def test():
    data = {'message': 'This is a test'}
    return jsonify(data)


@app.route('/api/db/test/', methods=['GET'])
def db_test():
    mycursor.execute("SELECT * FROM TEST_TABLE")
    data = mycursor.fetchall()
    for x in data:
        print(x)
    return jsonify(data)


@app.route('/api/db/test/insert', methods=['GET', 'POST'])
def db_test_insert():
    data = request.get_json()
    testID = data.get('testID')
    testCONTENT = data.get('testCONTENT')
    print(testID, testCONTENT)
    SQL = "INSERT INTO TEST_TABLE (testID, testCONTENT) VALUES (%s, %s)"
    values = (testID, testCONTENT)
    mycursor.execute(SQL, values)
    mydb.commit()
    return jsonify({'message': 'Data submitted successfully'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
