#!/bin/bash

# These intents require access to the MS Graph API.
printf '\n Intent: Duration \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/DurationIntent-State_TIMEMODE.js
printf '\n Intent: Book \t State: _CONFIRMMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/BookIntent-State_CONFIRMMODE.js

# Running YesIntent_CONFIRMMODE after BookIntent_CONFIRMMODE will try to book the room
# twice in a row. The second one will then be declined by the room, as it's already booked.
# I therefore leave YesIntent_CONFIRMMODE out and test it separately if needs be.

# printf '\n Intent: Yes \t State: _CONFIRMMODE \n\n'
# lambda-local -l lambda/index.js -h handler -e test/requests/YesIntent-State_CONFIRMMODE.js

#These intents don't require access to the MS Graph API.
printf '\n Intent: LaunchRequest \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/LaunchRequest.js
printf '\n Intent: Book \t State: Blank \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/BookIntent-StateBLANK.js
printf '\n Intent: Book \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/BookIntent-State_TIMEMODE.js
printf '\n Intent: Yes  \t State: Blank \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/YesIntent-StateBLANK.js
printf '\n Intent: Yes \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/YesIntent-State_TIMEMODE.js
printf '\n Intent: Cancel \t State: Blank \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/CancelIntent-StateBLANK.js
printf '\n Intent: Cancel \t State: _CONFIRMMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/CancelIntent-State_CONFIRMMODE.js
printf '\n Intent: Cancel \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/CancelIntent-State_TIMEMODE.js
printf '\n Intent: Help \t State: Blank \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/HelpIntent-StateBLANK.js
printf '\n Intent: Help \t State: _CONFIRMMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/HelpIntent-State_CONFIRMMODE.js
printf '\n Intent: Help \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/HelpIntent-State_TIMEMODE.js
printf '\n Intent: No \t State: Blank \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/NoIntent-StateBLANK.js
printf '\n Intent: No \t State: _CONFIRMMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/NoIntent-State_CONFIRMMODE.js
printf '\n Intent: No \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/NoIntent-State_TIMEMODE.js
printf '\n Intent: Repeat \t State: Blank \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/RepeatIntent-StateBLANK.js
printf '\n Intent: Repeat \t State: _CONFIRMMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/RepeatIntent-State_CONFIRMMODE.js
printf '\n Intent: Repeat \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/RepeatIntent-State_TIMEMODE.js
printf '\n Intent: StartOver \t State: Blank \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/StartOverIntent-StateBLANK.js
printf '\n Intent: StartOver \t State: _CONFIRMMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/StartOverIntent-State_CONFIRMMODE.js
printf '\n Intent: StartOver \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/StartOverIntent-State_TIMEMODE.js
printf '\n Intent: Stop \t State: Blank \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/StopIntent-StateBLANK.js
printf '\n Intent: Stop \t State: _CONFIRMMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/StopIntent-State_CONFIRMMODE.js
printf '\n Intent: Stop \t State: _TIMEMODE \n\n'
lambda-local -l lambda/index.js -h handler -e test/requests/StopIntent-State_TIMEMODE.js
