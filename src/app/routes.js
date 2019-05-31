const axios = require('axios');
// const jwt = require('jsonwebtoken');

module.exports = (app, passport) => {

    app.post('/mobile/bill', async (req, res) => {
        try {
            Object.entries(req.body).forEach(async (cartItem) => {
                if(typeof cartItem[1].requireBill === 'undefined') {
                    const actualStock = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products/${cartItem[1].productId}.json`);
                    const finalStock = parseInt(actualStock.data.stock) - cartItem[1].qty;
                    axios.patch(`https://flutter-products-3e91e.firebaseio.com/products/${cartItem[1].productId}.json`, {stock: finalStock});
                    axios.post(`https://flutter-products-3e91e.firebaseio.com/sales.json`, {
                        title: cartItem[1].title,
                        price: '$'.concat(cartItem[1].price.toString()),
                        qty: cartItem[1].qty
                    });
                }
            });
            //aqui se guarda el requireBill y username
            const aditionalData = req.body[Object.keys(req.body)[Object.keys(req.body).length - 1]];
            if(aditionalData.requireBill === true) {
                const products = req.body.filter(e => typeof e.requireBill === 'undefined').map(cartItem => {
                    return {
                        product: {
                            description: cartItem.title,
                            product_key: '60131324',
                            price: parseInt(cartItem.price) * parseInt(cartItem.qty),
                        }
                    }
                });
                const userData = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users/${aditionalData.username}/bill.json`);
                // Importa el constructor del cliente
                const Facturapi = require('facturapi');
                // Crea una instancia del cliente usando tu llave secreta
                const facturapi = new Facturapi('sk_test_2vx5r3aPR0ZAX09D4brLlAljy9XLe4Y7');
                const invoice = await facturapi.invoices.create({
                    customer: {
                        legal_name: userData.data.first_name.concat(` ${userData.data.last_name}`),
                        email: userData.data.email,
                        tax_id: userData.data.rfc
                    },
                    items: products,
                    payment_form: Facturapi.PaymentForm.DINERO_ELECTRONICO
                });
                await facturapi.invoices.sendByEmail(invoice.id);
            }

            return res.status(200).send();
        } catch (e) {
            console.log(e);
            return res.status(502).send();
        }

    });

    app.post('/bill', async (req, res) => {
        const products = JSON.parse(req.body.localStorage.products).map(e => {
            return {
                product: {
                    description: e.title,
                    product_key: '60131324',
                    price: parseInt(e.price.slice(1)) * parseInt(e.qty),
                }
            }
        });

        if (req.body.requireBill) {
            const userData = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users/${req.session.passport.user.username}/bill.json`);
            try {
                // Importa el constructor del cliente
                const Facturapi = require('facturapi');
                // Crea una instancia del cliente usando tu llave secreta
                const facturapi = new Facturapi('sk_test_2vx5r3aPR0ZAX09D4brLlAljy9XLe4Y7');
                const invoice = await facturapi.invoices.create({
                    customer: {
                        legal_name: userData.data.first_name.concat(` ${userData.data.last_name}`),
                        email: userData.data.email,
                        tax_id: userData.data.rfc
                    },
                    items: products,
                    payment_form: Facturapi.PaymentForm.DINERO_ELECTRONICO
                });
                await facturapi.invoices.sendByEmail(invoice.id);

                JSON.parse(req.body.localStorage.products).forEach(async e => {
                    const actualStock = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products/${e.productId}.json`);
                    const finalStock = parseInt(actualStock.data.stock) - e.qty;
                    axios.patch(`https://flutter-products-3e91e.firebaseio.com/products/${e.productId}.json`, {stock: finalStock});
                    axios.post(`https://flutter-products-3e91e.firebaseio.com/sales.json`, {
                        title: e.title,
                        price: e.price,
                        qty: e.qty
                    });
                });
                return res.status(200).send();
            } catch (e) {
                return res.status(502).send(e);
            }
        }

        JSON.parse(req.body.localStorage.products).forEach(async e => {
            const actualStock = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products/${e.productId}.json`);
            const finalStock = parseInt(actualStock.data.stock) - e.qty;
            axios.patch(`https://flutter-products-3e91e.firebaseio.com/products/${e.productId}.json`, {stock: finalStock});
            axios.post(`https://flutter-products-3e91e.firebaseio.com/sales.json`, {
                title: e.title,
                price: e.price,
                qty: e.qty
            });
        });
        return res.status(200).send();
    });

    app.get('/admin', isLoggedIn, async (req, res) => {
        let data;
        switch (req.query.mode) {
            case 'products': {
                const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/products.json`);
                data = Object.entries(DBRes.data).map((element) => {
                    return {
                        productId: element[0],
                        productData: element[1]
                    }
                });
                break;
            }
            case 'clients': {
                const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users.json`);

                data = Object.entries(DBRes.data).map(e => {
                    return e[1];
                });
                break;
            }
            case 'sales': {
                const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/sales.json`);
                data = Object.entries(DBRes.data).map(e => {
                    return e[1];
                });
            }
        }

        res.render('admin', {
            data,
            mode: req.query.mode
        });
    });

    app.get('/account', isLoggedIn, async (req, res) => {
        res.render('account', {
            username: req.session.passport.user.username,
            isLogged: req.isAuthenticated(),
            isAdmin: req.isAuthenticated() ? req.session.passport.user.isAdmin : false
        });
    });

    app.post('/register', async (req, res) => {
        try {
            await axios.put(`https://flutter-products-3e91e.firebaseio.com/users/${req.body.username}.json`, {
                username: req.body.username,
                password: req.body.password,
                isAdmin: false,
                bill: {
                    adress: '',
                    city: '',
                    cp: '',
                    email: '',
                    first_name: '',
                    last_name: '',
                    phone: '',
                    rfc: ''
                }
            });
        } catch (e) {
            res.redirect('/login?mode=registerFAILED');
        }
        res.redirect('/login');
    });

    app.get('/logout', (req, res) => {
        if (req.isAuthenticated()) { //mehtodo de passport
            req.logout();
        }
        res.redirect('/index');
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
                    'isAdmin': Object.values(DBRes.data)[1]
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
            DBRes = await axios.put(`https://flutter-products-3e91e.firebaseio.com/users/${req.body.username}.json`, req.body);
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
    if (req.isAuthenticated()) { //metodo de passport
        return next();
    } else {
        res.redirect('/login');
    }
};