const fs = require('fs');
const qs = require('querystring');
const http = require('http');
let PORT=1998;
const WebApp = require('./webapp');



let logRequest = (req,res)=>{
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`,''].join('\n');
  fs.appendFile('request.log',text,()=>{});

  console.log(`${req.method} ${req.url}`);
}
let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};
let redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/guest_Book','/login']) && req.user) res.redirect('/guest_Book.html');
}
let redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(['/guest_Book','/guest_Book.html','/logout']) && !req.user) res.redirect('/login');
}

let app = WebApp.create();
app.get('/login',(req,res)=>{
  res.setHeader('Content-type','text/html');
  if(req.cookies.logInFailed) res.write('<p>logIn Failed</p>');
  res.write('<form method="POST"> <input name="userName"><input name="place"> <input type="submit"></form>');
  res.end();
});
app.get('/login',(req,res)=>{
  let path=req.url;
  if(path=='/')path='/index.html';
  displayContents()
});

let docType={
  'html': 'text/html',
  'css' : 'text/css',
  'jpg' : 'image/jpg',
  'gif' : 'image/gif',
  'pdf' : 'application/pdf',
  'js' : 'text/javascript'
};

let displayContents=function(res,getDocType,getFilePath){
  let type=docType[getDocType];
  let content=fs.readFileSync(getFilePath);
  res.writeHead(200,{'Content-Length': content.length,
  'Content-Type':type});
  debugger;
  res.write(content);
  res.end();
};
//
// let fileNotFound=function(res){
//   res.statusCode=404;
//   debugger;
//   res.write('File Not Found');
//   res.end();
// }

// let requestHandler=function(req,res){
//   console.log(req.url);
//   let path=req.url;
//   debugger;
//   let getDocType=path.split('.')[1];
//   let getFilePath=`./public${path}`;
//   fs.readFile(getFilePath,(err,data)=>{
//     if(err)return fileNotFound(res);
//     return  displayContents(res,getDocType,getFilePath);
//   })
// }

// if (path=='/guest_Book.html') storeComments(req,res);
const server=http.createServer(requestHandler);
server.listen(PORT);
console.log(`listening to .....${PORT}`);

// ===================+++++===================+++++========================

let writeComments=function(file,data){
  fs.writeFileSync(file,data);
  return;
}
let readFile=function(path){
  return fs.readFileSync(path,"utf8");
}

let storeComments=function(req,res){
  req.on('data',(data)=>{
    let comment=qs.parse(data.toString());
    let fileData=readFile('./data/dataBase.json');
    let parsedData = fileData&&JSON.parse(fileData)||[];
    parsedData.unshift(comment);
    let comments=JSON.stringify(parsedData);
    writeComments('./data/dataBase.json',comments);
    writeComments('./public/js/commentsData.js',`let comments= ${comments}`)
  })
}
