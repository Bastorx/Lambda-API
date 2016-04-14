var Hooks = require('./hooks');

module.exports = function(Image) {
	Hooks.generateId(Image);
	Hooks.updateTimestamps(Image);
};
