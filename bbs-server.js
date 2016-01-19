//------------------------------------------
// 一行掲示板
//------------------------------------------
// 設定
var HTTP_PORT = 8080;
var DATAFILE = "bbs-logs.json";

// 必要なモジュールの読み込み
var http = require('http'),
  url = require('url'),
  path = require('path'),
  fs = require('fs');

// データファイルの読み込み
var logs = [];
if (fs.existsSync(DATAFILE)) {
  logs = JSON.parse(fs.readFileSync(DATAFILE));
}

// サーバー処理
http.createServer(function (req, res) {
  // どのファイルにアクセスするのか調べる
  if (req.url == "/") req.url = "/bbs.html";
  var x = url.parse(req.url, true);
  if (x.pathname == "/api") { procAPI(x, res); return; }
  var fullpath = path.resolve(__dirname, "." + x.pathname);
  if (fs.existsSync(fullpath)) {
    // 送信しても良いファイルか調べる
    var ext = path.extname(fullpath).toLowerCase();
    if (ext.match(/\.(png|jpg|jpeg|gif|html|css)$/)) {
      var strm = fs.createReadStream(fullpath);
      strm.pipe(res);
      return;
    }
  }
  // 予想外のリクエストにはエラーを返す
  res.writeHead(404, {'Content-Type':'text/plain'});
  res.end("404 not found");
})
.listen(HTTP_PORT);
console.log("start server");
console.log("http://localhost:" + HTTP_PORT);

// API
function procAPI(x, res) {
  res.writeHead(200, {'Content-Type':'text/plain'});
  var q = x.query;
  if (q.mode == "sendMsg") {
    logs.unshift([q.name, q.msg]);
    fs.writeFile(DATAFILE, JSON.stringify(logs),
      function(err) {
        if(err) { console.log(err); }
      });
    res.write("{'result':'ok'}");
  }
  else if (q.mode == "show") {
    var o = {};
    o.result = "ok";
    o.items = logs;
    res.write(JSON.stringify(o));
  }
  res.end();
}
