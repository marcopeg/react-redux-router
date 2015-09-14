
try {
    module.exports = require('../config/workspace.config.local');
} catch (e) {
    module.exports = require('../config/workspace.config');
}
