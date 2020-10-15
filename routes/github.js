const express=require('express');
const router=express.Router();

router.post("/push",async (req,res)=>{
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

module.exports=router;