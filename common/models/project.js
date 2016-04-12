var Hooks = require('./hooks');

module.exports = function(Project) {
	Hooks.generateId(Project);
	Hooks.updateTimestamps(Project);
};
