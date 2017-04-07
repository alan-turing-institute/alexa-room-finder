const intentName = "BookIntent";

/**
 * intentGenerator - Combines provided arrays of words to create arrays.
 * If an array is skippable, simply add an empty string to it.
 *
 * @param  {...string[]} args arrays of strings, in the order of writing.
 * @return {undefined}
 */
function intentGenerator(...args) {
  (function permutateConsole(result, rest) {
    if (rest.length === 0) {
      console.log(result);
      return;
    }
    rest[0].forEach((next) => {
      if (next === "") {
        permutateConsole(result + next, rest.slice(1));
      } else {
        permutateConsole(result + " " + next, rest.slice(1));
      }
    });
  }(intentName, args));
}

intentGenerator(["Book", "Find", "Get", "Look for", "Make"], ["me", "us", ""], ["a", "the", ""], ["room.", "meeting room.", "meeting."]);
intentGenerator(["I", ""], ["want", "would like", "need"], ["a", ""], ["room.", "meeting room.", "meeting."]);
