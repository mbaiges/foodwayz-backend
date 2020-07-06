
insert into t_type values(DEFAULT, 'guiso', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fguiso.jpg?alt=media&token=24ac78c8-19cb-4703-a818-d362a7c4f7a7');
insert into t_type values(DEFAULT, 'hamburguesa', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fhamburguesa.jpg?alt=media&token=d5c5f77e-85c9-40d5-a4e1-c8528230cac7');
insert into t_type values(DEFAULT, 'pasta', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fpasta.jpg?alt=media&token=fa5798e0-6372-41b2-b1bf-ad3b3bf85352');
insert into t_type values(DEFAULT, 'ensalada', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fensalada.jpg?alt=media&token=b385cb89-00b6-442d-9f84-7e033bbc5f8b');
insert into t_type values(DEFAULT, 'mexicana', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Ftacos.jpg?alt=media&token=a218f633-5862-4b79-ada0-3421b7494ceb');
insert into t_type values(DEFAULT, 'sushi', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fsushi.jpg?alt=media&token=3d8ee9f1-bd93-481b-b311-98f5105ee93b');
insert into t_type values(DEFAULT, 'carne', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fcarne.jpg?alt=media&token=3ff4c005-7f5b-4d08-a81c-bef9dfa3db84');
select * from t_type;


insert into t_characteristic values(DEFAULT, 'vegano');
insert into t_characteristic values(DEFAULT, 'vegetariano');
insert into t_characteristic values(DEFAULT, 'celiaco');
insert into t_characteristic values(DEFAULT, 'diabetico');
select * from t_characteristic;


insert into t_ingredient values(DEFAULT, 'tomate');
insert into t_ingredient values(DEFAULT, 'queso');
insert into t_ingredient values(DEFAULT, 'pollo');
insert into t_ingredient values(DEFAULT, 'carne');
insert into t_ingredient values(DEFAULT, 'lentejas');
insert into t_ingredient values(DEFAULT, 'pan');
insert into t_ingredient values(DEFAULT, 'lechuga');
insert into t_ingredient values(DEFAULT, 'zanahoria');
insert into t_ingredient values(DEFAULT, 'cebolla');
insert into t_ingredient values(DEFAULT, 'ketchup');
insert into t_ingredient values(DEFAULT, 'tortilla');
insert into t_ingredient values(DEFAULT, 'frijoles');
insert into t_ingredient values(DEFAULT, 'palta');
insert into t_ingredient values(DEFAULT, 'filadelfia');
insert into t_ingredient values(DEFAULT, 'salmon');
insert into t_ingredient values(DEFAULT, 'arroz');
select * from t_ingredient;


insert into t_restaurant_chain values(DEFAULT, 'McDonalnds', 2, 3, 4, 3, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Frestaurant_chains%2FMcDonalds.jpg?alt=media&token=3585a783-4def-4f26-8523-ec892468fab5');
insert into t_restaurant_chain values(DEFAULT, 'Kansas', 5, 5, 3.5, 4.5, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Frestaurant_chains%2FKansas.png?alt=media&token=e7f29ba5-b6c5-4be1-8628-c85678125795');
select * from t_restaurant_chain;


insert into t_restaurant values(DEFAULT, 'McDonalds del obelisco', 2, 3, 4, 3, 'BSAS', 'CABA', '1234', 'el obelisco 69', 1, 0, DEFAULT);
insert into t_restaurant values(DEFAULT, 'McDonalds del libertador', 5, 5, 3.5, 4.5, 'BSAS', 'CABA', '5678', 'libertador 420', 1, 0, DEFAULT);
insert into t_restaurant values(DEFAULT, 'Kansas de libertador', 2, 3, 4, 3, 'BSAS', 'CABA', '1313', 'libertador 1221', 2, 0, DEFAULT);
insert into t_restaurant values(DEFAULT, 'Kansas de pilar', 4, 5, 5, 4.66, 'BSAS', 'AMBA', '1323', 'pilar 1221', 2, 0, DEFAULT);
insert into t_restaurant values(DEFAULT, 'sushi pop', 2, 2, 2, 2, 'BSAS', 'AMBA', '5677', 'calle falsa 1234', null, 0, DEFAULT);
insert into t_restaurant values(DEFAULT, 'tacos locos', 2, 2, 2, 2, 'BSAS', 'CABA', '1323', 'pilar 1221', null, 0, DEFAULT);
insert into t_restaurant values(DEFAULT, 'morelia', 4, 5, 5, 4.66, 'BSAS', 'CABA', '5378', 'asdf 1221', null, 0, DEFAULT);
insert into t_restaurant values(DEFAULT, 'Crustacio Cascarudo', 2, 2, 2, 2, 'Fondo De Bikini', '-', '1234', 'psherman calle wallaby 42', null, 0, DEFAULT);
select * from t_restaurant;


insert into t_food values(DEFAULT, 'BigMac', 'Tremenda Glucemia', 3, 2, 1, 2, 2, 1, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FBigMac.jpg?alt=media&token=91942492-25c1-47b8-ae13-840a0d51c779');
insert into t_food values(DEFAULT, 'Burrito de Fideos', 'Mex mex go!', 5, 5, 5, 5, 5, 6, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FBurritoDeFideos.jpg?alt=media&token=e1f1d51c-345c-4ad8-b2d2-a1473da64854');
insert into t_food values(DEFAULT, 'Kangreburger', 'La mejor debajo del mar. Formula SECRETA!', 5, 2, 2, 3, 2, 8, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FCangreBurger.jpg?alt=media&token=6ac4357e-7e06-418b-81d4-b00568b82a6d');
insert into t_food values(DEFAULT, 'Crispy Burger', 'Gabi ya la comio! Y vos?', 2, 2, 2, 2, 2, 2, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FCrispyBurger.jpg?alt=media&token=0733845d-8f24-4dbd-a305-6e3f6bd23522');
insert into t_food values(DEFAULT, 'Ensalada De Kansas', 'Cuando se acaban los pancitos, RIP.', 3, 4, 3, 3.33, 4, 3, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FEnsalada1.jpg?alt=media&token=03fab50a-7eef-48b6-b594-00997cb73eff');
insert into t_food values(DEFAULT, 'Ensalada Blen', 'Aglomerado de hojas verdes acompañado de variedad de pimientos exoticos del himalaya.', 4, 4, 4, 4, 4, 8, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FEnsaladaBlen.jpg?alt=media&token=ef664121-4240-4548-8316-469be60c4965');
insert into t_food values(DEFAULT, 'Guiso de Lentejas', '15p', 5, 1, 5, 3.66, 1, 6, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FGuisoDeLentejas.jpg?alt=media&token=9c673f75-29ac-49c1-b4dd-d0c683ec2b0f');
insert into t_food values(DEFAULT, 'Guiso de Papa', '30p', 2, 1, 4, 2.33, 1, 4, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FGuisoDePapa.jpg?alt=media&token=c77632df-0293-4a6c-bfec-697412071ca8');
insert into t_food values(DEFAULT, 'Hawaian Stake', 'Trump approves.', 3, 5, 3, 3.66, 7, 3, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FHawaianStake.jpg?alt=media&token=53510f3a-5283-4737-aee3-3b6c3a536d1b');
insert into t_food values(DEFAULT, 'Kansas Ribs', 'Calentitas calentitas.', 3, 5, 3, 3.66, 7, 3, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FKansasRibs.jpg?alt=media&token=bcc0f048-3287-4fe0-ac9b-2e186057f792');
insert into t_food values(DEFAULT, 'Nigiris de Camaron', 'Debaaajo del maaaar, debajo del mar..', 3, 5, 3, 3.66, 6, 5, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FNigirisDeCamaron.jpg?alt=media&token=14c458f4-18b1-4371-88d4-dcb68ac20256');
insert into t_food values(DEFAULT, 'NYC Phila', null, 4, 6, 5, 5, 6, 5, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FSushi1.jpg?alt=media&token=1836f52c-6ad4-48c7-8c44-9a99ae73102b');
insert into t_food values(DEFAULT, 'Triple Taco', 'El que se comió la abuela Coco antes de quedarla.',  5, 5, 2, 4, 5, 6, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FTripleTaco.jpg?alt=media&token=aedb2c3e-73c2-49c5-8ec7-1b4e1e2f0e21');
select * from t_food;

INSERT INTO t_user VALUES(DEFAULT, 'user1', null, null, 'user1@email.com', '$2b$10$COPBRrctMKsyIF5KCBdzI.1GZAMmC9dVB0Zz1HH/F6PMzplwDOTWO', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser1%40email_com.jpg?alt=media&token=de6b3327-6e3a-4c04-aa22-9a3d4daaad80', true);
INSERT INTO t_user VALUES(DEFAULT, 'user2', null, null, 'user2@email.com', '$2b$10$ygrUw.dcGcj/oaU89A.LeePR20krhdz./FYcY56gL5tnxQVTPe6cW', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser2%40email_com.jpg?alt=media&token=f7ccadfb-b145-4510-bfda-dcbc2fab74fd', true);
INSERT INTO t_user VALUES(DEFAULT, 'user3', null, null, 'user3@email.com', '$2b$10$OmcdC63iByfkE0ZnGwrhu.Kkk5nWper8XxQDXv6kzN4r3AacDP1Wu', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser3%40email_com.jpg?alt=media&token=af14ded9-0f59-4825-8b4e-70c28b069167', true);
INSERT INTO t_user VALUES(DEFAULT, 'user4', null, null, 'user4@email.com', '$2b$10$/elcUPMHXk5B5QT..85ese1V2Vo1znao2uHP014b1.l93NnOitDYG', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser4%40email_com.jpg?alt=media&token=99d30472-9b10-4b00-bfdc-dbcb1390c30e', true);
INSERT INTO t_user VALUES(DEFAULT, 'user5', null, null, 'user5@email.com' ,'$2b$10$tu1t7imPJ.afB.BOFP140uVEHUMKMlqOwKYnUgPGmV3BN8GaA7.Xa', DEFAULT, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Fusers%2Fuser5%40email_com.jpg?alt=media&token=9cfe6b05-ff65-448b-b089-8f93109a89ae', true);
select * from t_user;

INSERT INTO t_review VALUES(DEFAULT, 1, 1, 'moito ustoso', 1, 2, 3, 2, DEFAULT);
INSERT INTO t_review VALUES(DEFAULT, 1, 2, 'meh', 4, 5, 5, 4.66, DEFAULT);
INSERT INTO t_review VALUES(DEFAULT, 1, 3, 're piolin', 3, 1, 3, 2.33, DEFAULT);
INSERT INTO t_review VALUES(DEFAULT, 1, 4, 'bastante ben', 2, 2, 2, 2, DEFAULT);
INSERT INTO t_review VALUES(DEFAULT, 2, 3, 'no tan rico', 1, 5, 5, 3.66, DEFAULT);
INSERT INTO t_review VALUES(DEFAULT, 3, 4, 'yay', 5, 5, 5, 5, DEFAULT);
INSERT INTO t_review VALUES(DEFAULT, 4, 5, 'seeee', 5, 5, 3.5, 4.5, DEFAULT);
INSERT INTO t_review VALUES(DEFAULT, 5, 5, 'hmmm', 0, 4.5, 0, 1.5, DEFAULT);
select * from t_review;

INSERT INTO t_food_has_characteristic VALUES(1, 4);
INSERT INTO t_food_has_characteristic VALUES(2, 2);
INSERT INTO t_food_has_characteristic VALUES(2, 4);
INSERT INTO t_food_has_characteristic VALUES(3, 4);
INSERT INTO t_food_has_characteristic VALUES(4, 4);
INSERT INTO t_food_has_characteristic VALUES(5, 1);
INSERT INTO t_food_has_characteristic VALUES(5, 3);
INSERT INTO t_food_has_characteristic VALUES(5, 4);
INSERT INTO t_food_has_characteristic VALUES(6, 1);
INSERT INTO t_food_has_characteristic VALUES(6, 3);
INSERT INTO t_food_has_characteristic VALUES(6, 4);
INSERT INTO t_food_has_characteristic VALUES(7, 3);
INSERT INTO t_food_has_characteristic VALUES(8, 3);
INSERT INTO t_food_has_characteristic VALUES(9, 4);
INSERT INTO t_food_has_characteristic VALUES(10, 4);
INSERT INTO t_food_has_characteristic VALUES(11, 3);
INSERT INTO t_food_has_characteristic VALUES(11, 4);
INSERT INTO t_food_has_characteristic VALUES(12, 4);
INSERT INTO t_food_has_characteristic VALUES(12, 3);
INSERT INTO t_food_has_characteristic VALUES(13, 4);
select * from t_food_has_characteristic;


INSERT INTO t_food_has_ingredient VALUES(1, 2);
INSERT INTO t_food_has_ingredient VALUES(1, 4);
INSERT INTO t_food_has_ingredient VALUES(1, 6);
INSERT INTO t_food_has_ingredient VALUES(1, 7);
INSERT INTO t_food_has_ingredient VALUES(1, 9);
INSERT INTO t_food_has_ingredient VALUES(1, 10);
INSERT INTO t_food_has_ingredient VALUES(2, 11);
INSERT INTO t_food_has_ingredient VALUES(3, 2);
INSERT INTO t_food_has_ingredient VALUES(3, 4);
INSERT INTO t_food_has_ingredient VALUES(3, 6);
INSERT INTO t_food_has_ingredient VALUES(3, 7);
INSERT INTO t_food_has_ingredient VALUES(3, 9);
INSERT INTO t_food_has_ingredient VALUES(3, 10);
INSERT INTO t_food_has_ingredient VALUES(4, 2);
INSERT INTO t_food_has_ingredient VALUES(4, 4);
INSERT INTO t_food_has_ingredient VALUES(4, 6);
INSERT INTO t_food_has_ingredient VALUES(4, 7);
INSERT INTO t_food_has_ingredient VALUES(4, 9);
INSERT INTO t_food_has_ingredient VALUES(4, 10);
INSERT INTO t_food_has_ingredient VALUES(5, 2);
INSERT INTO t_food_has_ingredient VALUES(5, 6);
INSERT INTO t_food_has_ingredient VALUES(5, 7);
INSERT INTO t_food_has_ingredient VALUES(6, 1);
INSERT INTO t_food_has_ingredient VALUES(6, 2);
INSERT INTO t_food_has_ingredient VALUES(6, 3);
INSERT INTO t_food_has_ingredient VALUES(6, 7);
INSERT INTO t_food_has_ingredient VALUES(6, 8);
INSERT INTO t_food_has_ingredient VALUES(6, 9);
INSERT INTO t_food_has_ingredient VALUES(7, 2);
INSERT INTO t_food_has_ingredient VALUES(7, 3);
INSERT INTO t_food_has_ingredient VALUES(7, 4);
INSERT INTO t_food_has_ingredient VALUES(7, 5);
INSERT INTO t_food_has_ingredient VALUES(7, 9);
INSERT INTO t_food_has_ingredient VALUES(7, 12);
INSERT INTO t_food_has_ingredient VALUES(8, 5);
INSERT INTO t_food_has_ingredient VALUES(8, 4);
INSERT INTO t_food_has_ingredient VALUES(8, 9);
INSERT INTO t_food_has_ingredient VALUES(8, 12);
INSERT INTO t_food_has_ingredient VALUES(9, 4);
INSERT INTO t_food_has_ingredient VALUES(9, 10);
INSERT INTO t_food_has_ingredient VALUES(10, 4);
INSERT INTO t_food_has_ingredient VALUES(11, 13);
INSERT INTO t_food_has_ingredient VALUES(11, 14);
INSERT INTO t_food_has_ingredient VALUES(11, 16);
INSERT INTO t_food_has_ingredient VALUES(12, 13);
INSERT INTO t_food_has_ingredient VALUES(12, 14);
INSERT INTO t_food_has_ingredient VALUES(12, 15);
INSERT INTO t_food_has_ingredient VALUES(12, 16);
INSERT INTO t_food_has_ingredient VALUES(13, 2);
INSERT INTO t_food_has_ingredient VALUES(13, 3);
INSERT INTO t_food_has_ingredient VALUES(13, 9);
INSERT INTO t_food_has_ingredient VALUES(13, 11);
INSERT INTO t_food_has_ingredient VALUES(13, 12);
INSERT INTO t_food_has_ingredient VALUES(13, 13);
select * from t_food_has_ingredient;


INSERT INTO t_owns VALUES(2,1);
INSERT INTO t_owns VALUES(2,2);
INSERT INTO t_owns VALUES(3,3);
INSERT INTO t_owns VALUES(3,4);
INSERT INTO t_owns VALUES(2,8);
INSERT INTO t_owns VALUES(4,5);
INSERT INTO t_owns VALUES(4,6);
INSERT INTO t_owns VALUES(4,7);
select * from t_owns;


INSERT INTO t_user_has_characteristic VALUES(2, 1);
INSERT INTO t_user_has_characteristic VALUES(2, 4);
select * from t_user_has_characteristic;