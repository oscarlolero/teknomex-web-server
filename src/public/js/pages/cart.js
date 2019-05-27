window.onload = () => {
    const productItems = JSON.parse(localStorage.getItem('products'));
    const totalTable = document.querySelector('.summary-table');
    let lookup = '';
    let total = 0;
    let counter = 0;
    if(productItems != null) {
        productItems.forEach((product) => {
            total += (parseInt(product.price.slice(1)) * parseInt(product.qty));
            // lookup = lookup.concat(`<tr> <td class="cart_product_img"> <a href="#"><img src="${product.image}" alt="Product"></a> </td> <td class="cart_product_desc"> <h5>${product.title}</h5> </td> <td class="price"> <span>${product.price}</span> </td> <td class="qty"> <div class="qty-btn d-flex"> <p>Qty</p> <div class="quantity"> <span class="qty-minus" onclick="var effect = document.getElementById(\'qty${counter}\'); var qty = effect.value; if( !isNaN( qty ) &amp;&amp; qty &gt; 1 ) effect.value--; return false;"><i class="fa fa-minus" aria-hidden="true"></i></span> <input type="number" class="qty-text" id="qty${counter}" step="1" min="1" max="300" name="quantity" value="${product.qty}"> <span class="qty-plus" onclick="var effect = document.getElementById(\'qty${counter}\'); var qty = effect.value; if( !isNaN( qty )) effect.value++; return false;"><i class="fa fa-plus" aria-hidden="true"></i></span> </div> </div> </td> </tr>`);
            lookup = lookup.concat(`<tr> <td class="cart_product_img"> <a href="#"><img src="${product.image}" alt="Product"></a> </td> <td class="cart_product_desc"> <h5>${product.title}</h5> </td> <td class="price"> <span>${product.price}</span> </td> <td class="qty"> <div class="qty-btn d-flex"> <p>Cant.</p> <div class="quantity"> <input disabled type="number" class="qty-text" id="qty${counter}" step="1" min="1" max="300" name="quantity" value="${product.qty}"></div> </div> </td> </tr>`);
            counter++;
        });
        document.querySelector('tbody').innerHTML = lookup;
        lookup = `<li><span>subtotal:</span> <span>$${total}</span></li> <li><span>envío:</span> <span>Gratis</span></li> <li><span>total:</span> <span>$${total}</span></li>`;
        totalTable.innerHTML = lookup;
    } else {
        document.querySelector('tbody').innerHTML = 'No hay productos en tu carrito.';
    }

};

document.querySelector('.finalizar').addEventListener('click', () => {
    if (document.getElementById('facturar').checked) {
        axios.post('/bill', {localStorage, requireBill: true}).then(() => {
            localStorage.clear();
            location.pathname = 'index';
        });
    } else {
        axios.post('/bill', {localStorage, requireBill: false}).then(() => {
            localStorage.clear();
            location.pathname = 'index';
        });
    }
});
document.querySelector('.vaciar').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});
