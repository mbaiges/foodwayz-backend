CREATE TABLE books (
  ID SERIAL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL
);

INSERT INTO books (author, title)
VALUES  ('J.K. Rowling', 'Harry Potter');

-- 
CREATE TABLE t_restaurant_chain (
  a_rest_chain_id SERIAL PRIMARY KEY,
  a_name varchar(255) NOT NULL,
  a_score int
);

CREATE TABLE t_restaurant (
  a_rest_id SERIAL PRIMARY KEY,
  a_name varchar(255) NOT NULL,
  a_score int,
  a_state varchar(255) NOT NULL,
  a_city varchar(255) NOT NULL,
  a_postal_code int NOT NULL,
  a_address varchar(255) NOT NULL,
  a_rest_chain_id int,
  UNIQUE(a_state, a_city, a_postal_code, a_address),
  FOREIGN KEY (a_rest_chain_id) REFERENCES t_restaurant_chain(a_rest_chain_id)
);

CREATE TABLE t_type (
  a_type_id SERIAL PRIMARY KEY,
  a_type varchar(255) 
);

CREATE TABLE t_ingredient (
  a_ingr_id SERIAL PRIMARY KEY,
  a_ingr_name varchar(255)
);

CREATE TABLE t_user (
  a_user_id SERIAL PRIMARY KEY,
  a_name varchar(255) NOT NULL,
  a_email varchar(255) NOT NULL UNIQUE,
  a_password varchar(255) NOT NULL,
  a_reg_date timestamp NOT NULL
);

CREATE TABLE t_characteristic (
    a_char_id SERIAL PRIMARY KEY,
    a_char_name varchar(255) 
);

CREATE TABLE t_user_has_characteristic (
  a_user_id int,
  a_char_id int,
  PRIMARY KEY(a_user_id, a_char_id),
  FOREIGN KEY (a_user_id) REFERENCES t_user(a_user_id),
  FOREIGN KEY (a_char_id) REFERENCES t_characteristic(a_char_id)
);

CREATE TABLE t_food (
  a_food_id SERIAL PRIMARY KEY,
  a_description varchar(255) NOT NULL,
  a_score int,
  a_type_id int NOT NULL,
  a_res_id int NOT NULL,
  FOREIGN KEY (a_res_id) REFERENCES t_restaurant(a_rest_id),
  FOREIGN KEY (a_type_id) REFERENCES t_type(a_type_id)
);

CREATE TABLE t_food_has_characteristic (
  a_food_id int,
  a_char_id int,
  PRIMARY KEY(a_food_id, a_char_id),
  FOREIGN KEY (a_food_id) REFERENCES t_food(a_food_id),
  FOREIGN KEY (a_char_id) REFERENCES t_characteristic(a_char_id)
);

CREATE TABLE t_food_has_ingredient (
  a_food_id int,
  a_ingr_id int,
  PRIMARY KEY(a_food_id, a_ingr_id),
  FOREIGN KEY (a_food_id) REFERENCES t_food(a_food_id),
  FOREIGN KEY (a_ingr_id) REFERENCES t_ingredient(a_ingr_id)
);

CREATE TABLE t_review (
  a_user_id int,
  a_food_id int,
  a_desc varchar(255),
  a_score int NOT NULL,
  PRIMARY KEY(a_user_id, a_food_id),
  FOREIGN KEY (a_user_id) REFERENCES t_user(a_user_id),
  FOREIGN KEY (a_food_id) REFERENCES t_food(a_food_id)
);

CREATE TABLE t_owner (
  a_user_id int PRIMARY KEY,
  a_is_premium boolean NOT NULL,
  FOREIGN KEY (a_user_id) REFERENCES t_user(a_user_id)
);

CREATE TABLE t_owns (
  a_user_id int,
  a_rest_id int,
  PRIMARY KEY(a_rest_id, a_user_id),
  FOREIGN KEY (a_rest_id) REFERENCES t_restaurant(a_rest_id)
);

CREATE TABLE t_views (
  a_user_id int,
  a_food_id int,
  a_start_ts timestamp,
  a_finish_ts timestamp,
  PRIMARY KEY(a_user_id, a_food_id, a_start_ts),
  UNIQUE(a_user_id, a_food_id, a_finish_ts)
);


