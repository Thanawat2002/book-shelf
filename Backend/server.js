// require("dotenv").config();
const express = require('express');
const Sequelize = require('sequelize');
const app = express();

//parse incoming requests
app.use(express.json());

//create a connection to the database
const sequelize = new Sequelize('database', 'usename', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: './Database/library.db'
});

// define the book model
const Book = sequelize.define('book', {

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    author: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shelf_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});

const Shelve = sequelize.define('shelve', {
    shelf_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    total_books: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

// create the book table if doesn't exist
sequelize.sync();

// Create a new book and add it to a shelf
app.post('/add-book-to-shelf', (req, res) => {
    const { title, author, shelf_id } = req.body;
    if (!title || !author || !shelf_id) {
        res.status(500).send('Missing parameters');
        return;
    }
    Shelve.findByPk(shelf_id).then((shelves) => {
        if (!shelves) {
            res.status(404).send("shelves not found")
        } else {
            shelves.update({ total_books: shelves.total_books + 1 }).then(() => {
                Book.create({ title, author, shelf_id }).then((book) => {
                    res.send({
                        book: book,
                        shelves: shelves
                    });
                }).catch((err) => {
                    res.status(500).send(err)
                });
            }).catch((err) => {
                res.status(500).send(err)
            });
        }
    }).catch((err) => {
        res.status(500).send(err)
    });
})

// get all books from a shelf
app.get('/get-book-from-shelf/:shelf_id', (req, res) => {
    const { shelf_id } = req.params;
    if (!shelf_id) {
        res.status(500).send('Missing parameters');
        return;
    }
    Shelve.findByPk(shelf_id).then((shelves) => {
        if (!shelves) {
            res.status(404).send("shelve not found")
        } else {
            Book.findAll({ where: { shelf_id: shelf_id } }).then((books) => {
                res.json({ books: books, shelves: shelves })
            }).catch((err) => {
                res.status(500).send(err)
            });
        }
    }).catch((err) => {
        res.status(500).send(err)
    });
})

//route to get all books
app.get('/books', (req, res) => {
    Book.findAll().then(books => {
        res.json(books);
    }).catch(err => {
        res.status(500).send(err);
    });
});

// route to get a book by id
app.get('/books/:id', (req, res) => {
    Book.findByPk(req.params.id).then((book) => {
        if (!book) {
            res.status(404).send('Book not found');
        } else {
            res.json(book);
        }
    }).catch(err => {
        res.status(500).send(err);
    })
});


//route to create a new book
app.post('/books', (req, res) => {
    Book.create(req.body).then((book) => {
        res.json(book);
    }).catch(err => {
        res.status(500).send(err);
    })
});

//route to update a book
app.put('/books/:id', (req, res) => {
    Book.findByPk(req.params.id).then((book) => {
        if (!book) {
            res.status(404).send('Book not found');
        } else {
            book.update(req.body).then(() => {
                res.send(book);
            }).catch(err => {
                res.status(500).send(err);
            });
        }
    }).catch(err => {
        res.status(500).send(err);
    })
});

//  route to delete a books
app.delete('/books/:id', (req, res) => {
    Book.findByPk(req.params.id).then((book) => {
        if (!book) {
            res.status(404).send('Book not found');
        } else {
            book.destroy().then(() => {
                res.send({});
            }).catch(err => {
                res.status(500).send(err);
            })
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

// route to get all shelves
app.get('/shelves', (req, res) => {
    Shelve.findAll().then((shelves) => {
        res.json(shelves)
    }).catch((err) => {
        res.status(500).send(err)
    });
})

// route to get a shelf by id
app.get('/shelves/:shelf_id', (req, res) => {
    Shelve.findByPk(req.params.shelf_id).then((shelves) => {
        if (!shelves) {
            res.status(404).send("shelve not found")
        } else {
            res.json(shelves)
        }
    }).catch((err) => {
        res.status(500).send(err)
    });
});

// route to create a new shelf
app.post('/shelves', (req, res) => {
    Shelve.create(req.body).then((shelves) => {
        res.send(shelves)
    }).catch((err) => {
        res.status(500).send(err)
    });
})

// route to update a shelf
app.put('/shelves/:shelf_id', (req, res) => {
    Shelve.findByPk(req.params.shelf_id).then((shelves) => {
        if (!shelves) {
            res.status(404).send("shelves not found")
        } else {
            shelves.update(req.body).then(() => {
                res.send(shelves)
            }).catch((err) => {
                res.status(500).send(err)
            });
        }
    }).catch((err) => {
        res.status(500).send(err)
    });
});

// route to delete a shelf
app.delete('/shelves/:shelf_id', (req, res) => {
    Book.findOne({ where: { shelf_id: req.params.shelf_id } }).then((books) => {
        if (!books) {
            Shelve.findByPk(req.params.shelf_id).then((shelves) => {
                if (!shelves) {
                    res.status(404).send("shelves not found")
                } else {
                    shelves.destroy().then(() => {
                        res.send({ status: true })
                    }).catch((err) => {
                        res.status(500).send(err)
                    });
                }
            }).catch((err) => {
                res.status(500).send(err)
            });
        } else {
            res.status(200).send({ status: false })
        }
    });
});

// start the sever 
const port = 3001;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});