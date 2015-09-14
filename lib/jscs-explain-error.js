var chalk = require('chalk');

module.exports = function(error, colorize) {
    var result = [];

    result.push(' ');
    result.push(chalk.green(error.filename) + ' [' + error.line + ':' + error.column + ']');
    result.push(error.message);
    result.push(' ');

    return result.join('\n');
};
