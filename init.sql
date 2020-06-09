CREATE TABLE t_restaurant_chain (
  a_rest_chain_id SERIAL PRIMARY KEY,
  a_name varchar(255) NOT NULL UNIQUE,
  a_score int,
  a_image_url varchar(510)
);

CREATE TABLE t_restaurant (
  a_rest_id SERIAL PRIMARY KEY,
  a_name varchar(255) NOT NULL,
  a_score int,
  a_state varchar(255) NOT NULL,
  a_city varchar(255) NOT NULL,
  a_postal_code varchar(255) NOT NULL,
  a_address varchar(255) NOT NULL,
  a_rest_chain_id int,
  a_created_at timestamp NOT NULL DEFAULT NOW(),
  UNIQUE(a_state, a_city, a_postal_code, a_address),
  FOREIGN KEY (a_rest_chain_id) REFERENCES t_restaurant_chain(a_rest_chain_id)
);

CREATE TABLE t_restaurant_images (
  a_rest_id int,
  a_image_id SERIAL,
  a_image_url varchar(510),
  PRIMARY KEY (a_rest_id, a_image_id),
  FOREIGN KEY (a_rest_id) REFERENCES t_restaurant(a_rest_id)
);

CREATE TABLE t_type (
  a_type_id SERIAL PRIMARY KEY,
  a_type_name varchar(255) UNIQUE,
  a_image_url varchar(510)
);

CREATE TABLE t_ingredient (
  a_ingr_id SERIAL PRIMARY KEY,
  a_ingr_name varchar(255) UNIQUE
);

CREATE TABLE t_user (
  a_user_id SERIAL PRIMARY KEY,
  a_name varchar(255) NOT NULL,
  a_email varchar(255) NOT NULL UNIQUE,
  a_password varchar(255) NOT NULL,
  a_created_at timestamp NOT NULL DEFAULT NOW(),
  a_image_url varchar(510)
);

CREATE TABLE t_characteristic (
  a_char_id SERIAL PRIMARY KEY,
  a_char_name varchar(255) UNIQUE
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
  a_rest_id int NOT NULL,
  a_image_url varchar(510),
  FOREIGN KEY (a_rest_id) REFERENCES t_restaurant(a_rest_id),
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
  a_created_at timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY(a_user_id, a_food_id),
  FOREIGN KEY (a_user_id) REFERENCES t_user(a_user_id),
  FOREIGN KEY (a_food_id) REFERENCES t_food(a_food_id)
);

CREATE TABLE t_owner (
  a_user_id int PRIMARY KEY,
  a_premium_level int NOT NULL,
  FOREIGN KEY (a_user_id) REFERENCES t_user(a_user_id)
);

CREATE TABLE t_owns (
  a_user_id int,
  a_rest_id int,
  PRIMARY KEY(a_rest_id, a_user_id),
  FOREIGN KEY (a_rest_id) REFERENCES t_restaurant(a_rest_id)
);

CREATE TABLE t_food_views (
  a_user_id int,
  a_food_id int,
  a_start_ts timestamp,
  a_finish_ts timestamp,
  PRIMARY KEY(a_user_id, a_food_id, a_start_ts),
  UNIQUE(a_user_id, a_food_id, a_finish_ts)
);

CREATE TABLE t_restaurant_views (
  a_user_id int,
  a_food_id int,
  a_start_ts timestamp,
  a_finish_ts timestamp,
  PRIMARY KEY(a_user_id, a_food_id, a_start_ts),
  UNIQUE(a_user_id, a_food_id, a_finish_ts)
);

-------------------------------------NEW-------------------------------------

INSERT INTO t_user VALUES(DEFAULT, 'user1', 'user1@email.com', '$2b$10$COPBRrctMKsyIF5KCBdzI.1GZAMmC9dVB0Zz1HH/F6PMzplwDOTWO', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser1%40email_com.jpg?alt=media&token=de6b3327-6e3a-4c04-aa22-9a3d4daaad80');
INSERT INTO t_user VALUES(DEFAULT, 'user2', 'user2@email.com', '$2b$10$ygrUw.dcGcj/oaU89A.LeePR20krhdz./FYcY56gL5tnxQVTPe6cW', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser2%40email_com.jpg?alt=media&token=f7ccadfb-b145-4510-bfda-dcbc2fab74fd');
INSERT INTO t_user VALUES(DEFAULT, 'user3', 'user3@email.com', '$2b$10$OmcdC63iByfkE0ZnGwrhu.Kkk5nWper8XxQDXv6kzN4r3AacDP1Wu', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser3%40email_com.jpg?alt=media&token=af14ded9-0f59-4825-8b4e-70c28b069167');
INSERT INTO t_user VALUES(DEFAULT, 'user4', 'user4@email.com', '$2b$10$/elcUPMHXk5B5QT..85ese1V2Vo1znao2uHP014b1.l93NnOitDYG', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser4%40email_com.jpg?alt=media&token=99d30472-9b10-4b00-bfdc-dbcb1390c30e');
INSERT INTO t_user VALUES(DEFAULT, 'user5', 'user5@email.com' ,'$2b$10$tu1t7imPJ.afB.BOFP140uVEHUMKMlqOwKYnUgPGmV3BN8GaA7.Xa', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser5%40email_com.jpg?alt=media&token=9cfe6b05-ff65-448b-b089-8f93109a89ae');
select * from t_user;



