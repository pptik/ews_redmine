import * as schedule from 'node-schedule'
import axios from 'axios'
// import * as db from './db.js'
import * as wa from './sendwa.js'
import * as dotenv from 'dotenv'
import moment from 'moment'

dotenv.config()

// Define the function you want to run
function cekIssue() {
  console.log('Mulai Mengecek Issue')
  const yesterday = moment().subtract(1, 'day');
  const headers = {
    'Content-type': 'application/json',
    'X-Redmine-API-Key': process.env.API_KEY
  }
  axios.get(process.env.API_URL + "/issues.json", { headers })
    .then(function (response) {
      if(response.status == 200) {
        for(let i = 0; i < response.data.issues.length; i++) {
          if(response.data.issues[i].status.is_closed == false) {
            if(response.data.issues[i].due_date != null) {
              console.log("mengecek tugas " + response.data.issues[i].subject)
              console.log("deadline " + response.data.issues[i].due_date)
              let duedate = moment(response.data.issues[i].due_date)
              if (duedate.isSameOrAfter(yesterday, 'day')) {
                if(response.data.issues[i].assigned_to != null) {
                  console.log(process.env.AI_NAME + ' mengingatkan ' + response.data.issues[i].assigned_to['name'] + "(ID:" + response.data.issues[i].assigned_to['id'] + ") mohon segera selesaikan tugas " + response.data.issues[i].subject + "dan close jika sudah selesai.");
                  // extract nomor hp dari user
                  axios.get(process.env.API_URL + "/users/" + response.data.issues[i].assigned_to['id'] + ".json", { headers })
                  .then(function (response_users) {
                    if(response_users.status == 200) {
                      if(response_users.data.user.custom_fields != null) {
                        let nomor_hp = response_users.data.user.custom_fields[0].value
                        if(nomor_hp != null) {
                          wa.send(nomor_hp, 'Redmine', process.env.AI_NAME + ' mengingatkan ' + response.data.issues[i].assigned_to['name'] + " (ID:" + response.data.issues[i].assigned_to['id'] + ") mohon segera selesaikan tugas " + response.data.issues[i].subject + " dan close jika sudah selesai.");
                        }
                      }
                    }
                  })
                  .catch(function (error_users) {
                    console.log(error_users)
                  })
                }
              }
            }
          }
        }
      }
      console.log('Selesai Mengecek Issue')
    })
    .catch(function (error) {
      console.log(error)
    })
}

const scheduledTime = new Date()
scheduledTime.setHours(process.env.SET_JAM)
scheduledTime.setMinutes(process.env.SET_MENIT)

schedule.scheduleJob({ hour: scheduledTime.getHours(), minute: scheduledTime.getMinutes() }, function() {
  cekIssue()
})