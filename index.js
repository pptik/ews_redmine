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
      const messagesByAssignedTo = {};

      issues.forEach(issue => {
        const { id, project, status, due_date, assigned_to, subject } = issue;
        if (status.is_closed || !due_date) return;
        const duedate = moment(due_date);
        if (duedate.isAfter(moment().add(3, 'day'), 'day')) return;
        if (!assigned_to) return;

        axios.get(`${process.env.API_URL}/users/${assigned_to.id}.json`, { headers })
          .then(response_users => {
            if (response_users.status !== 200) return;
            const { custom_fields } = response_users.data.user;
            if (!custom_fields) return;
            const nomor_hp = custom_fields[0].value;
            const link_issue = `${process.env.API_URL}/issues/${id}`;
            const link_project = `${process.env.API_URL}/projects/${project.id}`;
            const messageObj = { subject, link_issue, link_project };
            if (!messagesByAssignedTo[nomor_hp]) {
              messagesByAssignedTo[nomor_hp] = [messageObj];
            } else {
              messagesByAssignedTo[nomor_hp].push(messageObj);
            }
          })
          .catch(error_users => {
            console.log(error_users);
          })
      });

      const promises = [];
      for (const nomor_hp in messagesByAssignedTo) {
        const messages = messagesByAssignedTo[nomor_hp];
        let combinedMessage = `mengingatkan ${assigned_to.name}, mohon segera selesaikan tugas :\n\n`;
        messages.forEach((message, index) => {
          const { subject, link_issue, link_project } = message;
          combinedMessage += `${index + 1}. ${subject}. Link Issue : ${link_issue} dan Link Project : ${link_project}. Jangan lupa untuk CLOSE issue jika sudah selesai.\n\n`;
        });
        console.log(`LOG [${moment().format()}] : ${combinedMessage}`);
        promises.push(wa.send(nomor_hp, 'Redmine', combinedMessage));
      }
      // const { issues } = response.data;
      // const promises = issues.reduce((acc, issue) => {
      //   const { id, project, status, due_date, assigned_to, subject } = issue;
      //   if (status.is_closed || !due_date) return acc;
      //   const duedate = moment(due_date);
      //   if (duedate.isAfter(moment().add(3, 'day'), 'day')) return acc;
      //   if (!assigned_to) return acc;
      //   // console.log(`Sudah mepet deadline, tolong bereskan tugas ${assigned_to.name} (ID:${assigned_to.id}): ${subject}`);
      //   acc.push(
      //     axios.get(`${process.env.API_URL}/users/${assigned_to.id}.json`, { headers })
      //       .then(response_users => {
      //         if (response_users.status !== 200) return;
      //         const { custom_fields } = response_users.data.user;
      //         if (!custom_fields) return;
      //         const nomor_hp = custom_fields[0].value;
      //         const link_issue = `${process.env.API_URL}/issues/${id}`;
      //         const link_project = `${process.env.API_URL}/projects/${project.id}`;
      //         const messageWa = `${process.env.AI_NAME} mengingatkan ${assigned_to.name}, mohon segera selesaikan tugas : ${subject}. Link Issue : ${link_issue} dan Link Project : ${link_project}. Jangan lupa untuk CLOSE issue jika sudah selesai.`;
      //         console.log(`LOG [${moment().format()}] : ${messageWa}`);
      //         return wa.send(nomor_hp, 'Redmine', messageWa);
      //       })
      //       .catch(error_users => {
      //         console.log(error_users);
      //       })
      //   );
      //   return acc;
      // }, []);
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
scheduledTime.setHours(process.env.SET_JAM)
scheduledTime.setMinutes(process.env.SET_MENIT)
scheduledTime.setSeconds(0)

schedule.scheduleJob({ hour: scheduledTime.getHours(), minute: scheduledTime.getMinutes() }, function () {
  cekIssue()
})