const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Serve the online therapy page
app.get('/online-therapy', (req, res) => {
    res.sendFile(__dirname + '/public/online-therapy.html');
});

// Serve the offline therapy page
app.get('/offline-therapy', (req, res) => {
    res.sendFile(__dirname + '/public/offline-therapy.html');
});

// Mock Payment System
function processPayment(amount) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (amount) {
                resolve('Payment successful');
            } else {
                reject('Payment failed');
            }
        }, 1000);
    });
}

// Store form data
const saveFormData = (fileName, data) => {
    fs.readFile(fileName, 'utf8', (err, fileData) => {
        if (err) {
            console.log("Error reading file:", err);
            return;
        }

        let json = [];
        if (fileData) {
            json = JSON.parse(fileData);
        }
        json.push(data);

        fs.writeFile(fileName, JSON.stringify(json, null, 2), 'utf8', (err) => {
            if (err) console.log("Error writing file:", err);
        });
    });
};

// Handle online therapy form submission
app.post('/submit-online-therapy', (req, res) => {
    const { name, email, problem, time, payment } = req.body;

    if (payment !== "250") {
        return res.status(400).send("Invalid payment amount");
    }

    processPayment(payment)
        .then((message) => {
            const formData = { name, email, problem, time, type: "online", payment: 250 };
            saveFormData('online-therapy-submissions.json', formData);
            res.send(`<h1>Success!</h1><p>${message}</p>`);
        })
        .catch((error) => {
            res.status(500).send(`<h1>Failure!</h1><p>${error}</p>`);
        });
});

// Handle offline therapy form submission
app.post('/submit-offline-therapy', (req, res) => {
    const { name, email, address, time, therapy_type, payment } = req.body;

    if (payment !== "400") {
        return res.status(400).send("Invalid payment amount");
    }

    processPayment(payment)
        .then((message) => {
            const formData = { name, email, address, time, therapy_type, payment: 400 };
            saveFormData('offline-therapy-submissions.json', formData);
            res.send(`<h1>Success!</h1><p>${message}</p>`);
        })
        .catch((error) => {
            res.status(500).send(`<h1>Failure!</h1><p>${error}</p>`);
        });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

