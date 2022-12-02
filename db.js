require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = new MongoClient(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`);

async function add(col, val) {
  // Use connect method to connect to the server
  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(process.env.MONGO_DBNAME);
    const collection = db.collection(col);
    if (collection.insertOne(val)) console.log(`Insertion Successful`);
  } catch (error) {
    console.log(error)
  }
  // return 'done.';
}
async function find(col, tgl) {
  // Use connect method to connect to the server
  try {
    // const client = new MongoClient(process.env.MONGOURL);
    await client.connect();
    // console.log('Connected successfully to server');
    const db = client.db(process.env.MONGO_DBNAME);
    const collection = db.collection(col);
    let result = collection.find({"payload.user_terkait.hp":{$exists:true}, "payload.due_date":tgl})
    return result.toArray()
  } catch (error) {
    console.log(error)
  } 

  
  // return 'done.';
}

async function update (col, id, data) {
  try {
    await client.connect();
    // database and collection code goes here
    const db = client.db(process.env.MONGO_DBNAME);
    const coll = db.collection(col);
    // update code goes here
    const filter = {"_id":id};
    const updateDoc = {
      $set:{"payload.status_notifikasi":data}
    };
    const result = await coll.updateOne(filter, updateDoc);
    // display the results of your operation
    console.log("Number of documents updated: " + result.modifiedCount);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

//   main()
//     .then(console.log)
//     .catch(console.error)
//     .finally(() => client.close());

// module.exports = { add };
// async function find(col){
//     await client.connect();
//     console.log('Connected successfully to server');
//     const db = client.db(process.env.MONGO_DBNAME);
//     const collection = db.collection(col);
//     let result = collection.find({"mode":'10'});

//     return result.toArray()
    // result = collection.findOne()
    // .then(function(result) {
    //     console.log(result); // Use this to debug
    //     callback(result);
    // }
    // callback(result)
    // console.log(result)
// }

module.exports= { add, find, update }