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
  axios.get(`${process.env.API_URL}/issues.json?limit=50`, { headers })
    .then(response => {
      if (response.status !== 200) return;
      const { issues } = response.data;
      const messagesByAssignedTo = {};
      const issuePromises = issues.map(issue => {
        const { id, project, status, due_date, assigned_to, subject } = issue;
        if (status.is_closed || !due_date) return Promise.resolve();
        const duedate = moment(due_date);
        if (duedate.isAfter(moment().add(3, 'day'), 'day')) return Promise.resolve();
        if (!assigned_to) return Promise.resolve();

        return axios.get(`${process.env.API_URL}/users/${assigned_to.id}.json`, { headers })
          .then(response_users => {
            if (response_users.status !== 200) return;
            const { custom_fields } = response_users.data.user;
            if (!custom_fields || custom_fields[0].value == "") return;
            const nomor_hp = custom_fields[0].value;
            const link_issue = `${process.env.API_URL}/issues/${id}`;
            const link_project = `${process.env.API_URL}/projects/${project.id}`;
            const messageObj = { assigned_to, subject, link_issue, link_project };
            if (!messagesByAssignedTo[nomor_hp]) {
              messagesByAssignedTo[nomor_hp] = { assigned_to, messages: [messageObj] };
            } else {
              messagesByAssignedTo[nomor_hp].messages.push(messageObj);
            }
          })
          .catch(error_users => {
            console.log(error_users);
          });
      });

      Promise.all(issuePromises)
        .then(async () => {
          for (const nomor_hp in messagesByAssignedTo) {
            console.log(nomor_hp)
            const { assigned_to, messages } = messagesByAssignedTo[nomor_hp];
            let combinedMessage = `${process.env.AI_NAME} mengingatkan ${assigned_to.name}, mohon segera selesaikan tugas : `;
            messages.forEach((message, index) => {
              const { subject, link_issue, link_project } = message;
              combinedMessage += `${index + 1}. ${subject}. Link Issue : ${link_issue} dan Link Project : ${link_project}. `;
            });
            combinedMessage += "Jangan lupa untuk CLOSE issue jika sudah selesai.";

            try {
              await wa.send(nomor_hp, 'Redmine', combinedMessage);
              console.log(`LOG [${moment().format()}]  to ${assigned_to.name} : \n\n ${combinedMessage} \n\n`);
            } catch (error) {
              console.log("error sending wa");
            }
          }
        })
        .catch(error => {
          console.log('Error in Promise.all:', error);
        });
    })
    .catch(error => {
      console.log('Error in getting issues:', error);
    });

  console.log('Selesai Mengecek Issue')
}

const scheduledTime = new Date()
scheduledTime.setHours(process.env.SET_JAM)
scheduledTime.setMinutes(process.env.SET_MENIT)
scheduledTime.setSeconds(0)

schedule.scheduleJob({ hour: scheduledTime.getHours(), minute: scheduledTime.getMinutes() }, function () {
  cekIssue()
})
