# TikTakToe test task
# Requirements
1. Docker 18.09.2+
2. docker-compose 1.23.2+
3. Internet connection for pulling of docker images

# Project structure
Application consists of three parts that are run as three docker containers:
1. **frontend**. NodeJS (v10.15.3 LTS) and JQuery.
2. **backend**. NodeJS (v10.15.3 LTS) and Express (v4.17.0). Also it includes tests are implemented with Mocha and Chai. 
3. **db**. MySql (v8)

In root directory are contained mysql_dumps folder includes dump of database with stucture of tables. It are sended to docker container of database.

# To run application
1. Clone repository to local machine:
```bash
git clone https://github.com/RamonN334/tik_tak_toe.git
```
2. Go to the cloned directory
```bash
cd tik_tak_toe
```
3. Type a command:
```bash
docker-compose up -d --build
```
Then frontend will be available by http://localhost:8000 address,
To check that all parts of application are run, type next command:
```bash
docker ps
```
To get access to database, may use adminer that availavle by http://localhost:8080 or MySQL Workbrench.
Authetintification data for database access:
```json
"host": "localhost",
"port": 3306,
"user": "test_user",
"password": "test_user"
```

# To run tests
Run docker container with database:
```bash
docker-compose up -d db
```
Go to the backend directory:
```bash
cd backend
```
and type next command:
```bash
npm test
```