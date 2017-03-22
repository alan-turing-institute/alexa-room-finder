#Commands required to create lambda function

cd ../lambda

npm install

zip -r -X lambda.zip index.js requesters.js resources.js config.js node_modules/

aws lambda create-function \
--region eu-west-1 \
--function-name RoomFinder \
--zip-file fileb://lambda.zip \
--role {ARN OF ROOM_FINDER_BASIC_EXECUTION ROLE} \
--handler index.handler \
--runtime nodejs4.3 \
--profile default \
--description "Handles Room Finder Alexa Skill"

aws lambda add-permission \
--function-name RoomFinder \
--statement-id "1234" \
--action "lambda:InvokeFunction" \
--principal "alexa-appkit.amazon.com"  \
--region eu-west-1
