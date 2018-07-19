const Alexa = require('alexa-sdk');


exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.b7687a72-e0b2-472c-b5a8-a4aee554acb5";
    alexa.registerHandlers(handlers);
    alexa.dynamoDBTableName = 'waterReminder';
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        if (this.attributes.waterShouldDrinkInMl) {
            this.attributes.getwish = getWish();
            console.log("launchrequest if case");
            this.emit('waterLogIntent');
        }
        else {
            this.attributes.getwish = getWish();
            console.log("launchrequest else case");
            this.emit('StartIntent');
        }
    },
    'waterLogIntent': function () {
        console.log("water log intent so attributes were there");
        this.attributes.welcomebackCase = 1;
        this.attributes.genderCase = 0;
        this.attributes.physicalYesCase = 0;
        this.response.speak("Hi. Welcome back, please tell me how many glasses of water you want me to log. And you can fetch your water logs, by saying fetch my log on so and so date ")
            .listen("i did not get that can you please say that again")
            .shouldEndSession(false);
        this.emit(":responseReady");
    },

    'StartIntent': function () {

        console.log("start intent");
        this.attributes.physicalYesCase = 0;

        if (this.attributes.firstuser) {
            console.log("start intent if case");
            if (!this.attributes.height) {
                this.attributes.heightCase = 1;
                speechText = "Please tell me your height in centimeters";
            } else if (!this.attributes.weight) {
                this.attributes.weightCase = 1;
                this.attributes.heightCase = 0;
                speechText = "please tell me your weight in kilograms";
            } else if (!this.attributes.age) {
                this.attributes.heightCase = 0;
                this.attributes.weightCase = 0;
                this.attributes.ageCase = 1;

                speechText = "please tell me your age";
            }


            this.response.speak(speechText)
                .listen(speechText)
                .shouldEndSession(false);

        }
        else {

            console.log("start intent else case");
            this.attributes.physicalYesCase = 0;
            this.attributes.heightCase = 1;
            this.attributes.genderCase = 0;
            this.response.speak("Hi, Welcome to water tracker! In this i will let you know how much quantity of water you should drink daily. "
                + "Before that let me know your details first, and remember, i will take your details only once, so please be accurate. "
                + "What is your height in centimeters?")
                .listen("i did not get that can you please say that again")
                .shouldEndSession(false);


        }

        this.emit(":responseReady");

    },

    'DetailsIntent': function () {

        console.log("Details Intent");

        this.attributes.height = this.attributes.height || this.event.request.intent.slots.height.value;
        this.attributes.weight = this.attributes.weight || this.event.request.intent.slots.weight.value;
        this.attributes.age = this.attributes.age || this.event.request.intent.slots.age.value;

        if (!this.attributes.height || !this.attributes.weight || !this.attributes.age) {
            console.log("logging details intent if case");

            this.attributes.firstuser = 1;
            this.emit('LaunchRequest');
        }
        else {
            if (this.attributes.welcomebackCase == 1 || this.attributes.glassQuantityCase == 1 || this.attributes.physicalExerciseState == 1 || this.attributes.physicalYesCase == 1) {
                this.emit("Unhandled");
            }
            else {
                console.log("logging details intent else case");
                this.attributes.firstuser = 1;
                this.attributes.genderCase = 1;
                this.response.speak("You said your height is " + this.attributes.height + "cms and your weight is "
                    + this.attributes.weight + " kgs and your age is " + this.attributes.age +
                    " years ,please tell me your gender now")
                    .listen("please say your gender")
                    .shouldEndSession(false);
                this.emit(':saveState', true);
                this.emit(":responseReady");
            }
        }

    },
    'HeightDiffIntent': function () {
        this.attributes.firstuser = 1;
        // this.attributes.height = this.attributes.height || this.event.request.intent.slots.height.value;

        this.emit('LaunchRequest');
    },
    'GenderIntent': function () {
        console.log("gender intent");
        // console.log("logging gendercase " + genderCase);
        if (this.attributes.genderCase == 1) {
            console.log("gender intent if case");

            gender = this.event.request.intent.slots.gender.value;
            this.attributes.gender = gender.toString();
            console.log("logging gender" + this.attributes.gender);
            this.attributes.genderCase = 0;
            this.attributes.glassQuantityCase = 1;
            this.attributes.heightCase = 0;
            this.attributes.weightCase = 0;
            this.attributes.ageCase = 0;

            this.response.speak("Ok! now tell me how many ml of water you can fill in your glass")
                .listen("please say your glass quantity in ml")
                .shouldEndSession(false);
            this.emit(':saveState', true);
            this.emit(":responseReady");

        }
        else {
            console.log("gender intent else case");

            this.emit("Unhandled");
        }
    },
    'glassQuantitySaveIntent': function () {
        console.log("glass Quantity save intent");
        this.attributes.quantity = this.attributes.quantity || this.event.request.intent.slots.quantity.value;
        this.attributes.number = this.attributes.number || this.event.request.intent.slots.number.value;
        height = this.attributes.height;
        weight = this.attributes.weight;
        this.attributes.waterShouldDrink = calculateBMI(height, weight);
        if (this.attributes.gender == "female" || "male") {


            if (this.attributes.gender === "female") {
                console.log("glass quantity save intent female");
                this.attributes.waterShouldDrinkInMl = this.attributes.waterShouldDrink[1] * 1000;
                this.attributes.physicalExerciseState = 1;
                this.attributes.genderCase = 0;
                this.response.speak("Nice! you said your glass can hold " + this.attributes.number +
                    " " + this.attributes.quantity +
                    " that is great , and now i have calculated your bmi, "
                    + this.attributes.waterShouldDrink[0] + " you should drink " + this.attributes.waterShouldDrinkInMl +
                    " ml daily, now tell me about your physical activity,if you do any, i need to add 350 ml, "
                    + "for each half an hour, so if you do any say yes otherwise say no")
                    .shouldEndSession(false);

            }
            else {
                console.log("glass quantity save intent male");
                this.attributes.waterShouldDrinkInMl = this.attributes.waterShouldDrink[1] * 1000 + 1000;
                this.attributes.physicalExerciseState = 1;
                this.attributes.genderCase = 0;
                this.response.speak("Nice! you said your glass can hold " + this.attributes.number +
                    " " + this.attributes.quantity +
                    " that is great , and now i have calculated your bmi, "
                    + this.attributes.waterShouldDrink[0] + " so,you should drink " + this.attributes.waterShouldDrinkInMl +
                    " ml daily, now tell me about your physical activity,if you do any, i need to add 350 ml, "
                    + "for each half an hour, so if you do any say yes otherwise say no")
                    .shouldEndSession(false);

            }

            this.emit(':responseReady');
        }
        else {
            this.emit("Unhandled");

        }

    },
    "AMAZON.YesIntent": function () {
        console.log("logging yes intent");
        if (this.attributes.physicalExerciseState == 1) {
            this.attributes.physicalYesCase = 1;
            this.attributes.genderCase = 0;
            this.response.speak("Ok , now tell me the duration you spend on exercising in minutes")
                .listen("please say the time you spend in doing exercises")
                .shouldEndSession(false);
            this.emit(':responseReady');
        }
        else {
            this.emit("Unhandled");

        }

    },
    'physicalActIntent': function () {
        console.log("logging physical act intent");
        if (this.attributes.waterlogCase == 1) {
            this.attributes.wnumber = this.event.request.intent.slots.num.value;
            this.emit('waterIntent');
        }
        else {
            if (this.attributes.physicalYesCase == 1) {
                this.attributes.physicalActTime = this.event.request.intent.slots.num.value;
                this.attributes.waterlogCase = 1;
                this.attributes.waterShouldDrinkInMl = this.attributes.waterShouldDrinkInMl + Math.ceil((this.attributes.physicalActTime / 30) * 350);
                this.response.speak("That\'s awesome, as you are spending " + this.attributes.physicalActTime + " minutes in doing exercises, you should drink "
                    + this.attributes.waterShouldDrinkInMl + "ml daily and if you want me to keep track of water you drink, please say update x glasses of water, for example, update one glass of water or, log two glasses of water")
                    .shouldEndSession(false);
                this.emit(':saveState', true);
                this.emit(":responseReady");

            }
            else {
                if (this.attributes.heightCase == 1) {
                    console.log("physical activity intent else if case height");
                    this.attributes.firstuser = 1;
                    this.attributes.heightCase = 0;
                    this.attributes.weightCase = 1;
                    this.attributes.height = this.attributes.height || this.event.request.intent.slots.num.value;
                    this.emit('StartIntent');
                }
                else if (this.attributes.weightCase == 1) {
                    console.log("physical activity intent else if case weight");
                    this.attributes.firstuser = 1;
                    this.attributes.weightCase = 0;
                    this.attributes.ageCase = 1;
                    this.attributes.weight = this.attributes.weight || this.event.request.intent.slots.num.value;
                    this.emit('StartIntent');
                }
                else if (this.attributes.ageCase == 1) {
                    console.log("physical activity intent else if case age");
                    this.attributes.firstuser = 1;
                    this.attributes.ageCase = 0;
                    this.attributes.age = this.attributes.age || this.event.request.intent.slots.num.value;
                    this.emit('DetailsIntent');
                }
                else if (this.attributes.glassQuantityCase == 1) {
                    this.attributes.number = this.event.request.intent.slots.num.value;
                    this.attributes.quantity = "ml";
                    this.attributes.glassQuantityCase = 0;
                    this.emit('glassQuantitySaveIntent');

                }
                else if (this.attributes.genderCase == 1) {
                    if (this.event.request.intent.slots.num.value)
                        this.emit("Unhandled");
                    else {
                        // if (this.event.request.intent.slots.gender.value)
                        this.emit('GenderIntent');
                    }
                }
                else {
                    this.emit("Unhandled");

                }

            }

        }
    },
    "AMAZON.NoIntent": function () {
        if (this.attributes.physicalExerciseState == 1) {

            console.log("logging no intent");
            this.attributes.genderCase = 0;
            this.attributes.waterlogCase = 1;
            this.response.speak("Ok! No problem,  if you want me to keep track of water you drink, please say update x glasses of water, for example, update one glass of water or, log two glasses of water")
                .shouldEndSession(false);
            this.emit(":responseReady");

        }
        else {
            this.emit("Unhandled");


        }
    },

    'waterIntent': function () {
        console.log("logging water intent");
        if (this.attributes.waterlogCase == 1 || this.attributes.welcomebackCase == 1) {
            this.attributes.genderCase = 0;
            this.attributes.wnumber = this.attributes.wnumber || this.event.request.intent.slots.glass.value;
            this.attributes.speechPrompt = doWaterCalculation.call(this);
            this.response.speak(speechPrompt).shouldEndSession(true);
            this.emit(':saveState', true);
            this.emit(':responseReady');
        }
        else {
            this.emit("Unhandled");


        }
    },
    'HalfGlassIntent': function () {
        console.log("logging half glass intent");
        this.attributes.genderCase = 0;
        if (this.attributes.waterlogCase == 1 || this.attributes.welcomebackCase == 1) {

            if (this.event.request.intent.slots.glass.value) {
                console.log("half glass intent if case");
                this.attributes.halfNumber = this.event.request.intent.slots.glass.value;
                this.attributes.wnumber = +this.attributes.halfNumber + +0.5;
                console.log(this.attributes.wnumber);
            } else {
                console.log("half glass intent else case");
                this.attributes.wnumber = 0.5;
                console.log(this.attributes.wnumber);
            }

            this.attributes.speechPrompt = doWaterCalculation.call(this);
            this.response.speak(speechPrompt).shouldEndSession(true);
            this.emit(':saveState', true);
            this.emit(':responseReady');
        }
        else {
            this.emit("Unhandled");


        }
    },
    "getPastRecordsIntent": function () {
        var pastDate = this.event.request.intent.slots.date.value;
        console.log("logging past records intent");
        console.log(pastDate);

        if (!this.attributes.soFarWaterDrunk[pastDate]) {
            speechText = "Sorry, I have no records for the requested date, see you";

        }
        else {
            speechText = this.attributes.soFarWaterDrunk[pastDate];
        }
        this.response.speak(speechText)
            .shouldEndSession(true);
        this.emit(':responseReady');
    },



    'AMAZON.HelpIntent': function () {
        this.response.speak('Ask me to update your water log.')
            .shouldEndSession(false)
            .listen('try again');
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('OK Goodbye!')
            .shouldEndSession(true);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('bye for now my dear, i will be waiting for you!')
            .shouldEndSession(true);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        speechOutput = 'Hello';
        this.response.speak("session is ended");
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        console.log("logging unhandled function");
        this.emit(':ask', 'I didn\'t get that, please say again');
    },
    // "RemoveIntent": function () {
    //     for (var key in this.attributes) {
    //         delete this.attributes[key];
    //     }
    //     this.emit('LaunchRequest');

    // }


};

function calculateBMI(height, weight) {
    if (height > 0 && weight > 0) {
        bmi = Math.ceil(weight / ((height / 100) * (height / 100)));
        if (bmi < 18.5) {
            finalWater = Math.ceil(weight / 30);
            speechText = "You are too thin. ";
        }
        else if (bmi > 18.5 && bmi < 25) {
            finalWater = Math.ceil(weight / 30);
            speechText = "You are healthy.";
        }
        else if (bmi > 25) {
            finalWater = Math.ceil(weight / 30);
            speechText = "you have overweight. ";
        }
    }
    else {
        speechText = "please tell me your height and weight again.  ";
    }

    return [speechText, finalWater];
}

function getWish() {
    var myDate = new Date();
    var hours = myDate.getHours();
    if (hours < 0) {
        hours = hours + 24;
    }
    if (hours < 12) {
        return "Good Morning. ";
    } else if (hours < 18) {
        return "Good afternoon. ";
    } else {
        return "Good evening. ";
    }

}

function currentDate() {
    var myDate = new Date();
    var month = myDate.getMonth() + 1;
    var date = myDate.getDate();
    if (month < 10) {
        month = '0' + month;
    }
    if (date < 10) {
        console.log("date entrance log date is " + date);
        date = '0' + date;
        console.log("date now is " + date);
    }

    return `${myDate.getFullYear()}-${month}-${date}`;

}

function doWaterCalculation() {
    this.attributes.soFarWaterDrunk = this.attributes.soFarWaterDrunk || {};//shortcircuit or operator
    this.attributes.waterQuantityInMl = this.attributes.wnumber * this.attributes.number;
    this.attributes.soFarWaterDrunk[currentDate()] = (this.attributes.soFarWaterDrunk[currentDate()] || 0) + this.attributes.waterQuantityInMl;

    if (this.attributes.soFarWaterDrunk[currentDate()] < this.attributes.waterShouldDrinkInMl) {
        console.log(this.attributes.soFarWaterDrunk[currentDate()]);

        speechPrompt = "i have added " + this.attributes.wnumber + " glasses of water to your log that is "
            + this.attributes.waterQuantityInMl +
            " ml you still need to drink " + (this.attributes.waterShouldDrinkInMl - this.attributes.soFarWaterDrunk[currentDate()]) + "have a good day";

    }
    else {
        console.log("so far water drunk " + this.attributes.soFarWaterDrunk[currentDate()]);

        speechPrompt = "Hurray! you are ahead of your goal by "
            + (this.attributes.soFarWaterDrunk[currentDate()] - this.attributes.waterShouldDrinkInMl) +
            " ml, that is nice, see you tomorrow. Have a good day";
    }

}