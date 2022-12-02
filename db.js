require('dotenv').config();
const { MongoClient } = require('mongodb');
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;
const client = new MongoClient(url);;

async function add(col, val) {
  // Use connect method to connect to the server
  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
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
    const db = client.db(dbName);
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
    const db = client.db(dbName);
    const coll = db.collection(col);
    // update code goes here
    const filter = {"_id":id};
    const updateDoc = {
      $set:{"payload.status_notifikasi":data}
    };
    const result = await coll.updateOne(filter, updateDoc);
    // display the results of your operation
    console.log("Number of documents updated: " + result.modifiedCount);
  } 
  catch (error) {
    console.log(error)
  } 
}


// find('issue_logs', '2022-12-03')
//   main()
//     .then(console.log)
//     .catch(console.error)
//     .finally(() => client.close());

// module.exports = { add };
// async function find(col){
//     await client.connect();
//     console.log('Connected successfully to server');
//     const db = client.db(dbName);
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