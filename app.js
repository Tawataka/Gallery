if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require("express")
const app = express()
const fs = require("fs")
const stripe = require("stripe")(stripeSecretKey)

const nodemailer = require('nodemailer');

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
    fs.readFile("item.json", function(error, data){
       
        if(error){
            res.status(500).end()
        }
        else{
            res.render("cart.ejs", {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
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
            let statement = `
            <p style="font-family: Arial; font-size: 2.0em;">Order Received</p>
            <div style="width: 80%;">
                <table style="font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%;">
                    <tr style="border-bottom: 1px solid black; margin-right: 4.5em; padding-bottom: 10px; margin-top: 10px;">
                        <th></th>
                        <th>ITEM</th>
                        <th>PRICE</th>
                        <th>QUANTITY</th>
                    </tr> 
            `
            req.body.items.forEach(function(item){
                const itemJson = itemsArray.find(function(i){
                    return i.id == item.id
                })
                total = total + itemJson.price * item.quantity
                statement = statement + `
                    <tr>
                        <td> <img src="images/` + itemJson.image + `" width="100" height="100"></td>
                        <td style="padding: 40px;">` + itemJson.name + `</td>
                        <td style="padding: 40px;">$` + itemJson.price/100 + `</td>
                        <td style="padding: 40px;"> X` + item.quantity +`</td>
                    </tr>
                `
            })
            statement = statement + `
                </table>
                <div style="text-align: right;">
                    <strong class="cart-total-title">Total</strong>
                    <span class="cart-total-price">$` + total/100 + `</span>
                </div>
            </div>
            <div style="width: 40%; background-color: #f7dd4e; padding: 20px;">
				<p style="font-family: Arial; font-size: 1.5em; padding: 0px;">Ship To</p>
				<div style="border-bottom: 1px solid black; padding: 0px;"></div>
				<table style="font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%;">
					
					<tr>
						<td>` + req.body.name + `</td>
					</tr>
					<tr>
						<td>` + req.body.address + `</td>
					</tr>
					<tr>
						<td>` + req.body.city + `, ` + req.body.state + `, ` + req.body.zip + `</td>
					</tr>
					
				</table>
			</div>

            `

            var maillist = [
                req.body.email,
                'tawa.tv.777@gmail.com',
            ];
             

            var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tawa.tv.777@gmail.com',
                pass: 'Tawataka3737'
            }
            });
        
            var mailOptions = {
                from: 'tawa.tv.777@gmail.com',
                to: maillist, 
                subject: 'Art Gallery Purchase Complete',
                html: statement 
            };
        
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
            });

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
