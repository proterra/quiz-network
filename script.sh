
composer participant add --card admin@quiz-local -d '{"$class":"proterra.quiz.QuizMaster","firstname":"sophie","lastname":"black","email":"toneady@mail.com"}' 

composer identity issue --card admin@quiz-local -u sophie -a proterra.quiz.QuizMaster#toneady@mail.com  --issuer 

 composer card import --file sophie-3@quiz-network.card --name sophie@quiz-local      

## use sophie to create students
composer participant add --card sophie@quiz-local -d '{"$class":"proterra.quiz.Student","firstname":"alice","lastname":"andrews","email":"alice@example.com"}' 

composer participant add --card sophie@quiz-local -d '{"$class":"proterra.quiz.Student","firstname":"charlie","lastname":"cook","email":"charlie@example.com"}' 

composer identity issue --card sophie@quiz-local  -u alice -a proterra.quiz.Student#alice@example.com

composer identity issue --card sophie@quiz-local  -u alice -a proterra.quiz.Student#charlie@example.com