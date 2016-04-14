var im = require('imagemagick');

im.resize({
  srcPath: __dirname + "/max.jpg",
  dstPath: __dirname + "/test.jpg",
  width: 256
}, function(err, stdout, stderr){
  if (err) throw err
  console.log('max-small.jpg to fit within 256x256px')
});