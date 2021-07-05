CREATE DATABASE authtodo;

CREATE TABLE users(
  user_id uuid DEFAULT uuid_generate_v4(),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  PRIMARY KEY(user_id)
);

CREATE TABLE todo(
  todo_id SERIAL,
  user_id UUID ,
  description VARCHAR(255),
  PRIMARY KEY (todo_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);


INSERT INTO users (user_name, user_email, user_password) VALUES ('lee', 'leecb@gmail.com', 'hahaha123');



CREATE TABLE "users" (
	"name" varchar(50) NOT NULL,
	"email" varchar(50) NOT NULL,
	"education" varchar(50) NOT NULL,
	"experience" varchar(50) NOT NULL,
	"current_designation" varchar(50) NOT NULL,
	"current_organisation" varchar(50) NOT NULL,
	"domain" varchar(50) NOT NULL,
	"skills" varchar(50) NOT NULL,
	"user_id" uuid DEFAULT uuid_generate_v4(),
	"phone_no" varchar(10) NOT NULL,
	"sessions" integer NOT NULL,
	"password" varchar(50) NOT NULL,
	CONSTRAINT "user_pk" PRIMARY KEY ("user_id")
);