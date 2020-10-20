const express=require('express')();
const bodyparser = require("body-parser");
const firebaseAdmin=require('firebase-admin');
const dotenv=require("dotenv");

express.use(bodyparser.json());
dotenv.config()

//Google App JSON Key
const serviceAccount = require("./whatisthis.json");

//Helpers
const YTHelper=require("./helpers/youtube/rateLimiter");
const slackHelpers=require('./helpers/slack');
const gitHubHelpers=require('./helpers/github');


// Initialize the app with a service account, granting admin privileges
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRESTORE_URL
});
  
//FireStore Collection References
const slackRef=firebaseAdmin.firestore().collection("slack");
const repoRef=firebaseAdmin.firestore().collection("repos");
const p5jsRef=firebaseAdmin.firestore().collection("p5js");
const contributorsRef=firebaseAdmin.firestore().collection("contributors");
const colorsRef=firebaseAdmin.firestore().collection("colors");

//Initiate Youtube Process
setTimeout(()=>YTHelper.initYTComments([],10000,colorsRef),200);

//Github Push Event Handler
express.post("/push",async (req,res)=>{
    const repoBody=req.body;
    if(!repoBody.ref){
        res.sendStatus(204);
    }else{
        const branchName=repoBody.ref.split("/")[2];
        const fullRepoName=repoBody.repository.full_name;
        if(await gitHubHelpers.isValidBranch(branchName,fullRepoName,repoRef)){
            const commits=repoBody.commits.length;
            const previousCount= await (await p5jsRef.doc('p5js').get()).data().count;        
            p5jsRef.doc('p5js').update({count:previousCount+commits});
            await gitHubHelpers.updateContributors(repoBody.commits,fullRepoName,contributorsRef);
            res.sendStatus(202);
        }else{
            res.sendStatus(203);
        }    
    }
})

//Slack Event Handler
express.post("/",async (req,res)=>{
    const slackBody=req.body;    
    if(slackBody.event.type=="team_join"){
        const totalMembers=await slackHelpers.fetchCount();
        const userProfile=slackBody.event.user;        
        const slackObj={
            count:totalMembers,
            newMember:{
                name:userProfile.real_name                
            }
        }
        slackRef.doc('info').update(slackObj);
    }
    res.sendStatus(200);
})

express.get("/",(req,res)=>{
    res.send("<h1>Wannabe Linux Power user</h1>");
})

express.listen(3000,async ()=>{
    console.log("Server Started at http://localhost:3000");
})
