const http = require('http');
const { getTypeMovieList } = require('./movie')

(async () => {
  let postHTML = await getTypeMovieList()
  http.createServer(function (req, res) {
    req.on('data', function (chunk) {
    });
    req.on('end', function () {
      // 设置响应头部信息及编码
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf8'
      });
      res.write(JSON.stringify(postHTML));
      res.end();
    });
  }).listen(3000);
  console.log('http://localhost:3000')
})()
