const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' });
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
//         if (err) {
//             return res.status(403).send({ message: 'Forbidden access' });
//         }
//         console.log('decoded', decoded);
//         req.decoded = decoded;
//         next();

//     });


// }

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1u7kw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partCollection = client.db('carparts-warehouse').collection('carparts');
        const orderCollection = client.db('carparts-warehouse').collection('order');

        //AUTH
        app.post('/login', async(req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })



        //jwt
        // app.post('/login', async(req, res) => {
        //     const user = req.body;
        //     const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        //         expiresIn: '1d'
        //     });
        //     res.send({ accessToken });
        // })


        app.get('/inventory', async(req, res) => {
            const query = {};
            const cursor = partCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        app.get('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const part = await partCollection.findOne(query);
            res.send(part);
        });

        //POST
        app.post('/inventory', async(req, res) => {
            const newItem = req.body;
            const result = await partCollection.insertOne(newItem);
            res.send(result);
        });

        //DELETE
        app.delete('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await partCollection.deleteOne(query);
            res.send(result);
        });

        // app.get('/order', verifyJWT, async(req, res) => {

        //     const decodedEmail = req.decoded.email;
        //     const email = req.query.email;
        //     console.log(email);
        //     if (email === decodedEmail) {
        //         const query = { email: email };
        //         const cursor = orderCollection.find(query);
        //         const myItems = await cursor.toArray();
        //         res.send(myItems);
        //     } else {
        //         res.status(403).send({ message: 'forbidden access' })
        //     }
        // })

        app.get('/orders', async(req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const myItems = await cursor.toArray();
            res.send(myItems);
        })


        //Order
        app.post('/order', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

    } finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Server from warehouse')
});

app.listen(port, () => {
    console.log('Listening to port', port);
})