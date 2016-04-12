var Hooks = require('./hooks');

module.exports = function(Carousel) {
	Hooks.generateId(Carousel);
	Hooks.updateTimestamps(Carousel);
};
