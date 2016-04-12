'use strict';

var app = require('../..');
var q = require('q');
var lodash = require('lodash');
var User = app.models.user;
var Role = app.models.Role;
var RoleMapping = app.models.RoleMapping;
getUser()
    .then(function (user) {
    	console.log('user : ', user);
        console.log('Successfully.');
        process.exit(0);
    })
    .catch(function (error) {
        console.log('Failed :', error);
        process.exit(1);
    });

function getUser() {
    return q.ninvoke(User, 'findById', "fb45b92d-17c9-48a8-861b-cd49444de0ba")
    	.then(function(user) {
    		return toAdmin(user);
    	});
}

function toAdmin(user) {
    return q.ninvoke(Role, 'create', {name: "admin"})
    	.then(function(role) {
    		console.log('role : ', role);
    		return q.ninvoke(role.principals, 'create', {
        		principalType: RoleMapping.USER,
        		principalId: user.id
      		});
    	});
}