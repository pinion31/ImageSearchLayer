var http = require('http');
var fs = require('fs');
var url = require('url');
var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: process.env.KEY,
  cx: process.env.CX
});
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var urlDB = process.env.MONGOLAB_URI;

http.createServer(function(req,res) {
  var resultArr = [];
  var q = url.parse(req.url, true);

 mongoClient.connect(urlDB, function(err, db) {
   if (err) {return "Database Connection Error"};

    if (q.query.history || q.query.search === "") {

     db.collection('searchHistory').find({},{_id: 0}).sort({ $natural: -1 }).toArray(function(err, history) {
        if (err) {return err};
        res.end(JSON.stringify(history));
     });

    }
    else if (q.query.search !== undefined) {
      googleSearch.build({
        q: q.query.search,
        num: 10, // Number of search results to return between 1 and 10, inclusive
        start: +q.query.offset > 0? +q.query.offset: 1,

      }, function(error, response) {
        if (error) {return "error getting results";}
        var i;
        var timeOfSearchRequest = new Date();

        //inserts search term and time for search history storage
        db.collection('searchHistory').insertOne({searchTerm: q.query.search,
          timeRequested:timeOfSearchRequest.toDateString() + " " + timeOfSearchRequest.toLocaleTimeString() });

        for (i = 0; i < 10; i++) {
          var resultEntry = response.items[i];

          if (resultEntry.pagemap.cse_thumbnail) {
          resultArr.push({url:resultEntry.link, snippet:resultEntry.snippet,
            thumbnail:resultEntry.pagemap.cse_thumbnail[0].src, context:resultEntry.pagemap.cse_image[0].src});
          }
        }
        res.end(JSON.stringify(resultArr));
      });

    }
    else {
      //default return page with fields
      fs.readFile('./static/index.html', function (err, data) {
         if (err) {return err};

         res.writeHead(200, {'Content-type': 'text/html'});
         res.write(data);
         res.end();
      });
    }
})

}).listen(3000);