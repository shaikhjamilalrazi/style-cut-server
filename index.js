const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const fileUpload = require("express-fileupload");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfzrp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

client.connect((err) => {
    const serviceCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("services");
    const adminCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("adminList");
    const bookCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("bookList");

    const remarkCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection("remarkList");

    // adding service
    app.post("/addService", (req, res) => {
        const file = req.files.file;
        const serviceName = req.body.serviceName;
        const description = req.body.serviceDescription;
        const newImg = file.data;
        const encImg = newImg.toString("base64");

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, "base64"),
        };

        serviceCollection
            .insertOne({ serviceName, description, image })
            .then((result) => {
                res.send(result.insertedCount > 0);
            });
    });
    // get services
    app.get("/services", (req, res) => {
        serviceCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    // Make Admin
    app.post("/makeAdmin", (req, res) => {
        const adminMail = req.body;
        adminCollection.insertOne(adminMail).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    // get single service
    app.get("/service/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        serviceCollection.find({ _id: id }).toArray((err, product) => {
            res.send(product[0]);
        });
    });

    // add Booklist
    app.post("/Book", (req, res) => {
        const book = req.body;
        bookCollection.insertOne(book).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    // get Booklist
    app.get("/Booklist", (req, res) => {
        bookCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    // add Remarks
    app.post("/Remarks", (req, res) => {
        const remark = req.body;
        remarkCollection.insertOne(remark).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    // get remarks
    app.get("/allRemarks", (req, res) => {
        remarkCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    // is admin
    app.get("/isAdmin", (req, res) => {
        adminCollection
            .find({ email: req.query.email })
            .toArray((err, result) => {
                res.send(result);
            });
    });

    // Delete service
    app.delete("/deleteService/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        serviceCollection
            .findOneAndDelete({ _id: id })
            .then((result) => console.log(result));
    });
});

// root
app.get("/", (req, res) => {
    res.send("Hello Jamil!!!");
});

app.listen(port);
