const axios=require("axios");

module.exports=async (prevProps,colorsRef)=>{
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
  //   const curTime=new Date();
  //   const timeDiff=30000;
  //   const allCommentMessages=commentItems.filter((each)=>{
  //     const messageTime=new Date(each.snippet.publishedAt);
  //     return curTime-messageTime<timeDiff
  //   })
    const allCommentMessages=commentItems.map(each=>each.snippet.textMessageDetails.messageText);
    console.log(allCommentMessages);
    const validCommentMessages=allCommentMessages.filter(each=>{
      return each.substring(0,6)=="-color"
    })
    let lastValidColor;
    if(validCommentMessages.length>0){      
      for(let i=validCommentMessages.length-1;i>=0;--i){
        if(validCommentMessages[i].substring(7).match("^#[a-fA-F0-9]{6}")){
          console.log(validCommentMessages[i].substring(7));
          colorsRef.doc('colors').update({color1:validCommentMessages[i].substring(7)});
          lastValidColor=validCommentMessages[i].substring(7);
          break;
        }
          
      }
    }   
    //send it to firebase
    
  if(prevProps==lastValidColor){
      return [lastValidColor,0];
  }else{
      return [lastValidColor,1];
  }

}