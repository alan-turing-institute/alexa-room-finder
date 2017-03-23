# Commands required to update lambda function

cd ../lambda

mv lambda.zip backup_lambda.zip

zip -r -X lambda.zip index.js requesters.js resources.js config.js node_modules/

aws lambda update-function-code --function-name 'RoomFinder' --zip-file 'fileb://lambda.zip'
