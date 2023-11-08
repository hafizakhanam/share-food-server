const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mnxfzlt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client.db("foodDB").collection("food");
    const reqFoodCollection = client.db("foodDB").collection("requested-food");
    const userCollection = client.db("foodDB").collection("user");

    app.get('/food', async(req, res) =>{
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/food', async(req, res) =>{
      const newFood = req.body;
      console.log(newFood)
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    })

    // Single Food API
    app.get('/food/:id', async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const food = await foodCollection.findOne({ _id: objectId });
      console.log(food);
      res.send(food);
    });

    app.delete('/food/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await foodCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    app.put('/food/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const options = { upsert: true};
      const updateFood = req.body;
      const food = {
        $set: {
          foodImage: updateFood.foodImage, 
          foodName: updateFood.foodName,  
          donatorName: updateFood.donatorName, 
          donatorImage: updateFood.donatorImage,
          donatorEmail: updateFood.donatorEmail,
          foodQty: updateFood.foodQty,
          pickLocation: updateFood.pickLocation, 
          expDate: updateFood.expDate,
          notes: updateFood.notes
        }
      };
      const result = await foodCollection.updateOne(query, food, options);
      res.send(result);
    });

    app.get('/manage-food/:id', async (req, res) => {
      const id = req.params.id;
      const query = await foodCollection.find({ "uID": id });
      const result = await query.toArray();
      console.log(result);
      res.send(result);
    });

    app.get('/manage-single-food/:id', async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const food = await foodCollection.findOne({ _id: objectId });
      console.log(food);
      res.send(food);
    });

    // User API
    app.post('/user', async(req, res) =>{
      const newUser = req.body;
      console.log(newUser)
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // Single user API
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      console.log(user);
      res.send(user);
    });

    app.post('/request', async(req, res) =>{
      const newRequest = req.body;
      console.log(newRequest)
      const result = await reqFoodCollection.insertOne(newRequest);
      res.send(result);
    });

    app.get('/request/:id', async (req, res) => {
      const id = req.params.id;
      const request = await reqFoodCollection.find({ "uID": id });
      const result = await request.toArray();
      console.log(result);
      res.send(result);
    });

    app.delete('/request/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await reqFoodCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Server is running')
})

app.listen(port, () =>{
    console.log(`Server is running on port: ${port}`)
})