const fetchAndUpdateYoutubeComments=require("./youtubeComments");

const rateLimits=[180000,60000,20000,10000]

const setTimeoutUtil=async (prevProps,callInterval,colorsRef)=>{    
    console.log(callInterval);
    const [newProps,returnVal]=await fetchAndUpdateYoutubeComments(prevProps,colorsRef);
    if(returnVal==1){
        console.log("speed up");
        callInterval=speedUp(callInterval);       
        
    }else{
        console.log("speed down");
        callInterval=speedDown(callInterval,colorsRef);
    }        
    setTimeout(()=>setTimeoutUtil(newProps,callInterval,colorsRef),callInterval)
}

const speedDown=(val,colorsRef)=>{
    
    if(val==rateLimits[0])
        return rateLimits[0];
    else if(val==rateLimits[1]){
        colorsRef.doc('colors').update({color1:"#183d5d"});
        return rateLimits[0];
    }        
    else if(val==rateLimits[2])
        return rateLimits[1];
    else if(val==rateLimits[3])
        return rateLimits[2];
    else
        return rateLimits[0];
        
}

const speedUp=(val)=>{
    if(val==rateLimits[3])
        return rateLimits[3];
    else if(val==rateLimits[2])
        return rateLimits[3];
    else if(val==rateLimits[1])
        return rateLimits[2];
    else if(val==rateLimits[0])
        return rateLimits[1];
    else
        return rateLimits[0];
}

module.exports={
    setTimeoutUtil,
    speedDown,
    speedUp
}