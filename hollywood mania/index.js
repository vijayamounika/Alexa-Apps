const quizQues = require("./movieshollywood.js");


const Alexa = require("alexa-sdk");

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.154eb875-2d18-4e88-be80-e76a515a19e0";
    alexa.registerHandlers(handlers);
    alexa.dynamoDBTableName = 'HollywoodRapidFire';
    alexa.execute();
};


const handlers = {
    'LaunchRequest': function () {
        if (this.attributes.quesCount >= 1 && this.attributes.quesCount < 10) {
            this.attributes.quizState = "inprogress";


            this.response.speak("Hi! Welcome back. you have answered " + this.attributes.correctscore + " questions correctly out of 10 and have "
                + this.attributes.score + " points , Do you want to continue or do you want to start a new game? Say yes to start a new game or continue to continue the previous game")


                .shouldEndSession(false);
            ;
            this.emit(":responseReady");
        }



        else {
            console.log("launch request intent");
            for (var key in this.attributes) {
                delete this.attributes[key];
            }
            this.attributes.quizState = "notInProgress";
            this.attributes.gamesplayed = 0;
            this.attributes.playingSameAgain = 0;
            this.attributes.speechText = "Welcome to Hollywood rapid fire. Would you like to know the instructions, before starting the quiz, if yes say instructions to know how to play , or, say yes to jump instructions and play quiz";

            this.response.speak("Welcome to Hollywood rapid fire. Would you like to know the instructions, before starting the quiz, if yes say instructions to know how to play , or, say yes to jump instructions and play quiz")
                .listen("Say yes to begin or say instructions to know the rules")
                .shouldEndSession(false);
            this.emit(":responseReady");
        }

    },

    "InstructionsIntent": function () {
        console.log("instruction intent start", this.attributes.gamesplayed);
        if (this.attributes.gamesplayed == 0) {

            this.attributes.quizType = "quiz";
            this.attributes.askedQuesarray = [];//resetting for the new quiz
            this.attributes.quesResult = "";
            this.attributes.quesCount = 0;
            this.attributes.speechText = "Okay, In this, i will describe a movie in one or two sentences,  and you should guess the movie within the time, that is 8 seconds, for every correct answer , you will get 10 points and , no points will be awarded for the wrong answer. Are you ready to play? Say yes to begin";


            this.response.speak("Okay, In this, i will describe a movie in one or two sentences,  and you should guess the movie within the time, that is 8 seconds, for every correct answer , you will get 10 points and , no points will be awarded for the wrong answer. Are you ready to play? Say yes to begin")
                .listen("you need to say yes to begin the quiz")
                .shouldEndSession(false);
            this.emit(':responseReady');


        }
        else {


            this.emitWithState('StartIntent');
        }
        this.emitWithState('StartIntent');
    },
    "AMAZON.YesIntent": function () {
        this.attributes.quizType = "quiz";
        this.attributes.askedQuesarray = [];//resetting for the new quiz
        this.attributes.quesResult = "";
        this.attributes.quesCount = 0;
        this.attributes.speechText = "";
        this.emitWithState('StartIntent');
    },

    'StartIntent': function () {
        if (this.attributes.quesCount == 0) {
            this.attributes.score = 0;
            this.attributes.correctscore = 0;
        }

        console.log("Start intent");
        let currentSet = quizQues;
        let maxCount = 10;

        let currquesindex;

        this.attributes.askedQuesarray = this.attributes.askedQuesarray || [];
        do {
            currquesindex = Math.floor(Math.random() * currentSet.hollywoodMovies.length);

        }
        while (this.attributes.askedQuesarray.includes(currquesindex));
        this.attributes.askedQuesarray.push(currquesindex);

        var CurrQues = currentSet.hollywoodMovies[currquesindex].Q;

        this.attributes.correctAnswer = currentSet.hollywoodMovies[currquesindex].answer;
        this.attributes.currquesindex = currquesindex;
        this.attributes.CurrQues = CurrQues;
        this.attributes.quesCount = this.attributes.quesCount || 0;

        console.log("logging yes intent quesCount", this.attributes.quesCount);
        if (this.attributes.quesCount < maxCount) {
            console.log("logging yesintent if case quesCount", this.attributes.quesCount);
            let nextText = this.attributes.quesCount > 0 ? "next" : "first";
            var speechText = "Here's your " + nextText + " question";
            speechText += `<break time="0.25s"/>`
            speechText += `${CurrQues} `;
            speechText += `<break time="0.25s"/>`
            speechText += "your time starts now";
            speechText += '<audio src="https://s3.amazonaws.com/hollywoodrapidfire/toolur_Eg6kO1.mp3" />';
            speechText += "Can you say the movie name now?"
            this.attributes.speechText = speechText;
            speechText = `<break time="0.25s"/>` + speechText;

            speechText = (this.attributes.quesResult || "") + `<break time="0.25s"/>` + speechText;
            this.attributes.quizState = "inProgress";
            this.response.speak(speechText)
                .listen(speechText)
                .shouldEndSession(false);
            this.emit(':responseReady');


        }

        else {
            console.log("logging yes intent else case quesCount", this.attributes.quesCount);
            if (this.attributes.quizType == "quiz") {
                this.attributes.quizState = "notInProgress";

                console.log("logging yes intent else if quesCount", this.attributes.quesCount);
                this.response.speak((this.attributes.quesResult || "") + `<break time="0.25s"/>` + "you have answered " + this.attributes.correctscore +
                    " questions correctly and got " + this.attributes.score +
                    " points, would you like to play again or, do you want to stop ? If you want to play again say yes, to start a new one")
                    .shouldEndSession(false);
                this.emit(':responseReady');



            }


        }

    },
    'CheckIntent': function () {
        if (this.attributes.quizState != "inProgress") {
            console.log("logging quizstate " + this.attributes.quizState);

            this.emitWithState('Unhandled');

        }

        let useranswer = this.event.request.intent.slots.answer.value;

        console.log("logging useranswer ", useranswer);

        this.attributes.quesCount += 1;

        if (isStringEquals(this.attributes.correctAnswer, useranswer)) {
            console.log(this.attributes.correctAnswer);
            console.log("logging answer intent if case quesCount", this.attributes.quesCount);
            this.attributes.correctscore += 1;
            this.attributes.score += 10;
            this.attributes.quesResult = "Correct answer";




        }
        else {
            console.log("logging answer intent else case quesCount", this.attributes.quesCount);
            console.log(this.attributes.correctAnswer);

            this.attributes.quesResult = "Sorry, that is wrong answer";
        }

        this.emit('StartIntent');



    },
    'ContinueIntent': function () {
        this.attributes.quesResult = "";
        this.emitWithState('StartIntent');
    },
    'RepeatIntent': function () {
        console.log("repeat intent");

        this.response.speak(this.attributes.speechText).shouldEndSession(false);
        this.emit(':responseReady');
    },
    'IDKIntent': function () {
        console.log("idk intent intent");

        this.attributes.quesCount += 1;
        this.attributes.quesResult = "ok , no problem";


        this.emitWithState('StartIntent');

    },

    // 'NoIntent': function () {
    //     console.log("stop intent");
    //     this.emit(':saveState', true);


    //     this.response.speak("ok, No problem, we will play some other time, Goodbye").shouldEndSession(true);

    //     this.emit(':responseReady');
    // },
    // // 'StopIntent': function () {
    //     console.log("stop intent");
    //     this.emit(':saveState', true);


    //     this.response.speak("ok, No problem, we will play some other time, Goodbye").shouldEndSession(true);

    //     this.emit(':responseReady');
    // },
    'AMAZON.HelpIntent': function () {
        console.log("help intent");

        this.response.speak("Ok, I will describe a movie in one or two sentences , guess the movie within given time. Say yes to start the quiz").shouldEndSession(false);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        console.log("cancel intent");
        this.emit(':saveState', true);


        this.response.speak("ok, Goodbye").shouldEndSession(true);

        this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function () {
        console.log("no intent");

        this.response.speak("ok,No problem, let us play some other time, Have a good day").shouldEndSession(true);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        console.log("stop intent");
        this.emit(':saveState', true);


        this.response.speak("ok, No problem, we will play some other time, Goodbye").shouldEndSession(true);

        this.emit(':responseReady');

    },
    'Unhandled': function () {  // if we get any intents other than the above
        console.log("unhandled intent");

        console.log(this.attributes.quizState);
        this.response.speak('Sorry, I didn\'t get that, please say again')
            .listen('try again')
            .shouldEndSession(false);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        this.emit(':saveState', true);
    }


};
function isStringEquals(a, b) {
    return (a || " ").toLowerCase() == (b || " ").toLowerCase();
}














