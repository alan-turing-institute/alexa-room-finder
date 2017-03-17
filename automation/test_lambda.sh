#Commands required to test lambda function

aws lambda list-functions --max-items 10 --profile default

aws lambda get-function \
--function-name MeetingBooker \
--region eu-west-1 \
--profile default

aws lambda invoke \
--invocation-type RequestResponse \
--function-name MeetingBooker \
--region eu-west-1 \
--log-type Tail \
--payload fileb://{FILE PATH OF JSON TO TEST} \
--profile default \
outputfile.txt
