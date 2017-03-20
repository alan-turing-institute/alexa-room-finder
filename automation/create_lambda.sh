#Commands required to create lambda function

cd ../lambda

npm install

zip -r -X lambda.zip index.js requesters.js node_modules/

aws lambda  create-function \
--region eu-west-1 \
--function-name RoomFinder \
--zip-file fileb://lambda.zip \
--role {ARN OF ROOM_FINDER_BASIC_EXECUTION ROLE} \
--handler index.handler \
--runtime nodejs4.3 \
--profile default
