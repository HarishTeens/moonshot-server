const express=require('express')();
const bodyparser = require("body-parser");
const firebaseAdmin=require('firebase-admin');
const axios=require("axios");
const dotenv=require("dotenv");
const {setTimeoutUtil}=require("./helpers/rateLimiter");

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
const p5jsRef=firebaseAdmin.firestore().collection("p5js");
const contributorsRef=firebaseAdmin.firestore().collection("contributors");
const colorsRef=firebaseAdmin.firestore().collection("colors");

let globalCount=0;

const fetchCount=async ()=>{
    const {
        data: { channel:{
          num_members
        } },
      } = await axios.get("https://slack.com/api/conversations.info?token="+process.env.SLACK_TOKEN+"&channel=C011WC12VK8&include_num_members=true&pretty=1");
      
      globalCount=num_members;
}

const isValidBranch= async (branchName,fullRepoName)=>{
    let defaultBranches=new Map();
    const reposList= await repoRef.get();
    reposList.forEach((each)=>{
        const repo=each.data();
        defaultBranches.set(repo.owner+"/"+repo.name,repo.branch);
    })
    return defaultBranches.get(fullRepoName) == branchName;
    
}

const getAvatarURL=async (name)=>{
    const headersConfig= { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
    const {
        data: { avatar_url }
      } = await axios.get("https://api.github.com/users/"+name,headersConfig);
      
    return avatar_url;
}

const updateContributors=async (commits,fullRepoName)=>{
    let contributors=new Set();
    commits.map((commit)=>{
        contributors.add(commit.author.username);
    })
    const prevContributors=await contributorsRef.get();    

    for(let contributor of contributors){
        contributorsRef.doc(contributor).get().then(async (snapshot)=>{            
            if(snapshot.exists){
                const contributions=(await contributorsRef.doc(contributor).get()).data().contribution;
                const contributionsSet=new Set();
                contributions.forEach((contribution)=>{
                    contributionsSet.add(contribution);
                })
                contributionsSet.add(fullRepoName);
                const contributionsArray=[];
                for(let item of contributionsSet){
                    contributionsArray.push(item);
                }
                await contributorsRef.doc(contributor).update({contribution: contributionsArray});
            }else{
                const avatar_url=await getAvatarURL(contributor);
                await contributorsRef.doc(contributor).set({contribution:[fullRepoName],avatar_url:avatar_url});
            }
        })
    }
    
    
}


express.post("/push",async (req,res)=>{
    const repoBody=req.body;
    if(!repoBody.ref){
        res.sendStatus(204);
    }else{
        const branchName=repoBody.ref.split("/")[2];
        const fullRepoName=repoBody.repository.full_name;
        if(await isValidBranch(branchName,fullRepoName)){
            const commits=repoBody.commits.length;
            const previousCount= await (await p5jsRef.doc('p5js').get()).data().count;        
            p5jsRef.doc('p5js').update({count:previousCount+commits});
            await updateContributors(repoBody.commits,fullRepoName);
            res.sendStatus(202);
        }else{
            res.sendStatus(203);
        }    
    }
    
    
})

express.post("/",async (req,res)=>{
    const slackBody=req.body;    
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
    res.send(200);
})




setTimeout(()=>setTimeoutUtil([],200,colorsRef),200);

express.get("/",(req,res)=>{
    res.send("<h1>Wannabe Linux Power user</h1>");
})

express.listen(3000,async ()=>{
    console.log("Server Started at http://localhost:3000");
})
