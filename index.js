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
  axios.get(`${process.env.API_URL}/issues.json`, { headers })
  .then(response => {
    if (response.status !== 200) return;
    const { issues } = response.data;
    const promises = issues.reduce((acc, issue) => {
      const { status, due_date, assigned_to, subject } = issue;
      if (status.is_closed || !due_date) return acc;
      const duedate = moment(due_date);
      if (duedate.isBefore(yesterday, 'day')) return acc;
      if (!assigned_to) return acc;
      console.log(`Sudah mepet deadline, tolong bereskan tugas ${assigned_to.name} (ID:${assigned_to.id}): ${subject}`);
      acc.push(
        axios.get(`${process.env.API_URL}/users/${assigned_to.id}.json`, { headers })
          .then(response_users => {
            if (response_users.status !== 200) return;
            const { custom_fields } = response_users.data.user;
            if (!custom_fields) return;
            const nomor_hp = custom_fields[0].value;
            return wa.send(nomor_hp, 'Redmine', `Sudah mepet deadline, tolong bereskan tugas ${assigned_to.name}: ${subject}`);
          })
          .catch(error_users => {
            console.log(error_users);
          })
      );
      return acc;
    }, []);
    Promise.all(promises)
      .then(() => {
        console.log('Selesai Mengecek Issue');
      })
      .catch(error => {
        console.log(error);
      });
  })
  .catch(error => {
    console.log(error);
  });
}

const scheduledTime = new Date()
scheduledTime.setHours(1)
scheduledTime.setMinutes(0)
scheduledTime.setSeconds(0)

schedule.scheduleJob({ hour: scheduledTime.getHours(), minute: scheduledTime.getMinutes() }, function() {
  cekIssue()
})