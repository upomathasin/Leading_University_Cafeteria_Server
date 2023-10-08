const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.port || 5000;
console.log(process.env.DB_USER);
console.log(process.env.DB_Password);
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Lu");
});

app.listen(port, () => {
  console.log("Listening on port  " + port);
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Password}@cluster0.qqkl2pk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const menuCollection = client.db("CafeteriaDB").collection("menu");
    const reviewsCollecion = client.db("CafeteriaDB").collection("reviews");
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      console.log(result);
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollecion.find().toArray();
      console.log(result);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
