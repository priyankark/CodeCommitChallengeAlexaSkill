var Alexa=require('alexa-sdk');

var TwitterHelper = require('./twitter_helper');

var List=require('./projectIdeas');

console.log(List());

var handlers={

  'LaunchRequest': function() {
      if(Object.keys(this.attributes).length === 0)
      {
        this.attributes['today']=0;
        this.attributes['total']=0;
        this.attributes['days']=0;
        //this.attributes['n']=0;
        this.emit(':saveState',true);

      }
      var ref=this;
      var speechOutput="Code Commit Challenge is about dedicating yourself to coding for an hour everyday for as many days as possible. Sample invocations are on the card in the app. ";
      var cardTitle="Sample Invocations";
      var cardContent="Invocation name: code challenge\n Utterances \n"+
                      "...for help\n"+
                      "...to tell me a project idea.\n"+
                      "...to add/log <hours> hours. \n"+
                      "...to tweet (my progress) \n"+
                      "...to reset my progress (resets today's progress) \n"+
                      "...to show my logs (sent to card on the app)\n"+
                      "To change the logs for the day, reset first and then add new values\n"+
                      "To reset entire challenge, disable and re-enable the skill\n";
      if(!ref.event.session.user.accessToken||ref.event.session.user.accessToken==null||ref.event.session.user.accessToken==undefined||ref.event.session.user.accessToken==="")
      {
        ref.emit(':tellWithLinkAccountCard','You need to link your Twitter account to use the tweet feature. Link your account from the card in the app or ask for project ideas.');
      }
      else
      ref.emit(':askWithCard', speechOutput,speechOutput,cardTitle, cardContent);
    },
    'AMAZON.StopIntent': function() {
        this.response.speak('Ok, see you again soon.');
        this.emit(':responseReady');
    },

    // Cancel
    'AMAZON.CancelIntent': function() {
        this.response.speak('Ok, see you again soon.');
        this.emit(':responseReady');
    },

    'AMAZON.HelpIntent': function() {
      if(Object.keys(this.attributes).length === 0)
      {
        this.attributes['today']=0;
        this.attributes['total']=0;
        this.attributes['days']=0;
        //this.attributes['n']=0;
        this.setState(':saveState',true);

      }
      var ref=this;
      var speechOutput="Code Commit Challenge is about dedicating yourself to coding for an hour everyday for as many days as possible. You can log the number of hours you coded in a day and ask to tweet your progress. You can also search for project ideas. Sample invocations are on the card in the app. What would you like to do? ";
      var cardTitle="Sample Invocations";
      var cardContent="Invocation name: code challenge\n Utterances \n"+
                      "...for help\n"+
                      "...to tell me a project idea.\n"+
                      "...to add/log <hours> hours. \n"+
                      "...to tweet (my progress) \n"+
                      "...to reset my progress (resets today's progress) \n"+
                      "...to show my logs (sent to card on the app)\n"+
                      "To change the logs for the day, reset first and then add new values\n"+
                      "To reset entire challenge, disable and re-enable the skill\n";
      ref.emit(':askWithCard', speechOutput,speechOutput,cardTitle, cardContent);

    },



  'Tweet':function(){
    //console.log(this.event.session.user.accessToken);
    var ref=this;
    if(!ref.event.session.user.accessToken||ref.event.session.user.accessToken==null||ref.event.session.user.accessToken==undefined||ref.event.session.user.accessToken==="")
    {
      ref.emit(':tellWithLinkAccountCard','You need to link your Twitter account to use the tweet feature. Link your account from the card in the app.');
    }
    else {
    if(Object.keys(this.attributes).length === 0||this.attributes["days"]===0||this.attributes["today"]===0||this.attributes["total"]===0)
      this.emit(':tell','You havent started the challenge today yet.');
    else {
    var speechOutput="Tweet sent!";
    //var ref=this;
    var twitterHelper = new TwitterHelper(this.event.session.user.accessToken);
    if(this.attributes["days"]===1)
    {
      Promise.resolve(twitterHelper.postTweet("I commit myself to the #CodeCommitChallenge where I shall code for an hour everyday working on projects. #CodeCommitChallenge")).then(function(status){
        ref.emit(':tell',speechOutput);
      });
    }
    if(this.attributes["days"]!==0)
    Promise.resolve(
        twitterHelper.postTweet('I just logged '+this.attributes["today"]+" hours today towards #CodeCommitChallenge. Total hours logged "+this.attributes["total"]+" Day: "+this.attributes["days"])).then(function(status){
        ref.emit(':tell',speechOutput);
    });

  }
}
  },

  'GenerateProjectIdea':function(){
    var idea=List();
    var speechOutput=idea;
    var cardTitle="Project Idea";
    var cardContent=idea;
    cardContent+="\nSource:https://github.com//karan//Projects "
    this.emit(':tellWithCard',speechOutput,cardTitle,cardContent);

  },

  'LogBook':function(){
    var logs=this.event.request.intent.slots.logs.value;
    if(Object.keys(this.attributes).length === 0)
    {
      this.attributes['today']=0;
      this.attributes['total']=0;
      this.attributes['days']=0;
      //this.attributes['n']=0;
      //this.emit(':saveState',true);
    }
    if(!logs||isNaN(logs))
    {
      this.emit(':ask','Sorry I didn\'t understand what you just said. Please say a valid number for the number of hours or say help for further help. Try again!');
    }
    else {
      this.attributes['today']=logs;
      this.attributes['total']=parseFloat(this.attributes['total'])+parseFloat(logs);
      this.attributes['days']+=1;
      this.emit(':saveState',true);

    }
    var speechOutput="You have logged "+this.attributes["today"]+" hours today. Total hours\
    logged in the challenge is "+ this.attributes["total"] +" You are on day "+this.attributes["days"];
    var cardTitle="Code Logs";
    var cardContent="Today's hours logged: "+this.attributes["today"]+"\n"+
                    "Total hours logged: "+this.attributes["total"]+"\n"+
                    "Total days into the challenge: "+this.attributes["days"];
    this.emit(':saveState',true);
    this.emit(':tellWithCard',speechOutput,cardTitle,cardContent);

  },

  'ResetIntent':function(){
    if(Object.keys(this.attributes).length === 0||this.attributes['today']==0)
      this.emit(':tell','You haven\'t started the challenge or logged any hours today.' );
    else {
    this.attributes["total"]-=this.attributes["today"];
    this.attributes["today"]=0;
    if(this.attributes["days"]!=0)
      this.attributes["days"]--;
    this.emit(':tell','Statistics for today were reset.');
    }
  },

  'ShowIntent':function(){
    if(Object.keys(this.attributes).length === 0)
    {
      this.emit(':tell','You haven\'t started the challenge yet!');
    }
    var speechOutput="You have logged "+this.attributes["today"]+" hours today. Total hours\
    logged in the challenge is "+this.attributes["total"]+" You are on day "+this.attributes["days"];
    var cardTitle="Code Commit Logs";
    var cardContent="Today's hours logged: "+this.attributes["today"]+"\n"+
                    "Total hours logged: "+this.attributes["total"]+"\n"+
                    "Day: "+this.attributes["days"];
    this.emit(':saveState',true);
    this.emit(':tellWithCard',speechOutput,cardTitle,cardContent);


  },
  'SessionEndedRequest': function() {
    console.log('session ended!');
    this.emit(':saveState', true);
  }

};





exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.dynamoDBTableName = 'CodeChallenge';
    alexa.registerHandlers(handlers);
    alexa.execute();
};
