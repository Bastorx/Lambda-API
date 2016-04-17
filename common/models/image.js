var loopback = require('loopback');
var Hooks = require('./hooks');
var fs = require('fs');
var q = require('q');
var request = require('superagent');

var AWS = require('aws-sdk');

AWS.config.update({
	region:'eu-west-1',
	accessKeyId: 'AKIAIZAGRJAR7QXTPYPA',
	secretAccessKey: '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'
});

var lambda = new AWS.Lambda();


module.exports = function(Image) {
	Hooks.generateId(Image);
	Hooks.updateTimestamps(Image);

	Image.observe('before save', function(ctx, next) {
		if (ctx.instance && !ctx.instance.userId) {
			ctx.instance.userId = loopback.getCurrentContext().get('accessToken').userId;
			next();
		}
		else {
			next();
		}
	});

    Image.prototype.toRemoteObject =
    Image.prototype.toShortRemoteObject = function (context) {
      return {
            id                  : this.id,
            userId				: this.userId,
            url 				: this.url,
            createdAt           : this.createdAt,
            updatedAt           : this.updatedAt
        };
    };

    Image.upload = function(req, res, next) {
        var Container = Image.app.models.Container;
        var userId =  req.accessToken && req.accessToken.userId;
        if (!userId) next({status: 401, message: "AccessToken is required"});

        Container.getContainers(function (err, containers) {
            if (containers.some(function(e) { return e.name == userId; })) {
                q.ninvoke(Container, 'upload', req, res, {container: userId})
                	.then(function(file) {
                		console.log(file);
                		var f = file.files && file.files.file && file.files.file[0];
                		if (!(f)) return next({status: 500, message: "Problem with the file"});
                		return q.ninvoke(Image, 'upsert', {
                			userId: userId,
                			file: f
                		})
                		.then(function(im) {
                			return q.ninvoke(im, 'updateAttributes', {url: process.env.URL + '/api/Images/' + im.id + '/stream'});
                		})
                		.then(function(im) {
                			console.log('Create new file :', im);
                			next(null, im);
                		})
                		.fail(function(err) {
                			console.log('Error : ', err);
                			next({status: 500, message: err});
                		});
                	});
            }
            else {
                Container.createContainer({name: userId}, function(err, c) {
                q.ninvoke(Container, 'upload', req, res, {container: c.name})
                	.then(function(file) {
                		console.log(file);
                		var f = file.files && file.files.file && file.files.file[0];
                		if (!(f)) return next({status: 500, message: "Problem with the file"});
                		return q.ninvoke(Image, 'upsert', {
                			userId: userId,
                			file: f
                		})
                		.then(function(im) {
                			return q.ninvoke(im, 'updateAttributes', {url: process.env.URL + '/api/Images/' + im.id + '/stream'});
                		})
                		.then(function(im) {
                			console.log('Create new file :', im);
                			next(null, im);
                		})
                		.fail(function(err) {
                			console.log('Error : ', err);
                			next({status: 500, message: err});
                		});
                	});
                });
            }
        });
    };

    Image.download = function(id, next) {
    	return q.ninvoke(Image, 'findById', id)
    		.then(function(image) {
    			return q.fcall(function() {
    				return fs.createReadStream(__dirname + '/../../client/pictures/' + image.file.container + '/' + image.file.name)
    			});
    		})
    		.then(function(file) {
    			next(null, file, 'application/octet-stream');
    		})
    		.fail(function(err) {
    			console.log('Error : ', err);
    			next({status: 500, err});
    		});
    };

    Image.stream = function(id, res, next) {
    	return q.ninvoke(Image, 'findById', id)
    		.then(function(image) {
    			res.set('Content-Type', image.file.type);
    			return q.fcall(function() {
    				return fs.readFileSync(__dirname + '/../../client/pictures/' + image.file.container + '/' + image.file.name)
    			});
    		})
    		.then(function(file) {
    			res.set('Content-Transfer-Encoding','binary');
    			res.send(file);
    		})
    		.fail(function(err) {
    			res.set('Content-Type', 'application/json');
    			console.log('Error : ', err);
    			next({status: 500, err});
    		});
    };

    Image.edit = function(res, id, body, next) {
    	var op = body.op,
    		params = body.params;
    	return q.ninvoke(Image, 'findById', id)
    		.then(function(im) {

		    	var params = JSON.stringify({
			    		op: op,
			    		link: im.url,
			    		params: params
		    		});

		    	var request = {
					FunctionName: 'image',
					Payload: params
				};
				console.log(request);
		    	return q.ninvoke(lambda, 'invoke', request)
		    		.then(function(im) {
		    			console.log(im);
		    			im = JSON.parse(im.Payload);
		    			var buf = new Buffer(im);

		    			res.set('Content-Type', 'image/png');
		    			res.send(buf);
		    		});
    		});
    };

    Image.remoteMethod(
        'upload',
        {
         http: {path: '/upload', verb: 'post'},
         accepts: [
            {arg: 'req', type: 'object', 'http': {source: 'req'}},
            {arg: 'res', type: 'object', 'http': {source: 'res'}}
         ],
         returns: {arg: 'status', type: 'string'}
        }
    );

    Image.remoteMethod(
        'download',
        {
         http: {path: '/:id/download/:name', verb: 'get'},
         accepts: [
		    {arg: 'id', type: 'string', 'http': {source: 'path'}}
         ],
        isStatic: true,
		  returns: [
		    { arg: 'body', type: 'file', root: true },
		    { arg: 'Content-Type', type: 'string', http: { target: 'header' } },
		  ]
        }
    );

    Image.remoteMethod(
        'stream',
        {
         http: {path: '/:id/stream', verb: 'get'},
         accepts: [
         	{arg: 'id', type: 'string', 'http': {source: 'path'}},
         	{arg: 'res', type: 'object', 'http': {source: 'res'}}
         ]
        }
    );

    Image.remoteMethod(
        'edit',
        {
         http: {path: '/:id/edit', verb: 'post'},
         accepts: [
         	{arg: 'res', type: 'object', 'http': {source: 'res'}},
         	{arg: 'id', type: 'string', 'http': {source: 'path'}},
         	{arg: 'body', type: 'object',  http: {source: 'body'}}
         ]
        }
    );
};
