/**
 * transaction SubmitAnswers {
 *
  --> Student       student
  --> Quiz          attemptedQuiz
  o AnswerAttempt[] responses
}
 * @transaction
 * @param {proterra.quiz.SubmitAnswers} answers
*/
function processAnswers(answers) {
  
  // get the student record
  var studentRegsitry = getParticpantRegistry('proterra.quiz', 'Student');

  // create the quizAttempt
  var quizAttempt = getFactory().newResource('proterra.quiz','QuizAttempt',attemptId)
  // 
  answers.response.forEach(function (a) {
    var correctAnswer = a.question.answer.text;
    var submittedAnswer = a.givenAnswer;

    var result = match(correctAnswer, submittedAnswer);
    // need to create the answer attempt 
    
    var answerResult = getFactory().newConcept('proterra.quiz','Answerresult');
    answerresult.submittedAnswer = submittedAnswer;
    answerResult.question = a.question;
    answerresult.result = answerResult;
    // create the answer attempt concept
    

    // add that tothe overall quiz attempt
    quizAttempt.answers.push(answerResult);

    // add tht back to the registry. 


  });

  // resolve promises


  // update student record
  student.quizAttempts.push(quizAttempt);
 

  // emit event that this has occured.

}


/**
 * @param {proterra.quiz.SetupData} setupData
 * @transaction
 */
function setupData(setupData) {
  var questionRegistry;
  var answerRegistry;
  var quizRegistry;
  return getAssetRegistry('proterra.quiz.Question')
    .then(function (result) {
      questionRegistry = result;
      return getAssetRegistry('proterra.quiz.Answer');
    })
    .then(function (result) {
      answerRegistry = result;
      return getAssetRegistry('proterra.quiz.Quiz');
    })
    .then(function (result) {
      quizRegistry = result;
    })
    .then(function (result) {
      var promises = [];
      var factory = getFactory();
      var allData = JSON.parse(setupData.rawJSONData);
      allData.quizes.forEach(function (data) {

        var quizid = data.year + '-' + data.theme;
        var quiz = factory.newResource('proterra.quiz', 'Quiz', quizid);
        quiz.name = data.theme;
        quiz.setDate = new Date(data.year);
        quiz.answersPDF = 'http://proterra.me.uk/quiz/data/ChristmasQuiz' + data.year + '_Answers.pdf';
        quiz.questionsPDF = 'http://proterra.me.uk/quiz/data/ChristmasQuiz' + data.year + '.pdf';
        quiz.questions = [];
        quiz.answers = [];
        var quizRelationship = factory.newRelationship('proterra.quiz', 'Quiz', quizid);
        // need the questions and answers now
        var index = 0;

        data.questions.forEach(function (e) {
          
          var question = factory.newResource('proterra.quiz', 'Question', quizid + '-Q' + index);
          var answer = factory.newResource('proterra.quiz', 'Answer', quizid + '-A-' + index);
          question.text = e.q;
          question.answer = factory.newRelationship('proterra.quiz', 'Answer', answer.getIdentifier());

          answer.text = e.a;
          
          question.quiz = quizRelationship;
          answer.quiz = quizRelationship;
          quiz.questions.push(question);
          quiz.answers.push(answer);
          // add to the registries 
          promises.push(questionRegistry.add(question));
          promises.push(answerRegistry.add(answer));
          index++;
        });

        promises.push(quizRegistry.add(quiz));


      });
      return Promise.all(promises);
    }).catch(function(e) {
      console.log(e);
    });
}