const axios = require('axios');
// const jwt = require('jsonwebtoken');

module.exports = (app, passport) => {

    app.get('/admin', async (req, res) => {
        const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products.json`);
        const products = Object.entries(DBRes.data).map((element) => {
            return {
                productId: element[0],
                productData: element[1]
            }
        });
        res.render('admin', {
            products
        });
    });

    app.get('/account', async (req, res) => {
        res.render('account');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/cart',
        failureRedirect: '/login',
        failureFlash: true //que se muestren los mensajes
    }));

    app.get('/login', async (req, res) => {
        if(req.isAuthenticated()) { //mehtodo de passport
            res.redirect('/account');
        } else {
            res.render('login', {
                message: req.flash('loginMessage')
            });
        }
    });

    app.get('/cart', async (req, res) => {
        res.render('cart');
    });

    app.get('/product-details', async (req, res) => {

        const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products/${req.query.productId}.json`);
        // console.log(JSON.stringify(DBRes.data),null,2);
        res.render('product-details', {
            product: DBRes.data
        });
    });

    app.get('/index', async (req, res) => {
        const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products.json`);
        // console.log(JSON.stringify(Object.entries(DBRes.data)[0],null,2));

        const products = Object.entries(DBRes.data).map((element) => {
            return {
                productId: element[0],
                productData: element[1]
            }
        });
        // console.log(JSON.stringify(products,null,2));
        res.render('index', {
            products
        });
    });

    app.post('/user/login', async (req, res) => {
        try {
            const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users/${req.body.username}.json`);
            console.log(Object.values(DBRes.data)[0]);
            if (!DBRes.data) {
                return res.status(401).send(JSON.stringify({
                    'message': 'USER_NOT_FOUND'
                }));
            } else if (Object.values(DBRes.data)[2] !== req.body.password) {
                return res.status(401).send(JSON.stringify({
                    'message': 'INVALID_PASSWORD'
                }));
            } else {
                return res.status(200).send(JSON.stringify({
                    // 'userId': Object.keys(DBRes.data)[1],
                    // 'token': 'token_123123',
                    'isAdmin': Object.values(DBRes.data)[0]
                }));
            }
        } catch (e) {
            return res.status(502).send(JSON.stringify({
                'message': 'DB_CONNECTION_ERROR'
            }));
        }
    });

    app.put('/user', async (req, res) => {
        let DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users/${req.body.username}.json`);
        if (!DBRes.data) {
            DBRes = await axios.post(`https://flutter-products-3e91e.firebaseio.com/users/${req.body.username}.json`, req.body);
            res.status(200).send(JSON.stringify({
                'sucess': true,
                'data': DBRes.data.name
            }));
        } else {
            return res.status(200).send(JSON.stringify({
                'sucess': false,
                'message': 'USER_EXISTS'
            }));
        }
    });
    app.post('/product', async (req, res) => {
        const DBRes = await axios.post(`https://flutter-products-3e91e.firebaseio.com/products.json`, req.body);
        console.log();
        res.status(200).send(JSON.stringify({
            'productId': DBRes.data.name
        }));
    });

    app.get('/products', async (req, res) => {
        const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products.json`);
        res.status(200).send(DBRes.data);
    });

    // app.get('/cart', async (req, res) => {
    //     const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users/${req.query.username}.json`);
    //     const productsList = Object.values(DBRes.data)[0].cart;
    //
    //
    //     res.status(200).send();
    // });

    // app.post('/cart', async (req, res) => {
    //     let DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users/${req.query.username}/cart.json`);
    //     const newProductList = DBRes.data;
    //     newProductList.push(req.body.newProduct[0]);
    //     DBRes = await axios.patch(`https://flutter-products-3e91e.firebaseio.com/users/${req.query.username}.json`, {"cart": newProductList});
    //     res.status(200).send(DBRes.data);
    // });

};