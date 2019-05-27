document.querySelector('.amado-btn').addEventListener('click', (event) => {
    const product = {
        title: document.querySelector('h6').innerHTML,
        price: document.querySelector('.product-price').innerHTML,
        image: document.querySelector('.gallery_img img').src,
        qty: document.querySelector('.qty-text').value,
        productId: location.search.split('=')[1]
    };
    // console.log(product);
    const productsItem = localStorage.getItem('products');

    if(productsItem != null) {
        updateLocalStorage(product);
    } else {
        localStorage.clear();
        localStorage.setItem('products', '[]');
        localStorage.setItem('totalProductsCart', '0');
        updateLocalStorage(product);
    }
    window.location.href = "/cart";
});

let updateLocalStorage = (product) => {
    const productsItems = JSON.parse(localStorage.getItem('products'));
    const totalProductsCart = parseInt(localStorage.getItem('totalProductsCart')) + parseInt(product.qty);
    productsItems.push(product);
    localStorage.setItem('products', JSON.stringify(productsItems));
    localStorage.setItem('totalProductsCart', totalProductsCart.toString());
};