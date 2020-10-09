const express=require('express')();
const bodyparser = require("body-parser");
const firebaseAdmin=require('firebase-admin');
const axios=require("axios");
const dotenv=require("dotenv");

express.use(bodyparser.json());
dotenv.config()

const serviceAccount = require("./whatisthis.json");

// Initialize the app with a service account, granting admin privileges
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://project-moonshot-55b8e.firebaseio.com"
  });
  
const slackRef=firebaseAdmin.firestore().collection("slack");
const repoRef=firebaseAdmin.firestore().collection("repos");

let globalCount=0;

const fetchCount=async ()=>{
    const {
        data: { channel:{
          num_members
        } },
      } = await axios.get("https://slack.com/api/conversations.info?token="+process.env.SLACK_TOKEN+"&channel=C011WC12VK8&include_num_members=true&pretty=1");
      globalCount=num_members;
}

express.post("/push",async (req,res)=>{
    const repoBody=req.body;
    const branchName=repoBody.ref.split("/")[2];
    if(branchName=="hook"){
        const commits=repoBody.commits.length;
        const previousTotal= await (await repoRef.doc('count').get()).data().total;
        
        repoRef.doc('count').update({total:previousTotal+commits});
    }    
})

express.post("/",async (req,res)=>{
    const slackBody=req.body;    
    console.log(slackBody);
    if(slackBody.event.type=="team_join"){
        await fetchCount();
        const userProfile=slackBody.event.user;        
        const slackObj={
            count:globalCount,
            newMember:{
                name:userProfile.real_name                
            }
        }
        slackRef.doc('info').update(slackObj);
    }
})



express.get("/",(req,res)=>{
    res.send("<h1>Wannabe Linux Power user</h1>");
})

express.listen(3000,()=>{
    console.log("Server Started at http://localhost:3000");
    console.log(process.env.SLACK_TOKEN);
})
