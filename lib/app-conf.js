
try {
    module.exports = require('../config/app.config.local');
} catch (e) {
    module.exports = require('../config/app.config');
}
