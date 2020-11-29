getStorage()

if(document.readyState == "loading"){
    document.addEventListener("DOMContentLoaded", ready)
}
else{
    ready()
}

function ready(){
    var removeCartItemButton = document.getElementsByClassName("btn-danger")
    for(var i = 0; i < removeCartItemButton.length; i++){
        var button = removeCartItemButton[i]
        button.addEventListener("click", removeCartItem)
    }
    var quantityInputs = document.getElementsByClassName("cart-quantity-input")
    for(var i = 0; i < quantityInputs.length; i++){
        var input = quantityInputs[i]
        input.addEventListener("change", quantityChanger)
    }
    var addToCartButtons = document.getElementsByClassName("shop-item-button")
    for(var i = 0; i < addToCartButtons.length; i++){
        var button = addToCartButtons[i]
        button.addEventListener("click", addToCartClick)
    }

    document.getElementsByClassName("btn-purchase")[0].addEventListener("click", purchasedClicked)

}
function removeCartItem(event){
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()

    updateCartTotal()

}

function addToCartClick(event){
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText
    var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText
    var image = shopItem.getElementsByClassName("shop-item-image")[0].src
    var id = shopItem.dataset.itemId
    addItemToCart(title, price, image, id)
    updateCartTotal()

}
function addItemToCart(title, price,image, id){
    var cartRow = document.createElement("div")
    cartRow.classList.add("cart-row")
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName("cart-items")[0]

    var cartItemNames = cartItems.getElementsByClassName("cart-item-title")
    for(var i = 0; i < cartItemNames.length; i++){
        if(cartItemNames[i].innerText == title){
            alert("This item is already in your cart")
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${image}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>
    `
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)

    cartRow.getElementsByClassName("btn-danger")[0].addEventListener("click", removeCartItem)
    cartRow.getElementsByClassName("cart-quantity-input")[0].addEventListener("change", quantityChanger)
    
}

function quantityChanger(event){
    var input = event.target
    if(isNaN(input.value) || input.value <= 0){
        input.value = 1
    }
    updateCartTotal()
}

function updateCartTotal(){
    var cartItemContainer = document.getElementsByClassName("cart-items")[0]
    var cartRows = cartItemContainer.getElementsByClassName("cart-row")
    var total = 0
    for(var i = 0; i < cartRows.length; i++){
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName("cart-price")[0]
        var quantityElement = cartRow.getElementsByClassName("cart-quantity-input")[0]
        
        var price = parseFloat(priceElement.innerText.replace("$", ""))
        var quantity = quantityElement.value
        total = total + (price*quantity)
    }

    var cartAmount = document.getElementsByClassName("cart-amount")[0]
    cartAmount.innerText = cartRows.length

    total = Math.round(total* 100)/100
    document.getElementsByClassName("cart-total-price")[0].innerText = "$" + total

    saveToStorage(cartItemContainer)
}
var stripeHandler = StripeCheckout.configure({
    key:stripePublicKey,
    locale: "en",
    token: function(token){
        var items = []
        var cartItemContainer = document.getElementsByClassName("cart-items")[0]
        var cartRows = cartItemContainer.getElementsByClassName("cart-row")
        for(var i = 0; i < cartRows.length; i++){
            var cartRow  = cartRows[i]
            var quantityElement = cartRow.getElementsByClassName("cart-quantity-input")[0]
            var quantity = quantityElement.value
            var id = cartRow.dataset.itemId
            items.push({
                id: id,
                quantity: quantity
            })
        }
        fetch("/purchase", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function(res){
            return res.json()
        }).then(function(data){
            alert(data.message)
            var cartItems = document.getElementsByClassName("cart-items")[0]
            while(cartItems.hasChildNodes()){
                cartItems.removeChild(cartItems.firstChild)
            }
            localStorage.clear("cartKey")
            updateCartTotal()
        }).catch(function(error){
            console.log(error)
        })

    }
})
function purchasedClicked(){

    var priceElement = document.getElementsByClassName("cart-total-price")[0]
    var price = parseFloat(priceElement.innerText.replace("$", "")) * 100
    stripeHandler.open({
        amount: price
    })

}
function saveToStorage(cartItems){

    localStorage.setItem("cartKey", JSON.stringify(cartItems.outerHTML))
    
}
function getStorage(){
    var cartItems = document.getElementsByClassName("cart-items")[0]
    items = JSON.parse(localStorage.getItem('cartKey'))
    cartItems.outerHTML = items

    var cartRows = document.getElementsByClassName("cart-row")
    var cartAmount = document.getElementsByClassName("cart-amount")[0]
    cartAmount.innerText = cartRows.length - 1
    updateCartTotal()
}