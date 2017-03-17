# Commands required to update lambda function

cd ../lambda

zip -r -X lambda.zip index.js requesters.js node_modules/

aws lambda update-function-code --function-name 'TimedRoomBooker' --zip-file 'fileb://lambda.zip'
