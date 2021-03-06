CREATE TABLE t_restaurant_chain (
  a_rest_chain_id SERIAL PRIMARY KEY,
  a_name varchar(256) NOT NULL UNIQUE,
  a_food_quality_score decimal(10,2) NOT NULL,
  a_presentation_score decimal(10,2) NOT NULL,
  a_price_quality_score decimal(10,2) NOT NULL,
  a_score decimal(10,2),
  a_image_url varchar(512)
);

CREATE TABLE t_restaurant (
  a_rest_id SERIAL PRIMARY KEY,
  a_name varchar(256) NOT NULL,
  a_food_quality_score decimal(10,2) NOT NULL,
  a_presentation_score decimal(10,2) NOT NULL,
  a_price_quality_score decimal(10,2) NOT NULL,
  a_score decimal(10,2),
  a_state varchar(256) NOT NULL,
  a_city varchar(256) NOT NULL,
  a_postal_code varchar(256) NOT NULL,
  a_address varchar(256) NOT NULL,
  a_rest_chain_id int,
  a_premium_level int NOT NULL,
  a_created_at timestamp NOT NULL DEFAULT NOW(),
  UNIQUE(a_state, a_city, a_postal_code, a_address),
  FOREIGN KEY (a_rest_chain_id) REFERENCES t_restaurant_chain(a_rest_chain_id)
);

CREATE TABLE t_restaurant_images (
  a_rest_id int,
  a_image_id SERIAL,
  a_image_url varchar(512),
  a_image_extra varchar(128),
  PRIMARY KEY (a_rest_id, a_image_id),
  FOREIGN KEY (a_rest_id) REFERENCES t_restaurant(a_rest_id) ON DELETE CASCADE
);

CREATE TABLE t_type (
  a_type_id SERIAL PRIMARY KEY,
  a_type_name varchar(256) UNIQUE,
  a_image_url varchar(512)
);

CREATE TABLE t_ingredient (
  a_ingr_id SERIAL PRIMARY KEY,
  a_ingr_name varchar(256) UNIQUE
);

CREATE TABLE t_user (
  a_user_id SERIAL PRIMARY KEY,
  a_name varchar(256) NOT NULL,
  a_gender varchar(32),
  a_birthdate date,
  a_email varchar(256) NOT NULL UNIQUE,
  a_password varchar(256) NOT NULL,
  a_created_at timestamp NOT NULL DEFAULT NOW(),
  a_image_url varchar(512),
  a_is_verified boolean
);

CREATE TABLE t_user_verify (
  a_user_id int PRIMARY KEY,
  a_code varchar(8) NOT NULL,
  a_valid_until date,
  FOREIGN KEY(a_user_id) REFERENCES t_user(a_user_id) ON DELETE CASCADE
);

CREATE TABLE t_characteristic (
  a_char_id SERIAL PRIMARY KEY,
  a_char_name varchar(256) UNIQUE
);

CREATE TABLE t_user_has_characteristic (
  a_user_id int,
  a_char_id int,
  PRIMARY KEY(a_user_id, a_char_id),
  FOREIGN KEY (a_user_id) REFERENCES t_user(a_user_id) ON DELETE CASCADE,
  FOREIGN KEY (a_char_id) REFERENCES t_characteristic(a_char_id) ON DELETE CASCADE
);

CREATE TABLE t_food (
  a_food_id SERIAL PRIMARY KEY,
  a_title varchar(128) NOT NULL,
  a_description varchar(256),
  a_food_quality_score decimal(10,2) NOT NULL,
  a_presentation_score decimal(10,2) NOT NULL,
  a_price_quality_score decimal(10,2) NOT NULL,
  a_score decimal(10,2),
  a_type_id int NOT NULL,
  a_rest_id int NOT NULL,
  a_image_url varchar(512),
  FOREIGN KEY (a_rest_id) REFERENCES t_restaurant(a_rest_id) ON DELETE CASCADE,
  FOREIGN KEY (a_type_id) REFERENCES t_type(a_type_id) ON DELETE CASCADE
);

CREATE TABLE t_food_has_characteristic (
  a_food_id int,
  a_char_id int,
  PRIMARY KEY(a_food_id, a_char_id),
  FOREIGN KEY (a_food_id) REFERENCES t_food(a_food_id) ON DELETE CASCADE,
  FOREIGN KEY (a_char_id) REFERENCES t_characteristic(a_char_id) ON DELETE CASCADE
);

CREATE TABLE t_food_has_ingredient (
  a_food_id int,
  a_ingr_id int,
  PRIMARY KEY(a_food_id, a_ingr_id),
  FOREIGN KEY (a_food_id) REFERENCES t_food(a_food_id) ON DELETE CASCADE,
  FOREIGN KEY (a_ingr_id) REFERENCES t_ingredient(a_ingr_id) ON DELETE CASCADE
);

CREATE TABLE t_review (
  a_review_id SERIAL,
  a_user_id int,
  a_food_id int,
  a_desc varchar(256),
  a_food_quality_score decimal(10,2) NOT NULL,
  a_presentation_score decimal(10,2) NOT NULL,
  a_price_quality_score decimal(10,2) NOT NULL,
  a_score decimal(10,2) NOT NULL,
  a_created_at timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY(a_review_id, a_user_id, a_food_id),
  FOREIGN KEY (a_user_id) REFERENCES t_user(a_user_id) ON DELETE CASCADE,
  FOREIGN KEY (a_food_id) REFERENCES t_food(a_food_id) ON DELETE CASCADE
);

CREATE TABLE t_owns (
  a_user_id int,
  a_rest_id int,
  PRIMARY KEY(a_rest_id, a_user_id),
  FOREIGN KEY (a_user_id) REFERENCES t_user(a_user_id) ON DELETE CASCADE,
  FOREIGN KEY (a_rest_id) REFERENCES t_restaurant(a_rest_id) ON DELETE CASCADE
);

CREATE TABLE t_food_view (
  a_user_id int,
  a_food_id int,
  a_time timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY(a_user_id, a_food_id, a_time),
  FOREIGN KEY(a_user_id) REFERENCES t_user(a_user_id) ON DELETE CASCADE,
  FOREIGN KEY(a_food_id) REFERENCES t_food(a_food_id) ON DELETE CASCADE
);

CREATE TABLE t_restaurant_view (
  a_user_id int,
  a_rest_id int,
  a_time timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY(a_user_id, a_rest_id, a_time),
  FOREIGN KEY(a_user_id) REFERENCES t_user(a_user_id) ON DELETE CASCADE,
  FOREIGN KEY(a_rest_id) REFERENCES t_restaurant(a_rest_id) ON DELETE CASCADE
);