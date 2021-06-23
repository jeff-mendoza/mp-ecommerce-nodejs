var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000
var app = express();

const host = "https://jeff-mendoz-mp-commerce-nodejs.herokuapp.com";
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
    const {title, price, unit, img} = req.query;
    console.log("::endpoint /detail");
    console.log(req.query);

    const payer = {
        name: "Lalo",
        surname: "Landa",
        email: "test_user_83958037@testuser.com",
        date_created: new Date().toISOString(),
        phone: {
          area_code: "52",
          number: 5549737300
        },
         
        identification: {
          type: "DNI",
          number: "12345678"
        },
        
        address: {
          street_name: "Insurgentes Sur",
          street_number: 1602,
          zip_code: "03940"
        }
    };

    const paymentMethod = {
        "excluded_payment_methods": [
            {
                "id": "amex"
            }
        ],
        "excluded_payment_types": [
            {
                "id": "atm"
            }
        ],
        "installments": 1,
        "default_installments": 6
    };


    // Crea un objeto de preferencia
    let preference = {
        items: [
        {
            title: title,
            unit_price: Number(price),
            quantity: Number(unit),
            picture_url: host + "/" + img,
   		    description: "Dispositivo móvil de Tienda e-commerce",
        }
        ],
        back_urls: {
			"success": host + "/feedback",
			"failure": host + "/feedback",
			"pending": host + "/feedback"
		},
        payment_methods: paymentMethod,
        payer: payer,
        notification_url: host + "/webhook",
        external_reference: 'jefferson.mendoza@mercadolibre.com.co',
        integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
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
    response.render('feedback', {...request.query});
});

app.post('/webhook', function(request, response) {
    console.log('::API webhook');
    console.log(request)
    response.json({Status: 'OK'});
});

app.listen(port);