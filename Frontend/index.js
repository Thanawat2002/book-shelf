// index.js
// Description: Node.js HTML client
// requires: npm install express ejs axios body-parser

const express = require("express");
const axios = require("axios");
var bodyParser = require("body-parser");
const path = require("path");
const app = express();

// Base URL for the API
const base_url = "http://localhost:3001";

// Set the template engine
app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(__dirname + "/public"));

// Read all books
app.get("/", async(req, res) => {
    try {
        const books = await axios.get(base_url + "/books");
        const shelve = await axios.get(base_url + "/shelves");
        res.render("book/books", { books: books.data, shelve: shelve.data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Read book by id
app.get("/book/:id", async(req, res) => {
    try {
        const response = await axios.get(base_url + "/books/" + req.params.id);
        res.render("book/book", { book: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Create new book page
app.get("/create/book", (req, res) => {
    res.render("book/create");
});

// Create a new book
app.post("/create/book", async(req, res) => {
    try {
        const data = { title: req.body.title, author: req.body.author, shelf_id: req.body.shelf_id };
        await axios.post(base_url + "/books", data);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Update book page
app.get("/update/book/:id", async(req, res) => {
    try {
        const response = await axios.get(base_url + "/books/" + req.params.id);
        const shelves = await axios.get(base_url + "/shelves");
        res.render("book/update", { book: response.data, shelves: shelves.data });
        console.log(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Update a book
app.post("/update/book/:id", async(req, res) => {
    try {
        const data = { title: req.body.title, author: req.body.author };
        await axios.put(base_url + "/books/" + req.params.id, data);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Delete a book
app.get("/delete/book/:id", async(req, res) => {
    try {
        await axios.delete(base_url + "/books/" + req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Create new book to shelf page
app.get("/create/addbooktoshelf", async(req, res) => {
    try {
        const response = await axios.get(base_url + "/shelves");
        res.render("book/add_book", { shelves: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// Create new book to shelf
app.post("/create/addbooktoshelf", async(req, res) => {
    try {
        const data = { title: req.body.title, author: req.body.author, shelf_id: req.body.shelf_id };
        await axios.post(base_url + "/add-book-to-shelf", data);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// get all books from a shelf
app.get("/booksofshelf/:shelf_id", async(req, res) => {
    try {
        const response = await axios.get(base_url + "/get-book-from-shelf/" + req.params.shelf_id);
        res.render("shelve/list_book", { data: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// read shelf
app.get("/shelve", async(req, res) => {
    try {
        const response = await axios.get(base_url + "/shelves");
        res.render("shelve/shelves", { shelves: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// read shelf by id
app.get("/shelve/:shelf_id", async(req, res) => {
    try {
        const response = await axios.get(base_url + "/shelves/" + req.params.shelf_id);
        res.render("shelve/shelve", { shelve: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// create shelf page
app.get("/create/shelve", (req, res) => {
    res.render("shelve/create");
});

// create shelf
app.post("/create/shelve", async(req, res) => {
    try {
        const data = { category: req.body.category, total_books: 0 };
        await axios.post(base_url + "/shelves", data);
        res.redirect("/shelve");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// update shelf page
app.get("/update/shelve/:shelf_id", async(req, res) => {
    try {
        const response = await axios.get(base_url + "/shelves/" + req.params.shelf_id);
        res.render("shelve/update", { shelve: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// update shelf
app.post("/update/shelve/:shelf_id", async(req, res) => {
    try {
        const data = { category: req.body.category, total_books: req.body.total_books };
        await axios.put(base_url + "/shelves/" + req.params.shelf_id, data);
        res.redirect("/shelve");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

// delete shelf
app.get("/delete/shelve/:shelf_id", async(req, res) => {
    try {
        const response = await axios.get(base_url + "/get-book-from-shelf/" + req.params.shelf_id);
        if (response.data.length > 0) {
            res.redirect("/shelve");
        } else {
            const status = await axios.delete(base_url + "/shelves/" + req.params.shelf_id);
            if (status.data) {
                console.log("Not Deleted");
            }
            res.redirect("/shelve");
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

app.listen(5500, () => {
    console.log("Server started on port 5500");
});