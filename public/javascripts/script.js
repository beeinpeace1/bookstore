function addToCart(e, id){
    e.preventDefault();
    jQuery.post('/cart/add/'+id)
    .then((r)=>{
        jQuery('#cart-total').html(r.total);
    })
}

function removeFromCart(e){
    jQuery('#cart-total').html(jQuery('#cart-total').html() - 1);
}