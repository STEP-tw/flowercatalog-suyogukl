let fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');
let registered_users = [{userName:'suyog',name:'suyog ukalkar'},{userName:'shubham',name:'shubham jaybhaye'}];
let toS = o=>JSON.stringify(o,null,2);

let logRequest = (req,res)=>{
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`,''].join('\n');
  fs.appendFile('request.log',text,()=>{});
// ${req.method}
  console.log(`${req.url}`);
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

let requestHandler=function(req,res){
  let path=req.url;
  if(path=='/')path='/index.html';
  debugger;
  if(fs.existsSync(`./public${path}`)){
    let getDocType=path.split('.')[1];
    let getFilePath=`./public${path}`;
    res.displayContents(fs,getDocType,getFilePath,path);
  }
}
let app = WebApp.create();
app.use(logRequest);
app.use(loadUser);
app.use(redirectLoggedInUserToHome);
app.use(redirectLoggedOutUserToLogin);
app.use(requestHandler);
app.get('/login',(req,res)=>{
  res.setHeader('Content-type','text/html');
  if(req.cookies.logInFailed){
    console.log(req.cookies.logInFailed)
    res.write('<p>logIn Failed</p>');
  }
  res.write('<form method="POST"> <input name="userName"><input name="place"> <input type="submit"></form>');
  res.end();
});
app.post('/login',(req,res)=>{
  let user = registered_users.find(u=>u.userName==req.body.userName);
  if(!user) {
    // res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/login');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/guest_Book.html');
});
app.get('/guest_Book.html',(req,res)=>{
  console.log(req.url);
  let data=fs.readFileSync(`./public${req.url}`);
  res.setHeader('Content-type','text/html');
  res.write(data);
  res.end();
});
app.get('/logout',(req,res)=>{
  res.setHeader('Set-Cookie',`loginFailed=false`);
  delete req.user.sessionid;
  res.redirect('/login');
});



const PORT = 5000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
