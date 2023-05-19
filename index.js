const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sflyv9x.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();


    const toysCollection = client.db('tennisDb').collection('toys');

    const indexKeys = { toyName : 1};
    const indexOptions = { name : "toyName"};
    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get('/toySearchByName/:text', async (req, res) => {
      const text = req.params.text;
      const result = await toysCollection.find({
        
           toyName: { $regex : text, $options: "i"}
        
      }).toArray();
      res.send(result);
    })
    // get my toys 
    app.get('/myToys/:email', async (req, res) => {
      // console.log(req.params.email);
      const toys = await toysCollection.find({ sellerEmail: req.params.email }).sort({price: 1}).toArray();
      res.send(toys);
    })
    // get all toys 
    app.get('/allToys', async (req, res) => {
      const toys = toysCollection.find().limit(20);
      const result = await toys.toArray();
      res.send(result);
    })
    // single toy
    app.get('/singleToy/:id', async(req, res) =>{
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id)};
      const singleToy = await toysCollection.findOne(query);
      res.send(singleToy);
    })
    app.get('/allToys/:text', async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == "Tennis Rackets" || req.params.text == "Tennis Balls" || req.params.text == "Tennis Accessories") {
        const result = await toysCollection.find({ category: req.params.text }).toArray();
        return res.send(result);
      }
      const toys = toysCollection.find();
      const result = await toys.toArray();
      res.send(result);

    })



    app.post('/post-Toys', async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    })
    // update my toy
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toy = await toysCollection.findOne(query);
      res.send(toy);

    })
    // finally update toy
    app.put('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      // console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateJob = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description
        }
      }
      const result = await toysCollection.updateOne(filter, updateJob);
      res.send(result);
    })
    // delete a toy
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Tennis server is running");
})

app.listen(port, () => {
  console.log(`Tennis server running port on :${port}`);
});