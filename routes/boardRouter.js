const express = require('express');
const router = express.Router();
const app = express();


let id = 3;//게시글을 구별하는 주민등록번호 역할

const database = [{
  id: 1,
  title: '아기공룡둘리',
  content: '둘리는 내친구',
  name: '둘리',
  pwd: '0000',
  date: '2024-07-11',
  count: 3
},
{
  id: 2,
  title: '달려라하니',
  content: '난 엄마가 제일좋아',
  name: '하니',
  pwd: '1234',
  date: '2024-07-10',
  count: 7
}];

//app.locals는 express 어플리케이션에서 전역적으로 사용할 데이터를 저장하는 객체
app.locals.database = database;

router.get('/list', (req, res)=>{
  res.render('board/list', app.locals);//ejs경로는 views 를 기준으로 설정됨
});

//여기에서 루트(‘/’)는 ‘/board’를 의미한다.
router.get('/', (req, res)=>{
  // res.send('/board');
  res.redirect('/board/list');//지정된 URL경로로 재요청
});

//글쓰기 폼 페이지로 이동
router.get('/write', (req, res)=>{
  res.render('board/write');
});

//데이터를 받아 새글로 등록
router.post('/write', (req, res)=>{
  const now = new Date();

  const year = now.getFullYear();
  let month = now.getMonth()+1;
  month = month<10 ? `0${month}` : month;
  const date = now.getDate();

  const reqData = {
    id: id++,
    title: req.body.title,
    content: req.body.content,
    name: req.body.name,
    pwd: req.body.pwd,
    date: `${year}-${month}-${date}`,
    count: 0
  }

  database.unshift(reqData);//배열의 맨앞에 글추가
  res.redirect('/board/list');//글목록으로 재요청
});


//게시글 보기
router.get('/content/:id', (req, res)=>{
  const id = parseInt(req.params.id);//조회할 게시글 id

  const item = database.find(cont=>cont.id===id);//해당 게시글 추출
  item.count++;//조회수 증가

  res.render('board/content', item);
});


//해당글의 id와 수정인지 삭제인지 구별하는 mode 값을 동봉하여 pwd.ejs로 이동
router.get('/pwd/:mode/:id', (req, res)=>{
  const mode = req.params.mode;//edit 또는 del
  const id = parseInt(req.params.id);//5

  res.render('board/pwd', {mode, id});
});


//id와 일치하는 데이터가 있는지 확인하고, 그 데이터의 비번과 입력한 비번이 같은지 확인후 수정/삭제 경로로 리다이렉트 처리
router.post('/pwd', (req, res)=>{

  //입력받은 데이터를 한데 묶음
  const pwdInfo = {
    mode:req.body.mode,
    id:parseInt(req.body.id),
    pwd:req.body.pwd
  };

  //입력받은 데이터와 일치하는 게시글 탐색
  const item = database.find(cont=> cont.id===pwdInfo.id && cont.pwd===pwdInfo.pwd);
  
  console.log('item =', item);
  console.log('!!item =', !!item);

  //리다이렉트 분기
  if(pwdInfo.mode==='edit' && !!item){
    res.redirect(`/board/edit/${pwdInfo.id}`);//수정일 경우의 리다이렉트

  }else if(pwdInfo.mode==='del' && !!item){
    res.redirect(`/board/del/${pwdInfo.id}`);//삭제일 경우의 리다이렉트

  }else{
    //비밀번호가 틀렸을 경우 다시 패스워드 입력페이지로 리다이렉트 
    res.redirect(`/board/pwd/${pwdInfo.mode}/${pwdInfo.id}?error=incorrect-password`);
  }
  
});


//게시글 수정폼으로 이동
router.get('/edit/:id', (req, res)=>{
  const id = parseInt(req.params.id);
  const item = database.find(cont=>cont.id===id);//게시글추출

  res.render('board/edit.ejs', item);
});


//게시글 수정
router.post('/edit', (req, res)=>{
  //수정할 데이터의 id
  let id = parseInt(req.body.id);

  //수정할 item의 인덱스 추출
  const idx = database.findIndex(cont=>cont.id===id);

  //수정된 데이터
  let reqDate = {
    ...database[idx],
    title: req.body.title, 
    content: req.body.content,
    name: req.body.name
  };

  database.splice(idx, 1, reqDate);//수정처리

  res.redirect('/board/list');//글목록으로 이동
});


//게시글 삭제
router.get('/del/:id', (req, res)=>{
  
  //삭제할 데이터의 id
  const id = parseInt(req.params.id);
  
  //삭제데이터의 인덱스추출
  const idx = database.findIndex(cont=>cont.id===id);

  database.splice(idx,1);//삭제처리
  res.redirect('/board/list');//글목록으로 이동
});

module.exports = router;