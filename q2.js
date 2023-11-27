var express  = require('express');
var mongoose = require('mongoose');
var app      = express();

const exphbs = require('express-handlebars');

var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
var fs = require('fs')
var port     = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.engine('.hbs', exphbs.engine({ extname: '.hbs', 
    runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  } }));
app.set('view engine', 'hbs');


mongoose.connect(database.url);

var Invoice = require('./models/carSales');
// const carSales = require('./models/carSales');
const { Console } = require('console');
const data  = fs.readFileSync('CarSales.json');
const carData = JSON.parse(data)
 
 
//get to sales data from db
app.get('/api/invoices', function(req, res) {
	Invoice.find()
        .then(carSales => res.json(carSales))
		.catch(err => res.send(err));
});

// Get an invoice with ID
app.get('/api/invoices/:id', function(req, res) {
   
    let no = req.params.id;

    Invoice.findOne({ 
        InvoiceNo: no
        })
        .exec()
        .then(carSales => {
            if (carSales) {
                res.json(carSales);
            } else {
                res.send("Not Found");
            }
        })
        .catch(err => {
            res.send(err);
        })
});


//additional functionality
app.get('/api/invoices/Manufacturer/:man', async function(req, res) {
   
    try {
    let man = req.params.man;

    console.log(man);

    const resu = await Invoice.find({ Manufacturer: man }).exec();
    console.log(res);
    if (resu && resu.length > 0) {
      res.json(resu);
    } else {
      res.send('Not Found');
    }
  } catch (error) {
    console.error('Error searching for records by Manufacturer:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/invoices', async function(req, res) {
    
    Invoice.insertMany(carData)
    .then(carSales => {
        res.json(carSales);
    })
    .catch(err => {
        res.send(err) 
    });

});


//add invoices
app.put('/api/invoices/addInvoice', function(req, res) {

    console.log(req.body);

	Invoice.create({
	InvoiceNo: req.body.InvoiceNo,
	Manufacturer : req.body.Manufacturer,
    class : req.body.class,
    Sales_in_thousands : req.body.Sales_in_thousands,
    __year_resale_value : req.body.__year_resale_value,
    Vehicle_type : req.body.Vehicle_type,
    Price_in_thousands : req.body.Price_in_thousands,
    Engine_size : req.body.Engine_size,
    Horsepower : req.body.Horsepower,
    Wheelbase : req.body.Wheelbase,
    Width : req.body.Width,
    Length : req.body.Length,
    Curb_weight : req.body.Curb_weight,
    Fuel_capacity : req.body.Fuel_capacity,
    Latest_Launch : req.body.Latest_Launch,
    Power_perf_factor : req.body.Power_perf_factor
	})
    .then(carSales =>{
        return Invoice.find();
    })
    .then(carSales =>{
        res.send('Successfully!');
    })
    .catch(err =>{
        res.send(err);
    })
});

//wip
app.put('/api/invoice/update/:invoiceNo', function(req, res) {
    console.log(req.body);

    let no = req.params.invoiceNo;

    var data = {
        Manufacturer: req.body.Manufacturer,
        Price_in_thousands: req.body.Price_in_thousands,
    }

    Invoice.findOneAndUpdate({ InvoiceNo: no }, data, { new: true })
        .exec()
        .then(carSales => {
            if (carSales) {
                res.send('Successfully! Car updated - ' + carSales.Manufacturer);
            } else {
                res.send('Car not found');
            }
        })
        .catch(err => {
            res.send(err);
        });
});
//



// delete a invoice by id
app.delete('/api/invoices/:i_id', async function(req, res) {
    try {
        const id = req.params.i_id;

        // Use deleteOne to delete the document with the specified _id
        const result = await Invoice.deleteOne({ _id: id });

        if (result.deletedCount > 0) {
            res.send('Successfully! Employee has been Deleted.');
        } else {
            res.status(404).send('Employee not found.');
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Error deleting employee' });
    }
});

app.get('/', async (req, res) => {
    try {  
    const dat = await Invoice.find();
    //console.log(dat)
    res.render('invoices', { data: dat });
    } catch (err) {
        res.send('Not Found');
    }     
});

app.get('/addhInvoice', (req, res) => {
    res.render('addInvoice');
});

app.post('/addhInvoice', async (req, res) => {
    try {
      const {
        InvoiceNo,
        Manufacturer,
        vehicleClass,
        Sales_in_thousands,
        __year_resale_value,
        Vehicle_type,
        Price_in_thousands,
        Engine_size,
        Horsepower,
        Wheelbase,
        Width,
        Length,
        Curb_weight,
        Fuel_capacity,
        Fuel_efficiency,
        Latest_Launch,
        Power_perf_factor,
      } = req.body;
  
      const newCarSale = new CarSales({
        InvoiceNo,
        Manufacturer,
        vehicleClass,
        Sales_in_thousands,
        __year_resale_value,
        Vehicle_type,
        Price_in_thousands,
        Engine_size,
        Horsepower,
        Wheelbase,
        Width,
        Length,
        Curb_weight,
        Fuel_capacity,
        Fuel_efficiency,
        Latest_Launch,
        Power_perf_factor,
      });
  
      await newCarSale.save();
  
      res.redirect('/allData');
    } catch (error) {
      console.error('Error adding new CarSale:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  


app.listen(port);
console.log("App listening on port : " + port);