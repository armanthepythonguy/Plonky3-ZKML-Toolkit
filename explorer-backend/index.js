import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());

const uri = "MONGOURI";
const client = new MongoClient(uri);
const db = client.db("ethindia");
const proofCollection = db.collection("proofs");
const agentsCollection = db.collection("agents");

app.get("/proofs", async(req, res) => {
    await client.connect();
    const proofs = await proofCollection.find({}).sort({timestamp:-1}).limit(10).toArray();
    res.status(200).json(proofs)
})

app.get("/agent/:id", async(req, res) => {
    await client.connect();
    const agent = await agentsCollection.find({_id: new ObjectId(req.params.id)}).toArray();
    const proofs = await proofCollection.find({agentId: new ObjectId(req.params.id)}).sort({timestamp:-1}).limit(5).toArray();
    res.status(200).json({"agent": agent, "proofs": proofs})
})

app.post("/upload-proof", async(req, res) => {
    await client.connect();
    const agent = await agentsCollection.find({_id: new ObjectId(req.body.id)}).toArray();
    if(agent.length === 0){
        console.log("New agent !!");
        const newAgent = await agentsCollection.insertOne({"desc": req.body.desc});
        await proofCollection.insertOne({agentId: newAgent.insertedId, proofs: req.body.proofs, actual: req.body.actual, predicted: req.body.predicted, timestamp: Date.now()});
    }else{
        console.log("Proof from known agent !!")
        await proofCollection.insertOne({agentId: new ObjectId(req.body.id), proofs: req.body.proofs, actual: req.body.actual, predicted: req.body.predicted, timestamp: Date.now()});
    }
    res.status(200).json({})
})

app.listen(3001, ()=>{
    console.log("Backend is listening to http://localhost:3001");
})