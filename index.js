const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@firstmongodb.syucqne.mongodb.net/?appName=FirstMongoDB`;

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

    const db = client.db('Property-DB');
    const propertiesCollection = db.collection('properties');

    app.get('/properties', async (req, res) => {
      const data = req.body;
      const result = await propertiesCollection.find().sort({propertyPrice: 'desc'}).toArray();
      res.send(result)
    })

    app.get('/search', async (req, res) => {
      const data = req.query.search;
      const result = await propertiesCollection.find({propertyName: {$regex:data, $options: 'i'}}).toArray();
      res.send(result)
    })

    app.get('/properties/:id', async (req, res) => {
      const id = req.params;
      const query = {_id: new ObjectId(id)};
      const result = await propertiesCollection.findOne(query)
      res.send(result);
    })

     app.get('/recent-properties', async (req, res) => {
          const result = await propertiesCollection.find().sort({postedDate: 'desc'}).limit(6).toArray()
          
      res.send(result)
     })
    
    app.post('/properties', async (req, res) => {
      const newProperty = req.body;
      const result = await propertiesCollection.insertOne(newProperty);
      res.send(result)
    })
    
    app.patch('/properties/:id', async (req, res) => {
      const {id} = req.params;
      const query = { _id: new ObjectId(id) };
      const updateProperty = req.body;
      const update = {
        $set: {
          propertyName : updateProperty.propertyName,
          description : updateProperty.description,
          category : updateProperty.category,
          location : updateProperty.location,
          propertyPrice : updateProperty.propertyPrice,
          imageLinkInput : updateProperty.imageLinkInput
        }
      }
      const result = await propertiesCollection.updateOne(query, update);
      res.send(result);
    })

    app.delete('/properties/:id', async (req, res) => {
      const { id } = req.params;
      
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.deleteOne(query);
      res.send(result)
    })

    app.get('/myProperties', async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            } else {
              res.send('There is no email request')
            }

            const cursor = propertiesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
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


//real-state-homeNest
//0DS6YfWfmotowFnt
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})