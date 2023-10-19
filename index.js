const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const jwt = require("jsonwebtoken");
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
    const cartCollecion = client.db("CafeteriaDB").collection("carts");
    const usersCollection = client.db("CafeteriaDB").collection("users");
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollecion.find().toArray();
      //   console.log(result);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };

      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
      console.log("up", id);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("User Info ", user);

      const query = { email: user.email };
      const existUser = await usersCollection.findOne(query);
      if (existUser) {
        return res.send({ message: "User Already exist" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/carts", async (req, res) => {
      //  console.log(req.query);

      const email = req.query.email;
      if (!email) {
        res.send([]);
      } else {
        const result = await cartCollecion.find({ email: email }).toArray();
        //  console.log("result of cart query: ", result);
        res.send(result);
      }
    });
    app.delete("/carts/:id", async (req, res) => {
      const deletedId = req.params.id;
      console.log(deletedId);

      const result = await cartCollecion.deleteOne({
        _id: new ObjectId(deletedId),
      });
      res.send(result);
    });
    app.post("/carts", async (req, res) => {
      const item = await req.body;
      //  console.log("cart", item);
      const result = await cartCollecion.insertOne(item);
      res.send(result);
      console.log(item.email);
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
