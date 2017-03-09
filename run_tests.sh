#!/bin/bash

# Will crash unless test/config.js is properly set.
lambda-local -l lambda/index.js -h handler -e test/test-BookIntent-StateBLANK.js
lambda-local -l lambda/index.js -h handler -e test/test-BookIntent-State_CONFIRMMODE.js

#Won't crash if test/config.js isn't properly set
lambda-local -l lambda/index.js -h handler -e test/test-LaunchRequest.js
lambda-local -l lambda/index.js -h handler -e test/test-CancelIntent-StateBLANK.js
lambda-local -l lambda/index.js -h handler -e test/test-CancelIntent-State_CONFIRMMODE.js
lambda-local -l lambda/index.js -h handler -e test/test-HelpIntent-StateBLANK.js
lambda-local -l lambda/index.js -h handler -e test/test-HelpIntent-State_CONFIRMMODE.js
lambda-local -l lambda/index.js -h handler -e test/test-NoIntent-StateBLANK.js
lambda-local -l lambda/index.js -h handler -e test/test-NoIntent-State_CONFIRMMODE.js
lambda-local -l lambda/index.js -h handler -e test/test-RepeatIntent-StateBLANK.js
lambda-local -l lambda/index.js -h handler -e test/test-RepeatIntent-State_CONFIRMMODE.js
lambda-local -l lambda/index.js -h handler -e test/test-StartOverIntent-StateBLANK.js
lambda-local -l lambda/index.js -h handler -e test/test-StartOverIntent-State_CONFIRMMODE.js
lambda-local -l lambda/index.js -h handler -e test/test-StopIntent-StateBLANK.js
lambda-local -l lambda/index.js -h handler -e test/test-StopIntent-State_CONFIRMMODE.js
