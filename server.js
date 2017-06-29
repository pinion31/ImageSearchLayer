var http = require('http');
var fs = require('fs');
var url = require('url');

http.createServer(function(req,res) {

  var q = url.parse(req.url, true);

  if (q.query.history || q.query.search === "") {
    res.end('show history');
  }
  else if (q.query.search !== undefined) {
    console.log(q.query.search);
    res.end('show results');
  }
  else {
    fs.readFile('./static/index.html', function (err, data) {
       if (err) {return err};

       res.writeHead(200, {'Content-type': 'text/html'});
       res.write(data);
       res.end();
    });
  }

}).listen(3000);