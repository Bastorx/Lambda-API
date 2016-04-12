var Hooks = require('./hooks');

module.exports = function(User) {
	Hooks.generateId(User);
	Hooks.updateTimestamps(User);



	User.disableRemoteMethod("findOne", true);
	 
	User.disableRemoteMethod("deleteById", true);
	 
	User.disableRemoteMethod("confirm", true);
	User.disableRemoteMethod("count", true);
	User.disableRemoteMethod("resetPassword", true);
};
