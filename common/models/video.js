var Hooks = require('./hooks');

module.exports = function(Video) {
	Hooks.generateId(Video);
	Hooks.updateTimestamps(Video);
};
