const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.og8u4je.mongodb.net/?retryWrites=true&w=majority`;

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


    const toyCollection = client.db('littleLamb').collection('tabToys');

    const indexKeys = { toy_name: 1, sub_category: 1 };
    const indexOptions = { name: "toyNameSubCategory" };

    const result = await toyCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    app.get('/toySearch/:text', async (req, res) => {
      const search = req.params.text;

      const result = await toyCollection.find({
        $or: [
          { toy_name: { $regex: search, $options: "i" } },
          { sub_category: { $regex: search, $options: "i" } }

        ]
      }).toArray()
      res.send(result)
    })


    app.get('/tabToys', async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result);
    })

    // get tab toys
    app.get('/tabToys/:text', async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == 'lamb' || req.params.text == 'cow' || req.params.text == 'teddy') {
        const result = await toyCollection.find({
          sub_category
            : req.params.text
        }).toArray();
        return res.send(result);

      }
      const result = await toyCollection.find().toArray();
      res.send(result);



    })

    // get data by email
    app.get('/mytoys/:email', async (req, res) => {
      console.log(req.params.email);
      const result = await toyCollection.find({ email: req.params.email }).toArray();
      res.send(result);

    })

    // single toy

    app.get('/tabToysDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query)
      res.send(result)
    })

    // update toy

    app.get('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query)
      res.send(result)
    })

    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateToy = req.body;
      const toy = {
        $set: {
          seller_name: updateToy.seller_name,
          toy_name: updateToy.toy_name,
          email: updateToy.email,
          sub_category: updateToy.sub_category,
          picture: updateToy.picture,
          description: updateToy.description,
          price: updateToy.price,
          quantity: updateToy.quantity
        }
      }
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    })

    // Delete toy
    app.delete('/tabToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })




    // add a toy
    app.post('/tabToys', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
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
  res.send('little lamb is running!')
})

app.listen(port, () => {
  console.log(`Little lamb listening on port ${port}`)
})