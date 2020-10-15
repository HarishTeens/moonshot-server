const axios=require("axios");

module.exports=async (prevProps,colorsRef)=>{
  const {
      data: {
          items:commentItems
      }
  }=await axios.get("https://www.googleapis.com/youtube/v3/liveChat/messages",{
      params: {
        key: process.env.GOOGLE_API_KEY,
        part:'snippet',
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
    if(validCommentMessages.length>0){
      const recentColor=validCommentMessages[validCommentMessages.length-1].substring(7);
      colorsRef.doc('colors').update({color1:recentColor});
    }
    

    //send it to firebase
    
  if(prevProps[prevProps.length-1]==validCommentMessages[validCommentMessages.length-1]){
      return [validCommentMessages,0];
  }else{
      return [validCommentMessages,1];
  }

}