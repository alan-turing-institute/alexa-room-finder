aws iam create-role --role-name room_finder_basic_execution --assume-role-policy-document file://role-policy-document.json

aws iam put-role-policy --role-name room_finder_basic_execution --policy-name lambda_basic_execution --policy-document file://basic-execution-role.json

aws iam get-role --role-name room_finder_basic_execution
