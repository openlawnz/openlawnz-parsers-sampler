const inquirer = require('inquirer');

module.exports = {
  ask: () => {
    const questions = [
      {
        name: 'n_cases',
        type: 'input',
        message: 'Enter number of cases to fetch (1-500):',
        validate: function( value ) {
          if (value) {
            return true;
          } else {
            return 'Please enter the number of cases (1 to 10)';
          }
        }
      },
      {
        name: 'parser',
        type: 'list',
        message: 'Enter the parser to test:',
        choices: ["Representation", "Legislation", "Case Citations", "Category", "Court", "CourtFiling", "Judges", "Law Report", "Location", new inquirer.Separator()],
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please select a parser';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
};
