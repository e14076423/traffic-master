# Database Final Projects

## User Manual

Here are some tips for programming in each language and framework

### Frontend: HTML CSS JavaScript

- Make sure to embedd the follow code to use jQuery

  ```
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  ```

### Backend: Python Flask

- Modify the db info in main.py before you run the app
  ```
  mydb = mysql.connector.connect(
          host="localhost",
          user="root",
          password="0000",
          database="DATABASE_FINAL_PROJECT"
      )
  ```
- Make sure you have installed all the required packages
  ```
  pip install flask
  pip install mysql-connector-python
  pip install flask-mysql
  pip install flask-cors
  pip install pandas
  pip install requests
  ```

### Database: MySQL Server

\*Some commands only work for MacOS using homebrew\*

- homebrew services command

  - install MySQL

    ```
    brew install mysql
    ```

  - run the server

    ```
    brew services start mysql
    ```

  - check server status

    ```
    brew services list
    ```

  - stop the server

    ```
    brew services stop mysql
    ```

- mysql command

  - login to mysql

    ```
    mysql -u root -p
    ```

  - exit mysql

    ```
    quit
    ```

  - show all the databases

    ```
    sql show databases;
    ```

  - create database

    ```
    create database database_final_project;
    ```

  - use database

    ```
    use database_final_project;
    ```

  - create table

    ```
    CREATE TABLE BIKE (
      station_id INT,
      bikes_capacity INT,
      station_name VARCHAR(255),
      station_address VARCHAR(255),
      position_lon DECIMAL(9,6),
      position_lat DECIMAL(9,6),
      geo_hash VARCHAR(10)
      primary key (station_id)
    );
    ```

  - drop table

    ```
    drop table BIKE;
    ```

  - import csv to database

    ! check the local_infile is disabled or enable

    ```
    show variables like 'local_infile';
    ```

    ```
    set global local_infile = 1;
    ```

    ```
    LOAD DATA LOCAL INFILE '/path/to/file.csv'
    INTO TABLE TABLE_NAME
    FIELDS TERMINATED BY ','
    ENCLOSED BY '"'
    LINES TERMINATED BY '\r\n'
    IGNORE 1 ROWS;
    ```

  - show all tables

    ```
    show tables;
    ```

  - show table structure

    ```
    describe TABLE_NAME;
    ```

### Gcloud Service

- deploy service

- connect to mysql
  gcloud sql connect myinstance -u root

- import csv to database
  gcloud sql import csv myinstance gs://asia.artifacts.database-final-project-386818.appspot.com/bike.csv --database=database_final_project --table=BIKE
