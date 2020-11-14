DROP TABLE IF EXISTS users;
CREATE TABLE users
(id int NOT NULL AUTO_INCREMENT,
group_id int,
username varchar(20) NOT NULL,
password varchar(20) NOT NULL,
leader bool NOT NULL DEFAULT "0",
PRIMARY KEY(id), 
FOREIGN KEY(group_id) REFERENCES groups(id)
);

DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks
(id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
group_id int NOT NULL,
title varchar(20) NOT NULL,
type varchar(20) NOT NULL,
location varchar(100) NOT NULL,
time varchar(7) NOT NULL,
date varchar(10) NOT NULL,
description varchar(500) NOT NULL,
PRIMARY KEY(id),
FOREIGN KEY(group_id) REFERENCES groups(id)
);

DROP TABLE IF EXISTS groups;
CREATE TABLE groups
(id int NOT NULL PRIMARY KEY,
leader_id int NOT NULL,
PRIMARY KEY(id),
FOREIGN KEY(leader_id) REFERENCES users(id)
);