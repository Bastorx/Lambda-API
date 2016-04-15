'use strict';

module.exports = {
    restApiRoot: '/api',
    legacyExplorer: false,
    remoting: {
    	json: {limit: "50mb"},
    	urlencoded: {limit: "50mb", extended: true}
    }
};