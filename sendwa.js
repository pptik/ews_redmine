require('dotenv').config();
const axios = require('axios');
var st;
async function send (no, tit, con){

    try{

        await axios({
        
            method: 'post',
            url: process.env.WA_HOST,
            data: {
                number: no,
                title: tit,
                content: con
            },
            headers: {
                'Content-Type': 'application/json',
                'x-access-token':process.env.WA_TOKEN
              }
          }).then (function (response){
            // console.log(response.data);
            st = response.data
        })
        return st
    }
    catch(error)
    {
        console.log(error.response.data)
        return error.response.data

    }
    
        
};



module.exports={send}