import fetch from 'node-fetch';
import express from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import Table from 'cli-table';

const MONOG_URI = "mongodb+srv://mymongo:mymongo123@cluster0.qtg3a9q.mongodb.net/NewDB?retryWrites=true&w=majority"

mongoose.connect(MONOG_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', function () {
    console.log("Connected to DB");
});

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());

const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
const data = await response.json();

const transactionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, required: true },
    image: { type: String },
    sold: { type: Boolean, default: false },
    dateOfSale: { type: Date },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

async function getPosts() {
    for (let i = 0; i < data.length; i++) {
        const product = new Transaction({
            id: data[i].id,
            title: data[i].title,
            price: data[i].price,
            description: data[i].description,
            category: data[i].category,
            image: data[i].image,
            sold: data[i].sold,
            dateOfSale: data[i].dateOfSale
        });

        try {
            const savedProduct = await product.save();
            console.log(savedProduct);
        } catch (err) {
            console.log(err);
        }
    }

    // Fetch and display data in table structure
    const products = await Transaction.find();
    displayTable(products);
}
getPosts();
// Function to display data in table structure in the terminal
function displayTable(data) {
    const table = new Table({
        head: ['ID', 'Title', 'Price', 'Description', 'Category', 'Image', 'Sold', 'Date of Sale'],
        colWidths: [5, 20, 10, 20, 15, 30, 8, 20]
    });

    data.forEach(item => {
        table.push([
            item.id,
            item.title,
            item.price,
            item.description,
            item.category,
            item.image,
            item.sold,
            item.dateOfSale
        ]);
    });

    console.log(table.toString());
}

// Fetch and display data in table structure
app.get('/products', async (req, res) => {
    const products = await Transaction.find();
    displayTable(products);
    res.send(products);
});

// Task 2
app.get('/salesMonth', async (req, res) => {
    const map1 = new Map();
    map1.set("January", "01");
    map1.set("February", "02");
    map1.set("March", "03");
    map1.set("April", "04");
    map1.set("May", "05");
    map1.set("June", "06");
    map1.set("July", "07");
    map1.set("August", "08");
    map1.set("September", "09");
    map1.set("October", "10");
    map1.set("November", "11");
    map1.set("December", "12");

    const search = req.query.keyword;
    const monthNumber = map1.get(search);

    let sales = 0,
        soldItems = 0,
        totalItems = 0;

    for (let i = 0; i < data.length; i++) {
        const originalString = data[i].dateOfSale;
        const sold = data[i].sold;
        const text = originalString.substring(5, 7);

        if (text === monthNumber) {
            sales += data[i].price;
            totalItems += 1;
            if (sold === true)
                soldItems += 1;
        }
    }

    const result = {
        totalSale: sales,
        totalSalesCount: soldItems,
        totalNotSoldItems: totalItems - soldItems
    };

    res.json(result);
});


// Task 3
app.get('/barChart', (req, res) => {
    const map1 = new Map();
    map1.set("January", "01");
    map1.set("February", "02");
    map1.set("March", "03");
    map1.set("April", "04");
    map1.set("May", "05");
    map1.set("June", "06");
    map1.set("July", "07");
    map1.set("August", "08");
    map1.set("September", "09");
    map1.set("October", "10");
    map1.set("November", "11");
    map1.set("December", "12");

    var search = req.query.keyword;
    search.toString();

    const map2 = new Map();
    map2.set(100, 0);
    map2.set(200, 0);
    map2.set(300, 0);
    map2.set(400, 0);
    map2.set(500, 0);
    map2.set(600, 0);
    map2.set(700, 0);
    map2.set(800, 0);
    map2.set(900, 0);
    map2.set(901, 0);

    // Group transactions by price range
    for (let i = 0; i < data.length; i++) {
        let originalString = data[i].dateOfSale;
        let sold = data[i].sold;
        originalString.toString();
        let text = originalString.substring(5, 7);
        if (text == map1.get(search)) {
            if (data[i].price < 100)
                map2.set(100, map2.get(100) + 1);
            else if (data[i].price < 200)
                map2.set(200, map2.get(200) + 1);
            else if (data[i].price < 300)
                map2.set(300, map2.get(300) + 1);
            else if (data[i].price < 400)
                map2.set(400, map2.get(400) + 1);
            else if (data[i].price < 500)
                map2.set(500, map2.get(500) + 1);
            else if (data[i].price < 600)
                map2.set(600, map2.get(600) + 1);
            else if (data[i].price < 700)
                map2.set(700, map2.get(700) + 1);
            else if (data[i].price < 800)
                map2.set(800, map2.get(800) + 1);
            else if (data[i].price < 900)
                map2.set(900, map2.get(900) + 1);
            else
                map2.set(901, map2.get(901) + 1);
        }
    }

    res.setHeader('Content-Type', 'text/html');
    res.write(`<h2>Price range and the number of items in that range for the selected month regardless of the year</h2>`);
    
    // Display data in table structure
    const table = new Table({
        head: ['Price Range', 'Number of Items'],
        colWidths: [20, 20]
    });

    for (let [key, value] of map2) {
        table.push([`< ${key}`, value]);
    }

    console.log(table.toString());
    res.write(table.toString());
    res.end();
});

// Task 4
app.get('/pieChart', async (req, res) => {
    const map = new Map();
    var search = req.query.keyword;
    search.toString();

    // Group transactions by item type
    for (let i = 0; i < data.length; i++) {
        let originalString = data[i].dateOfSale;
        originalString.toString();
        let text = originalString.substring(5, 7);
        if (text == search) {
            let itemType = data[i].itemType;
            if (map.has(itemType)) {
                map.set(itemType, map.get(itemType) + 1);
            } else {
                map.set(itemType, 1);
            }
        }
    }

    res.setHeader('Content-Type', 'text/html');
    res.write(`<h2>Number of items sold by item type for the selected month regardless of the year</h2>`);

    // Display data in table structure
    const table = new Table({
        head: ['Item Type', 'Number of Items Sold'],
        colWidths: [30, 30]
    });

    for (let [key, value] of map) {
        table.push([key, value]);
    }

    console.log(table.toString());
    res.write(table.toString());
    res.end();
});

const port = 3000;
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));
