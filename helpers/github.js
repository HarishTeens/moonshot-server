const axios=require("axios");

const isValidBranch= async (branchName,fullRepoName,repoRef)=>{
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

const updateContributors=async (commits,fullRepoName,contributorsRef)=>{
    let contributors=new Set();
    commits.map((commit)=>{
        contributors.add(commit.author.username);
    })

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


module.exports={
    isValidBranch,
    getAvatarURL,
    updateContributors
}