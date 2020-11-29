if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require("express")
const app = express()
const fs = require("fs")
const stripe = require("stripe")(stripeSecretKey)

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.static("public"))

app.get("", function(req, res){
    fs.readFile("item.json", function(error, data){
       
        if(error){
            res.status(500).end()
        }
        else{
            res.render("index.ejs", {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})
app.get("/about", function(req, res){
    
    res.render("about.ejs")
})
app.get("/cart", function(req, res){
    
    res.render("cart.ejs")
})

app.post("/purchase", function(req, res){
    fs.readFile("item.json", function(error, data){
       
        if(error){
            res.status(500).end()
        }
        else{
            const itemsJson = JSON.parse(data)
            const itemsArray = itemsJson.merch.concat(itemsJson.merch)
            let total = 0
            req.body.items.forEach(function(item){
                const itemJson = itemsArray.find(function(i){
                    return i.id == item.id
                })
                total = total + itemJson.price * item.quantity
            })
            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: "usd"
            }).then(function(){
                console.log("change successful")
                res.json({ message: "Successfully purchases items"})
            }).catch(function(){
                console.log("catch error")
                res.status(500).end()
            })

        }
    })
})

app.listen(3000)
