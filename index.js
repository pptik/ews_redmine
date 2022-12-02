const schedule = require('node-schedule');
require('dotenv').config();

const db = require('./db');
const wa = require('./sendwa');
const today = new Date(Date.now());
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate()+1);
tom = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
console.log("application running ..")
// schedule job
schedule.scheduleJob(' 02 14 * * *', function(){
  console.log('job start...')
 async function sch()
  {
    const dt = await db.find('issue_logs', tom);
    if (dt.length)
    {
      // dt.forEach(d => ns= wa.send(`${d.payload.user_terkait.hp}`, 'Redmine', 'issue besok due date'));
      // console.log(d)
       dt.forEach(async function(d) {
        ns = await wa.send(`${d.payload.user_terkait.hp}`, 'Redmine', `Reminder: Due date issue [${d.payload.issue_id}]: ${d.payload.issue_subject}, project [${d.payload.project.project_name}] pada tanggal ${d.payload.due_date}`);
        d.payload.status_notifikasi.ews = ns;
        await db.update('issue_logs',d._id, d.payload.status_notifikasi)
        // console.log(d)

    });
    }else{

      console.log('tidak ada issue yang due date nya besok');
    }
  }
  sch()
     
  });