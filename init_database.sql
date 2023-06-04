CREATE TABLE IF NOT EXISTS BUS (
    route_id VARCHAR(50) PRIMARY KEY,
    url VARCHAR(100),
    type VARCHAR(50),
    type_zh VARCHAR(50),
    route_name VARCHAR(100)
);


CREATE TABLE IF NOT EXISTS TRAIN (
    station_id INT PRIMARY KEY,
    station_address VARCHAR(100),
    station_phone VARCHAR(20),
    station_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS BIKE (
    station_id INT PRIMARY KEY,
    bikes_capacity INT,
    station_name VARCHAR(255),
    station_address VARCHAR(255),
    position_lon decimal(9,6),
    position_lat decimal(9,6),
    geo_hash VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS TRAIN_NORTH_STATION (
    station_id INT,
    train_id INT,
    order_num INT,
    arr_time TIME,
    station_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS TRAIN_SOUTH_STATION (
    station_id INT,
    train_id INT,
    order_num INT,
    arr_time TIME,
    station_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS LIKE_BUS (
    route_id VARCHAR(50) PRIMARY KEY,
    route_name VARCHAR(100),
    type VARCHAR(50),
    type_zh VARCHAR(50),
    url VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS LIKE_TRAIN (
    train_id INT,
    start_station VARCHAR(255),
    destination_station VARCHAR(255),
    start_time VARCHAR(255),
    destination_time VARCHAR(255),
    duration VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS LIKE_BIKE (
    station_id INT PRIMARY KEY,
    station_name VARCHAR(255),
    station_address VARCHAR(255),
    notes VARCHAR(255) DEFAULT 'No notes'
);

-- Load file to the table

set global local_infile = 1;

LOAD DATA LOCAL INFILE 'path/to/.../data/bus.csv'
INTO TABLE BUS
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'path/to/.../data/train_tainan.csv'
INTO TABLE TRAIN
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'path/to/.../data/bike.csv'
INTO TABLE BIKE
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'path/to/.../data/train_north_station.csv'
INTO TABLE TRAIN_NORTH_STATION
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE 'path/to/.../data/train_south_station.csv'
INTO TABLE TRAIN_SOUTH_STATION
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS;
