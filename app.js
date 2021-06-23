var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000

var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

//config mercadopago
          
// SDK de Mercado Pago
const mercadopago = require ('mercadopago');
// Agrega credenciales
mercadopago.configure({
  access_token: 'APP_USR-2572771298846850-120119-a50dbddca35ac9b7e15118d47b111b5a-681067803'
});



app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    const {title, price, unit} = req.query;
    console.log("::endpoint /detail");
    console.log(req.query);
    // Crea un objeto de preferencia
    let preference = {
        items: [
        {
            title: title,
            unit_price: Number(price),
            quantity: Number(unit),
            external_reference: 'jefferson.mendoza@mercadolibre.com.co'
        }
        ],
        back_urls: {
			"success": "http://localhost:3000/feedback",
			"failure": "http://localhost:3000/feedback",
			"pending": "http://localhost:3000/feedback"
		},
		auto_return: 'approved',
    };
    
    return mercadopago.preferences.create(preference)
        .then(function(response){
            console.log('::api request: create preference');
            console.log(response);
            global.id = response.body.id;
            res.render('detail', {id: response.body.id, ...req.query});
        }).catch(function(error){
            console.log(error);
        });    
});

app.get('/feedback', function(request, response) {
    console.log('::API feedback');
    console.log(request.query);
    response.json({
       Payment: request.query.payment_id,
       Status: request.query.status,
       MerchantOrder: request.query.merchant_order_id
   })
});

app.listen(port);