
select * from t_user;

insert into t_type values(1, 'guiso', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fguiso.jpg?alt=media&token=24ac78c8-19cb-4703-a818-d362a7c4f7a7');
insert into t_type values(2, 'hamburguesa', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fhamburguesa.jpg?alt=media&token=d5c5f77e-85c9-40d5-a4e1-c8528230cac7');
insert into t_type values(3, 'pasta', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fpasta.jpg?alt=media&token=fa5798e0-6372-41b2-b1bf-ad3b3bf85352');
insert into t_type values(4, 'ensalada', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fensalada.jpg?alt=media&token=b385cb89-00b6-442d-9f84-7e033bbc5f8b');
insert into t_type values(5, 'mexicana', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Ftacos.jpg?alt=media&token=a218f633-5862-4b79-ada0-3421b7494ceb');
insert into t_type values(6, 'sushi', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fsushi.jpg?alt=media&token=3d8ee9f1-bd93-481b-b311-98f5105ee93b');
insert into t_type values(7, 'carne', 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ftypes%2Fcarne.jpg?alt=media&token=3ff4c005-7f5b-4d08-a81c-bef9dfa3db84');
select * from t_type;

insert into t_characteristic values(1, 'vegano');
insert into t_characteristic values(2, 'vegetariano');
insert into t_characteristic values(3, 'celiaco');
insert into t_characteristic values(4, 'diabetico');
select * from t_characteristic;

insert into t_ingredient values(1, 'tomate');
insert into t_ingredient values(2, 'queso');
insert into t_ingredient values(3, 'pollo');
insert into t_ingredient values(4, 'carne');
insert into t_ingredient values(5, 'lentejas');
insert into t_ingredient values(6, 'pan');
insert into t_ingredient values(7, 'lechuga');
insert into t_ingredient values(8, 'zanahorai');
insert into t_ingredient values(9, 'cebolla');
insert into t_ingredient values(10, 'ketchup');
insert into t_ingredient values(11, 'tortilla');
insert into t_ingredient values(12, 'frijoles');
insert into t_ingredient values(13, 'palta');
insert into t_ingredient values(14, 'filadelfia');
insert into t_ingredient values(15, 'salmon');
insert into t_ingredient values(16, 'arroz');
select * from t_ingredient;

insert into t_restaurant_chain values(1, 'McDonalnds', 3.5, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Frestaurant_chains%2FMcDonalds.jpg?alt=media&token=3585a783-4def-4f26-8523-ec892468fab5');
insert into t_restaurant_chain values(2, 'Kansas', 4.5, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Frestaurant_chains%2FKansas.png?alt=media&token=e7f29ba5-b6c5-4be1-8628-c85678125795');
select * from t_restaurant_chain;

insert into t_restaurant values(1, 'McDonalds del obelisco', 1.2, 'BSAS', 'CABA', '1234', 'el obelisco 69', 1);
insert into t_restaurant values(2, 'McDonalds del libertador', 1.2, 'BSAS', 'CABA', '5678', 'libertador 420', 1);
insert into t_restaurant values(3, 'Kansas de libertador', 1.2, 'BSAS', 'CABA', '1313', 'libertador 1221', 2);
insert into t_restaurant values(4, 'Kansas de pilar', 1.2, 'BSAS', 'AMBA', '1323', 'pilar 1221', 2);
insert into t_restaurant values(5, 'sushi pop', 3, 'BSAS', 'AMBA', '5677', 'calle falsa 1234', null);
insert into t_restaurant values(6, 'tacos locos', 4, 'BSAS', 'CABA', '1323', 'pilar 1221', null);
insert into t_restaurant values(7, 'morelia', 2, 'BSAS', 'CABA', '5378', 'asdf 1221', null);
insert into t_restaurant values(8, 'Crustacio Cascarudo', 2, 'Fondo De Bikini', '-', '1234', 'psherman calle wallaby 42', null);
select * from t_restaurant;

insert into t_food values(1, 'BigMac', 3, 2, 1, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FBigMac.jpg?alt=media&token=91942492-25c1-47b8-ae13-840a0d51c779');
insert into t_food values(2, 'Burrito de Fideos', 5, 5, 6, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FBurritoDeFideos.jpg?alt=media&token=e1f1d51c-345c-4ad8-b2d2-a1473da64854');
insert into t_food values(3, 'Kangreburger', 5, 2, 8, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FCangreBurger.jpg?alt=media&token=6ac4357e-7e06-418b-81d4-b00568b82a6d');
insert into t_food values(4, 'Crispy Burger', 2, 2, 2, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FCrispyBurger.jpg?alt=media&token=0733845d-8f24-4dbd-a305-6e3f6bd23522');
insert into t_food values(5, 'Ensalada De Kansas', 3, 4, 3, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FEnsalada1.jpg?alt=media&token=03fab50a-7eef-48b6-b594-00997cb73eff');
insert into t_food values(6, 'Ensalada Blen', 4, 4, 8, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FEnsaladaBlen.jpg?alt=media&token=ef664121-4240-4548-8316-469be60c4965');
insert into t_food values(7, 'Guiso de Lentejas', 5, 1, 6, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FGuisoDeLentejas.jpg?alt=media&token=9c673f75-29ac-49c1-b4dd-d0c683ec2b0f');
insert into t_food values(8, 'Guiso de Papa', 2, 1, 4, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FGuisoDePapa.jpg?alt=media&token=c77632df-0293-4a6c-bfec-697412071ca8');
insert into t_food values(9, 'Hawaian Stake', 3, 7, 3, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FHawaianStake.jpg?alt=media&token=53510f3a-5283-4737-aee3-3b6c3a536d1b');
insert into t_food values(10, 'Kansas Ribs', 3, 7, 3, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FKansasRibs.jpg?alt=media&token=bcc0f048-3287-4fe0-ac9b-2e186057f792');
insert into t_food values(11, 'Nigiris de Camaron', 3, 6, 5, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FNigirisDeCamaron.jpg?alt=media&token=14c458f4-18b1-4371-88d4-dcb68ac20256');
insert into t_food values(12, 'NYC Phila', 4, 6, 5, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FSushi1.jpg?alt=media&token=1836f52c-6ad4-48c7-8c44-9a99ae73102b');
insert into t_food values(13, 'Triple Taco', 5, 5, 6, 'https://firebasestorage.googleapis.com/v0/b/foodwayz-e9a26.appspot.com/o/images%2Ffoods%2FTripleTaco.jpg?alt=media&token=aedb2c3e-73c2-49c5-8ec7-1b4e1e2f0e21');
select * from t_food;

