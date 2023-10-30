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

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: " unauthorized" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    console.log("decoded : ", decoded);
    next();
  });
};

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

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user.role !== "admin") {
        console.log(user);
        return res
          .status(401)
          .send({ error: true, message: "You are not allowed to access !" });
      } else {
        next();
      }
    };

    app.post("/menu", verifyJWT, verifyAdmin, async (req, res) => {
      const menuItem = req.body;
      console.log("email", req.headers.email);
      console.log("menuItem", menuItem);
      const result = await menuCollection.insertOne(menuItem);
      res.send(result);
    });
    app.delete("/menu/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const deletetedId = req.params.id;

      const result = await menuCollection.deleteOne({ _id: deletetedId });
      res.send(result);

      console.log("Menu Deleted", deletetedId);
    });
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollecion.find().toArray();
      //   console.log(result);
      res.send(result);
    });

    app.get("/users", verifyJWT, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      if (req.decoded.email !== email) {
        res.send({ admin: false });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
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

    app.get("/carts", verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log(req.headers.authorization.split(" ")[1]);
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
