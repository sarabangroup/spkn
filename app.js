var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var imgSchema = require('./model.js');  // Assuming 'model.js' contains the Mongoose schema
var fs = require('fs');
var path = require('path');
var multer = require('multer');
require('dotenv').config();

// Set view engine
app.set("view engine", "ejs");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connected"))
    .catch(err => console.log(err));

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set static folder for uploads
app.use('/uploads', express.static('uploads'));

// Multer setup for file upload
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');  // Set upload directory
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  // Set filename
    }
});
var upload = multer({ storage: storage });

// Route to display the upload form and the uploaded data
app.get('/', (req, res) => {
    imgSchema.find({})
        .then((data) => {
            res.render('imagepage', { items: data });  // Render the page with data from MongoDB
        })
        .catch((err) => {
            console.log(err);
        });
});

// Route to render add-item form
app.get('/add-item', (req, res) => {
    res.render('add-item');  // This will render views/add-item.ejs
});

// Route to handle form submission and image upload
app.post('/add-item', upload.single('image'), (req, res, next) => {  // Changed to '/add-item'
    var obj = {
        name: req.body.name,
        age: req.body.age,
        salary: req.body.salary,
        jadagam: req.body.jadagam,
        gender: req.body.gender,
        profession: req.body.profession,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),  // Read image data
            contentType: req.file.mimetype  // Get image MIME type
        }
    };

    // Save data to MongoDB
    imgSchema.create(obj)
        .then((item) => {
            res.redirect('/');  // Redirect to the home page to display the updated list
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error uploading image.");
        });
});

// Route to display the edit form with the current item data
app.get('/edit-item/:id', (req, res) => {
    const id = req.params.id;
    imgSchema.findById(id)
        .then((item) => {
            if (!item) {
                return res.status(404).send("Item not found");
            }
            res.render('edit-item', { item });  // Render the edit-item.ejs view with the item data
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error fetching item.");
        });
});

// Route to handle the edit form submission and update the item
app.post('/edit-item/:id', upload.single('image'), (req, res, next) => {
    const id = req.params.id;

    // Create an update object with the new data
    const updatedData = {
        name: req.body.name,
        age: req.body.age,
        salary: req.body.salary,
        jadagam: req.body.jadagam,
        gender: req.body.gender,
        profession: req.body.profession,
    };

    // If a new image is uploaded, update the image data
    if (req.file) {
        updatedData.img = {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: req.file.mimetype
        };
    }

    // Find the item by ID and update it
    imgSchema.findByIdAndUpdate(id, updatedData, { new: true })
        .then((item) => {
            if (!item) {
                return res.status(404).send("Item not found");
            }
            res.redirect('/');  // Redirect to the home page after updating
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error updating item.");
        });
});

// Start the server
app.listen(1432, '0.0.0.0', () => {
    console.log('Server started on http://localhost:1432');
});
