const axios = require('axios');
// const jwt = require('jsonwebtoken');

module.exports = (app, passport) => {

    app.post('/bill', async (req, res) => {
        const userData = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users/${req.session.passport.user.username}/bill.json`);
        const products = JSON.parse(req.body.products).map(e => {
            return {
                product: {
                    description: e.title,
                    product_key: '60131324',
                    price: parseInt(e.price.slice(1))*parseInt(e.qty),
                }
            }
        });
        try {
            // Importa el constructor del cliente
            const Facturapi = require('facturapi');
            // Crea una instancia del cliente usando tu llave secreta
            const facturapi = new Facturapi('sk_test_K8n29vZ0YlpA45YmDjxdqgjzR7QDGXNx');
            const invoice = await facturapi.invoices.create({
                customer: {
                    legal_name: userData.data.first_name.concat(userData.data.last_name),
                    email: userData.data.email,
                    tax_id: userData.data.rfc
                },
                items: products,
                payment_form: Facturapi.PaymentForm.DINERO_ELECTRONICO
            });
            await facturapi.invoices.sendByEmail(invoice.id);
            return res.status(200).send();
        } catch (e) {
            return res.status(502).send(e);
        }
    });

    app.get('/admin', isLoggedIn, async (req, res) => {
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

    app.get('/account', isLoggedIn, async (req, res) => {
        res.render('account', {
            username: req.session.passport.user.username,
            isLogged: req.isAuthenticated(),
            isAdmin: req.isAuthenticated() ? req.session.passport.user.isAdmin : false
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/index',
        failureRedirect: '/login',
        failureFlash: true //que se muestren los mensajes
    }));

    app.get('/login', async (req, res) => {
        if (req.isAuthenticated()) { //mehtodo de passport
            res.redirect('/account');
        } else {
            res.render('login', {
                message: req.flash('loginMessage')
            });
        }
    });

    app.get('/cart', isLoggedIn, async (req, res) => {
        res.render('cart', {
            isLogged: req.isAuthenticated(),
            isAdmin: req.isAuthenticated() ? req.session.passport.user.isAdmin : false
        });
    });

    app.get('/product-details', async (req, res) => {

        const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products/${req.query.productId}.json`);
        // console.log(JSON.stringify(DBRes.data),null,2);
        res.render('product-details', {
            product: DBRes.data,
            isLogged: req.isAuthenticated(),
            isAdmin: req.isAuthenticated() ? req.session.passport.user.isAdmin : false
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
            products,
            isLogged: req.isAuthenticated(),
            isAdmin: req.isAuthenticated() ? req.session.passport.user.isAdmin : false
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
};

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) { //metodo de passport
        return next();
    } else {
        res.redirect('/login');
    }
};