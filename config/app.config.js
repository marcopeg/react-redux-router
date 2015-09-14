/**
 * this is the general configuration object that is given
 * to the client app through a Wepack external "config".
 *
 * If you are coding at home you may want to run your app
 * on your custom FireBase or you may want to apply configs
 * that are not meant to be pushed to the main repo.
 *
 * You should then create "app.config.local.js" which will
 * replace this file and it is already ignored by Git.
 */

module.exports = {
    firebaseUrl: 'mobile2scale.firebaseio.com',
    debugPanel: true
};
