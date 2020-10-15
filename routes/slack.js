const express=require('express');
const router=express.Router();

router.post("/",async (req,res)=>{
    const slackBody=req.body;    
    if(slackBody.event.type=="team_join"){
        const totalCount=await fetchCount();
        const userProfile=slackBody.event.user;        
        const slackObj={
            count:totalCount,
            newMember:{
                name:userProfile.real_name                
            }
        }
        await slackRef.doc('info').update(slackObj);
    }
})

module.exports=router;