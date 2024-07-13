const path = require('path');
const boardRouter = require('./routes/boardRouter');
const express = require('express');
const app = express();

app.set('port', 7000);

//ejs 템플릿 설정
const viewPath = path.resolve(__dirname, 'views');
app.set('view engine', 'ejs');
app.set('views', viewPath)

//쿠키사용 설정
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//정적파일 설정
const publicPath = path.resolve(__dirname,'public');
const option = {
  dotfiles: 'ignore', //브라우저주소창에 파일명 입력시 확장자를 생략해도 정상 출력됨
  extensions: ['htm', 'html'] //파일 확장자 대체 설정: 만약 file이 존재하지 않는다면 지정된 확장자를 가진 파일을 검색하고 발견된 첫번째 파일을 제공
};//본 예제에서는 굳이 옵션이 필요없으나 설명하기위해 코드를 작성하였음
app.use(express.static(publicPath, option));

/*
    라우터(라우팅) 설정

    1. 사용자의 요청 url에 따라 호출할 콜백함수를 연동
    2. .get(), .post() 활용
    3. 별도의 라우터모듈 파일로 분리하여 작성할 수도 있다.
*/
app.get('/', (req, res)=>{
  let count = req.cookies.count;//클라이언트에 저장된 count 쿠키값을 가져온다.

  if(isNaN(count)){//최초요청일 경우 쿠키값이 없으므로
    count = 1;//이때는 count 변수를 1로 초기화 한다. 
  }else{//클라이언트에 저장된 count 쿠키가 있을 경우
    count++;//가져온 값에 1을 증가한다.
  }

  //클라이언트에게 응답할 때 쿠키설정을 하여 쿠키와 함께 응답하도록 설정
  //옵션을 동반한 쿠키설정
  //형식 : res.cookie('쿠키변수', value, {옵션})
  //expires:유효기간, path:유효경로
  res.cookie('count', count, {
    expires : new Date(Date.now() + (1000*60*60*24)),
    path : '/'
  });

  // res.send('<h1>방문해 주셔서 감사합니다~!</h1>');
  res.render('index', {count});
});

//클라이언트가 보내온 Form 데이터에 접근하기 위한 설정이다.
//클라이언트가 post 방식으로 요청할때 본문영역에 들어있는
//요청 파라미터들을 분석하여 request.body 속성에 넣어준다
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//board 이하 경로에 대한 라우터 설정
//boardRouter.js에서 설정하는 라우팅은 기본적으로 ‘/board’가 앞에 들어간다.
app.use('/board', boardRouter);

//잘못된 요청에 대한 처리를 담당하는 미들웨어 등록
app.use((req, res, next)=>{
  // res의 기본 status 값은 200 이다.
  // res.status(404).send('<h1 style="line-height:100px;text-align:center;">요청한 페이지가 존재하지 않습니다~!</h1>');

  res.status(404).sendFile(path.resolve(__dirname,'public','404.html'));
});

app.listen(app.get('port'), ()=>{
  console.log(`http://127.0.0.1:${app.get('port')}에서 서버가 대기중 입니다.`);
});
