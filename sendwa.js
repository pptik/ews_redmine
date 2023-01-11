import * as dotenv from 'dotenv'
dotenv.config()
import axios, * as others from 'axios';
var st;
async function send(no, tit, con) {
    try {
        let st = await axios({
            method: 'post',
            url: process.env.WA_HOST,
            data: {
                number: no,
                title: tit,
                content: con
            },
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': process.env.WA_TOKEN
            }
        })
        return st.data
    }
    catch (error) {
        console.log(error)
        return error

    }


};



export { send }