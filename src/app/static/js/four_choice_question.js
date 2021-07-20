//minからmaxの値の間の乱数作成
function rand(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//指定した数値の乱数を重複無しで生成(数字同士)
function getRandomArrayNum(numMin, numMax, length){
    let tempArr = [];
    for(let i = 0; i < length; i++) {
        do {
            let arrNum = rand(numMin, numMax);
            if(!tempArr.includes(arrNum)){
                tempArr[i] = arrNum;
                break;
            }
        } while (true);
    }
    return tempArr;
}

//指定した数値の乱数を重複無しで生成(JSON)
function getRandomArrayNumByJson(jsonObject, num){
    let jsonKeys = Object.keys(jsonObject);
    if(jsonKeys.length >= num){
        let tempArr = [];
        for(let i = 0; i < num; i++) {
            do {
                let arrNum = rand(1,jsonKeys.length);
                if(!tempArr.includes(arrNum)){
                    tempArr[i] = arrNum;
                    break;
                }
            } while (true);
        }
        return tempArr;
    }
}

//問題ファイルを読み込む
function getFileQ(){
    // ファイルを読み込み
    var req = new XMLHttpRequest();
    req.open("get", "../static/json/four_choice_question_q.json", true);
    req.send(null);

    //読み込み状態を返す
    return req;
}

//回答ファイルを読み込む
function getFileA(){
    // ファイルを読み込み
    var req = new XMLHttpRequest();
    req.open("get", "../static/json/four_choice_question_a.json", true);
    req.send(null);

    //読み込み状態を返す
    return req;
}

//問題データ加工
function dataProcessing(jsonObject, cookieFlg){
    let keys = getRandomArrayNumByJson(jsonObject, 20);

    let name = "choices";
    //期限(日)
    let cookieLimit = 1;
    let nowDate = new Date();
    nowDate.setTime(nowDate.getTime() + cookieLimit*24*60*60*1000);
    let utcDate = nowDate.toUTCString();

    //クッキー埋め込み
    document.cookie = name + "=" + keys + ";expires=" + utcDate + ";path=/;domain=" + document.domain +";secure";

    return keys;
}

//問題設定
function setQuestion(liList, arList, jsonObject, cookieFlg){
    //出す問題を選択
    let keys = dataProcessing(jsonObject, cookieFlg);
    let j = 0;
    //問題の数だけ繰り返す
    for(let i = 2; i < liList.length - 1; i++) {
        //問題文を設定
        let pList = arList[i].getElementsByTagName('p');
        let keyNum = keys[j];
        pList[0].textContent = jsonObject[keyNum].q;
        pList[0].classList.add("question");

        //選択肢を設定
        let ulList = arList[i].getElementsByTagName('ul');
        ulList[0].classList.add("choices");
        let li1 = document.createElement('li');
        let li2 = document.createElement('li');
        let li3 = document.createElement('li');
        let li4 = document.createElement('li');
        let span1 = document.createElement('span');
        let span2 = document.createElement('span');
        let span3 = document.createElement('span');
        let span4 = document.createElement('span');
        li1.appendChild(span1);
        span1.appendChild(document.createTextNode(jsonObject[keyNum].c1));
        ulList[0].appendChild(li1);
        li2.appendChild(span2);
        span2.appendChild(document.createTextNode(jsonObject[keyNum].c2));
        ulList[0].appendChild(li2);
        li3.appendChild(span3);
        span3.appendChild(document.createTextNode(jsonObject[keyNum].c3));
        ulList[0].appendChild(li3);
        li4.appendChild(span4);
        span4.appendChild(document.createTextNode(jsonObject[keyNum].c4));
        ulList[0].appendChild(li4);

        //選択肢ハンドラ作成
        let chLiList = ulList[0].getElementsByTagName('li');
        for (let i = 0; i < chLiList.length; i++) {
            chLiList[i].addEventListener("click", {handleEvent: choicesSelect} ,false);
        }
        j++;
    }
}

//選択肢動作
function choicesSelect(event){
    //問題採点後は起動しない
    let idElem = document.getElementById("answerTable");
    if(idElem == null){
        event.currentTarget.removeEventListener("click", {handleEvent: choicesSelect} ,false);
        return null;
    }

    //同問題選択肢のクラス全消し クラスを複数指定する場合処理書き直し
    let parentUl = event.target.parentNode;
    let liAllList = parentUl.querySelectorAll("li");
    for(let j = 0; j < liAllList.length; j++){
        let spanLi = liAllList[j].getElementsByTagName('span');
        spanLi[0].classList.remove("choices_selected");
    }
    //クラス付与
    event.target.querySelector('span').classList.add("choices_selected");
}

//クッキー許可判定
function cookiePermissionJudgment(){
    let name = "selected";
    //期限(日)
    let cookieLimit = 1;
    let nowDate = new Date();
    nowDate.setTime(nowDate.getTime() + cookieLimit*24*60*60*1000);
    let utcDate = nowDate.toUTCString();

    //ダミーデータ作成
    let dummyArray = getRandomArrayNum(1, 20, 20);
    //クッキー埋め込み
    document.cookie = name + "=" + dummyArray + ";expires=" + utcDate + ";path=/;domain=" + document.domain +";secure";

    //クッキー取得し使用可否判定
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookieData = cookies[i].split("=");
        if(cookieData[0].trim() == name){
            return true;
        }
    }
    return false;
}

//選択された回答取得
function getChoicesSelected(){
    let choicesList = document.getElementsByClassName("choices");
    let tempArr = [];
    for(li = 0; li < choicesList.length; li++){
        let choicesNo = "無";
        let choicesLiList = choicesList[li].getElementsByTagName('li');
        for(cli = 0; cli < choicesLiList.length; cli++){
            let spanLi = choicesLiList[cli].getElementsByTagName('span');
            if(spanLi[0].classList.contains('choices_selected')){
                choicesNo = String(cli + 1);
                break;
            }
        }
        tempArr.push(choicesNo);
    }
    return tempArr;
}

//テーブル作成
function makeTable(){
    let answerTable = document.createElement("table");

    //採点済みの場合画面選択値を反映しない
    let idElem = document.getElementById("answerTable");
    if(idElem == null){
        return null;
    }
    let data = [];
    let rows=[];
    let row = [ "問題","1", "2", "3", "4", "5", "6", "7", "8", "9","10","11","12","13","14","15","16","17","18","19","20"];
    data.push(row);

    //回答取得
    data.push(["回答"].concat(getChoicesSelected()));

    // 表に要素を格納
    for(i = 0; i < data.length; i++){
        rows.push(answerTable.insertRow(-1));
        for(j = 0; j < data[0].length; j++){
            cell=rows[i].insertCell(-1);
            cell.appendChild(document.createTextNode(data[i][j]));
        }
    }

    //画面にテーブルがなければ設置し、あれば置き換え
    if (idElem.hasChildNodes()) {
        //指定した要素と置き換える
        let parChild = idElem.firstChild;
        idElem.replaceChild(answerTable,parChild);
    } else {
        // 指定した要素に表を加える
        idElem.appendChild(answerTable);
    }
}

//問題採点
function scoring(jsonObject){
    let aArray = [];
    let scor = [];
    let judgment = [];
    let count = 0;

    //選択した回答を取得
    let choicesSelected = getChoicesSelected();
    //出された問題番号の読み込み
    let choicesArray = getChoicesCookies();

    for (let i = 0; i < choicesArray.length; i++) {
        let rightA = jsonObject[choicesArray[i]].a;
        //正しい回答を格納
        aArray.push(rightA);

        //正解の場合
        if(rightA == choicesSelected[i]){
          judgment.push("〇");
          count++;
        //不正解の場合
        } else {
          judgment.push("×");
        }
    }
    //点数をテーブルに追加
    makeTableAdd(aArray, judgment);

    //合格なら
    if(count >= 17){
        return true;
    }
    return false;
}

//出されている問題をクッキーより取得
function getChoicesCookies(){
    let name = "choices";
    let choicesArray = [];

    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookieData = cookies[i].split("=");
        if(cookieData[0].trim() == name){
            choicesArray = cookieData[1].split(",");
        }
    }
    return choicesArray;
}

//点数テーブルを追加
function makeTableAdd(choicesSelected, judgment){
    let idElem = document.getElementById("answerTable");
    let answerTable = idElem.firstChild;
    let data = [];
    let rows=[];
    let row = [ "正答"].concat(choicesSelected);
    data.push(row);

    //回答取得
    data.push(["結果"].concat(judgment));

    // 表に要素を格納
    for(i = 0; i < data.length; i++){
        rows.push(answerTable.insertRow(-1));
        for(j = 0; j < data[0].length; j++){
            cell=rows[i].insertCell(-1);
            cell.appendChild(document.createTextNode(data[i][j]));
        }
    }

    //IDは用済みなので削除
    idElem.removeAttribute("id");
}

//ダイアログ生成
function makeDialog(){
    //要素生成
    let dialogSpan = document.createElement("span");
    let dialogBackgroundSpan = document.createElement("span");
    let dialogContentSpan = document.createElement("span");
    let dialogMsgDiv = document.createElement("div");
    let dialogButtonDiv = document.createElement("div");

    //ID付与
    dialogSpan.setAttribute("id","dialog");
    dialogBackgroundSpan.setAttribute("id","dialogBackground");
    dialogContentSpan.setAttribute("id","dialogContent");
    dialogMsgDiv.setAttribute("id","dialogMsg");
    dialogButtonDiv.setAttribute("id","dialogButton");

    //要素追加
    dialogContentSpan.appendChild(dialogMsgDiv);
    dialogContentSpan.appendChild(dialogButtonDiv);
    dialogSpan.appendChild(dialogBackgroundSpan);
    dialogSpan.appendChild(dialogContentSpan);
    document.body.appendChild(dialogSpan);

    //ダイアログ非表示ハンドラ設定
    dialogBackgroundSpan.addEventListener("click", dialogHide)
}

//ダイアログ設定
function setDialogMsg(msg, btnID1, btn1Msg, btnID2 = null , btn2Msg = null){
    let idElm = document.getElementById(btnID1);
    //前回同じ内容を設定した場合スキップ
    if(idElm == null){
        document.getElementById('dialogMsg').innerHTML=msg;
        let dialogButtonEml = document.getElementById('dialogButton');

        let button1 = document.createElement("Button");
        button1.setAttribute("id",btnID1);
        button1.appendChild(document.createTextNode(btn1Msg));

        setButton(dialogButtonEml, button1);

        //ボタン2がある場合
        if((btnID2 != null) && (btn2Msg != null)){
            let button2 = document.createElement("Button");
            button2.setAttribute("id",btnID2);
            button2.appendChild(document.createTextNode(btn2Msg));

            setButton(dialogButtonEml, button2, 1);
        }

        //古いボタン2がある場合削除
        if((btnID2 == null) && dialogButtonEml.hasChildNodes() && (dialogButtonEml.childElementCount > 1)){
            let child = dialogButtonEml.children[1];
            dialogButtonEml.removeChild(child);
        }
        return true;
    } else {
        return false;
    }
}

//ダイアログ表示
function dialogShow() {
    var dialog = document.getElementById("dialog");
    dialog.style.display = "block";
}

//ダイアログ非表示
function dialogHide() {
    var dialog = document.getElementById("dialog");
    dialog.style.display = "none";
}

//ボタンセット
function setButton(dialogButtonEml, button, i = 0){
    //設定部分に子要素がある場合置き換える
    if(dialogButtonEml.hasChildNodes() && (dialogButtonEml.childElementCount > i)){
        //指定した要素と置き換える
        let child = dialogButtonEml.children[i];
        dialogButtonEml.replaceChild(button,child);
        //子要素がない場合
    } else {
        dialogButtonEml.appendChild(button);
    }
}

//回答&解説設定
function viewCommentary(jsonObject){
    //出されている問題をクッキーより取得
    let choicesArray = getChoicesCookies();
    let divList = document.getElementById('vertical_tab_nav').getElementsByTagName('div');
    let arList = divList[0].getElementsByTagName('article');
    let j = 0;
    for(let i = 2; i < arList.length - 1; i++) {
        let choiceNum = choicesArray[j];
        let pA = document.createElement('p');
        let pC = document.createElement('p');
        let pTextA = document.createTextNode("答え：" + jsonObject[choiceNum].a);
        let pTextC = document.createTextNode("解説：" + jsonObject[choiceNum].c);
        pA.appendChild(pTextA);
        pC.appendChild(pTextC);
        arList[i].appendChild(pA);
        arList[i].appendChild(pC);
        j++
    }
}

//採点開始確認ダイアログ
function scoringDialog(){
    let setDialogFlg = setDialogMsg("採点を開始しますか？後戻りはできませんよ。", "scoringStr1", "覚悟はできている。", "scoringStr2", "待った!!");
    dialogShow();
    //登録されたらダイアログ非表示ハンドラ設定
    if(setDialogFlg){
        let idElm1 = document.getElementById("scoringStr1");
        //1回の使用で消えるハンドラ
        idElm1.addEventListener("click",judgmentStart,{
            once:true
        })
        let idElm = document.getElementById("scoringStr2");
        idElm.addEventListener("click", dialogHide);

    }
}

//採点処理開始
function judgmentStart(){
    //ボタン内容書き換え
    let scoringButton = document.getElementById('scoringButton');
    scoringButton.removeChild(scoringButton.firstChild);

    //ファイル読み込み
    let req = getFileA();
    // 読み込み出来たらファイル内容を加工
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            let readFile = req.responseText;
            let jsonObject = JSON.parse(readFile);

            //採点
            let judgment = scoring(jsonObject);

            //各画面に表示する回答&解説設定
            viewCommentary(jsonObject);
            //合格の場合は終了
            if(judgment){
                scoringButton.appendChild(document.createTextNode('終了'));
                //クッキー削除
                cookieDelete();
                scoringButton.addEventListener("click", closeScreenDialog);
            } else {
                scoringButton.appendChild(document.createTextNode('もう一回'));
                scoringButton.addEventListener("click", screenReloadDialog);
            }
        }
    }
    //再点開始イベントリスナー削除
    scoringButton.removeEventListener("click", scoringDialog);
    dialogHide();
}

//画面を閉じていいよダイアログ
function closeScreenDialog(){
    let setDialogFlg = setDialogMsg("合格です！画面を閉じていいですよ。<br>セキュリティ上JavaScriptでの画面を閉じる動作はできません。", "closeScreenOK", "合点でぃ！。");
    dialogShow();
    //登録されたらダイアログ非表示ハンドラ設定
    if(setDialogFlg){
        let idElm = document.getElementById("closeScreenOK");
        idElm.addEventListener("click",dialogHide)
    }
}

//画面を再読み込みするか確認ダイアログ
function screenReloadDialog(){
    let setDialogFlg = setDialogMsg("もう一度挑戦しますか?", "closeReloadOK", "同じ過ちは繰り返さない。", "closeReloadNG", "まだ確認したいことがある。");
    dialogShow();
    //登録されたらダイアログ非表示ハンドラ設定
    if(setDialogFlg){
        let idElm = document.getElementById("closeReloadOK");
        idElm.addEventListener("click",screenReload)
        let idElm2 = document.getElementById("closeReloadNG");
        idElm2.addEventListener("click", dialogHide)
    }
}

//画面再読み込み
function screenReload(){
    //クッキー削除
    cookieDelete();
    //再読み込み
    location.reload();
}

//クッキー削除
function cookieDelete(){
    //クッキー取得し削除
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookieData = cookies[i].split("=");
        let cookieName = cookieData[0].trim();
        //過去の日付
        let oldDt = new Date('2000-1-1T00:00:00Z');
        document.cookie = cookieName + "=; expires=" + oldDt.toUTCString();
    }
}

window.onload = function() {
  //クッキー使用可否判定
  let cookieFlg = cookiePermissionJudgment();

  //ダイアログベース生成
  makeDialog();

  if(!cookieFlg){
      let setDialogFlg = setDialogMsg("クッキーを無効にしていませんか？", "cookieNG", "出直してきます");
      dialogShow();
      //登録されたらダイアログ非表示ハンドラ設定
      if(setDialogFlg){
        let idElm = document.getElementById("cookieNG");
        idElm.addEventListener("click", dialogHide)
      }
  }

  //タブ初期設定
  let liList = document.getElementById('vertical_tab').getElementsByTagName('li');
  let spanList = liList[0].getElementsByTagName('span');
  spanList[0].classList.add("selected");
  let divList = document.getElementById('vertical_tab_nav').getElementsByTagName('div');
  let arList = divList[0].getElementsByTagName('article');
  arList[0].style.display = "block";

  //ファイル読み込み
  let req = getFileQ();
  // 読み込み出来たらファイル内容を加工
  req.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
          let readFile = req.responseText;
          let jsonObject = JSON.parse(readFile);

          //問題設定
          setQuestion(liList, arList, jsonObject, cookieFlg);
      }
  }

  //バリチェックフラグ
  let valiFlg = false;

  //タブクリックハンドラ作成
  for (let i = 0; i < liList.length; i++) {
      //タブクリック時
      liList[i].addEventListener("click", function(event) {

          //要素が何番目か取得
          let parentUl = event.target.parentNode;
          let allLi = parentUl.querySelectorAll("li");
          let clickedIndex = Array.prototype.indexOf.call(allLi, event.target);

          //ユーザー情報入力画面の場合入力されたか確認
          if(!valiFlg && clickedIndex != 0){
               let inputList = document.getElementById('userAttributes').getElementsByTagName('input');
               if(inputList[0].value == ""){
                   let setDialogFlg = setDialogMsg("おっと！名前の入力を忘れていないかい？", "nameNG", "こいつぁ、うっかりだ");
                   dialogShow();
                   //登録されたらダイアログ非表示ハンドラ設定
                   if(setDialogFlg){
                       let idElm = document.getElementById("nameNG");
                       idElm.addEventListener("click", dialogHide)
                   }
                   return false;
               }
               if(inputList[1].value == ""){
                   let setDialogFlg = setDialogMsg("おっと！部署名の入力を忘れていないかい？", "departmentNameNG1", "今入れるところだったのに。", "departmentNameNG2", "我は誰の元にも属さぬ。");
                   dialogShow();
                   //登録されたらダイアログ非表示ハンドラ設定
                   if(setDialogFlg){
                       let idElm = document.getElementById("departmentNameNG1");
                       idElm.addEventListener("click", dialogHide)
                       let idElm2 = document.getElementById("departmentNameNG2");
                       //部署に所属していなければ無所属に
                       idElm2.addEventListener("click",function(event) {
                           inputList[1].value = "無所属";
                           dialogHide();
                       })
                   }
                   return false;
               }
          valiFlg = true;
          }

          //終了タブの場合表示する回答内容作成
          if(i == (liList.length - 1)){
              //テーブル作成
              makeTable();
          }

          //クラス付け替え
          let selectedClassList = document.getElementsByClassName("selected");
          selectedClassList[0].classList.remove("selected");
          event.target.querySelector('span').classList.add("selected");

          //全ての画面表示要素を隠す
          for (let i = 0; i < arList.length; i++) {
              arList[i].style.display = "none";
          }

          //要素を表示
          let currentArticle = arList[clickedIndex];
          currentArticle.style.display = "block";
          currentArticle.animate([{opacity: '0'}, {opacity: '1'}], 1000);
      },false);
  }

    // 採点ボタンにハンドラ設定
    let scoringButton = document.getElementById('scoringButton');
    scoringButton.addEventListener("click", scoringDialog);
}