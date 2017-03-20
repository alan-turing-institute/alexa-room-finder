# aws iam create-role --role-name test_basic_execution --assume-role-policy-document file://role-policy-document.json
#
# aws iam put-role-policy --role-name test_basic_execution --policy-name lambda_basic_execution --policy-document file://basic-execution-role.json

ROLE= aws iam get-role --role-name test_basic_execution

# echo $ROLE
