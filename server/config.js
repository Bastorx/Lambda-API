'use strict';

var _ = require('lodash');

module.exports = {
    restApiRoot: '/api'
};

function commaSeparated(s) {
    if (_.isUndefined(s) || '' === s) return [];

    return _.map((s || '').split(','), _.trim);
}
