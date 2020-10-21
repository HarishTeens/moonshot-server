const axios=require("axios");

module.exports=async (prevProps,colorsRef)=>{
  try {
    const {
        data: {
            items:commentItems
        }
    }=await axios.get("https://www.googleapis.com/youtube/v3/liveChat/messages",{
      params: {
        key: process.env.GOOGLE_API_KEY,
        part:'snippet,authorDetails ',
        liveChatId:process.env.LIVE_CHAT_ID
      }
    })
    const allCommentMessages=commentItems.map(each=>each.snippet.textMessageDetails.messageText);
    console.log(allCommentMessages);
    const validCommentMessages=allCommentMessages.filter(each=>{
      return each.substring(0,6)=="-color"
    })
    let lastValidColor;
    if(validCommentMessages.length>0){      
      for(let i=validCommentMessages.length-1;i>=0;--i){
        if(validCommentMessages[i].substring(7).match("^#[a-fA-F0-9]{6}")){          
          lastValidColor=validCommentMessages[i].substring(7);
          break;
        }          
      }
    }   
              
    if(lastValidColor==undefined|| prevProps==lastValidColor){
        return [lastValidColor,0];
    }else{
        console.log(lastValidColor);
        colorsRef.doc('colors').update({color1:lastValidColor});
        return [lastValidColor,1];
    }
  } catch (error) {
    //In case of an Invalid LIVE Chat ID
    console.log(error.message);
    return ["",-1];
  }
}