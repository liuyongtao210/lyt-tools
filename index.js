var fileNameArr = []
var canvasObjs = {};

/**
 * 上传文件：
 * var upfilebtn=document.getElementById('upfilebtn')
           upfilebtn.onclick=function(){
            tools.upLoad({
                url:'http://www.baidu.com',
                fileType:'png,gif',
                fileSize:5,
                readSuccess:(data)=>{
                    console.log('data',data)
                    for(var i=0;i<data.length;i++){
                      var img=  document.createElement('img')
                      img.src=data[i]
                    // var img=  `<img src='${data[i].target.result}' alt="">`
                      document.body.appendChild(img)
                    // document.getElementById('imgcontent').innerHTML(img)
                    }
                    },
                errorFn:(data)=>{
                    console.log(data)
                }
                }
            )
           }
 * 
 */
class upLoadFile {
    constructor() {
        
    }
    init() {}
    upLoad(paramsObj = {}) {
        let defuleOption = {
            url: '', //服务器地址
            fileType: 'jpg,jpeg,gif,bmp,txt,doc,xls,ppt,docx,xlsx,pptx', //文件类型限制
            multiple: false, //同时上传文件数量
            fileSize: 50, //限制文件大小
            params: null, //上传文件携带参数
            readSuccess: () => {},
            errorFn: () => {},
            success: () => {}
        }
        let options = Object.assign({}, defuleOption, paramsObj)
        if (options.url == '') {
            options.errorFn('服务器地址为空')
            throw 'Error:The server address is empty!'
            return false;
        }

        let input = document.createElement('input');
        input.type = 'file';
        if (options.multiple) {
            input.multiple = 'multiple'
        } //是否可多选
        input.click();
        input.onchange = function (e) {
            var file = Array.from(input.files);
            var size = 0
            for (var i = 0; i < file.length; i++) { //过滤掉重复文件，这里用文件名来判断
                size += file[i].size
                // if(fileNameArr.includes(file[i].name)){
                //     file.splice(i,1)
                //     i=i-1;
                // }else{
                //     fileNameArr.push(file[i].name) //这里要放在上传成功后 才把文件名加进去
                // }
                if (!options.fileType.includes(file[i].name.split('.')[1].toLowerCase())) {
                    options.errorFn('上传文件类型只能是:' + options.fileType)
                    throw 'File type error'
                    return false;
                }

            }
            if (size > 1024 * 1024 * options.fileSize) {
                options.errorFn('上传文件最大不能超过' + options.fileSize + 'M')
                return false;
            }

            // if(file.length<=0){
            //     options.errorFn('所选文件重复，没有可上传文件')
            //     throw 'File duplication please re-select the file'
            //     return false ;
            // }else if(file.length>3){
            //     options.errorFn('同时上传文件数量不能超过3个')
            //     throw 'Up to 3 files simultaneously'
            //     return false ;
            // }


            // var readFileArr=[];
            // new Promise((resolve, reject)=>{
            //     var length =0
            //     var readFile =new FileReader();
            //     readFile.readAsDataURL(file[length]);
            //     readFile.onload=function(data){
            //         length++
            //         readFileArr.push(this.result)
            //         if(length<file.length){
            //             readFile.readAsDataURL(file[length]);
            //         }else{
            //             resolve(readFileArr)
            //         }
            //     }
            // }).then((data)=>{
            //     options.readSuccess(data)
            // })
            
            var form = new FormData();
            var singleFile = file[0]
            form.append("file", singleFile);
            form.append("fileName", singleFile.name);
            form.append("size", singleFile.size);
            if (options.params != null) {
                for (let key in options.params) {
                    form.append(key, options.params[key])
                }
            }
            var xhr = new XMLHttpRequest()
            xhr.open('post', options.url)
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        options.success(xhr.responseText)
                    }
                }
            }
            xhr.onerror = function (e) {
                options.errorFn(e)
            }
            xhr.send(form)
        }
    }
}
/***
 * 画线：
 * var canvascontent=document.getElementById('canvascontent')
 * draw.draw(canvascontent,{
               strokeStyle:'#ff5500',
               lineWidth:1,
            })
    清除画线：        
 *  var clearCanvas=document.getElementById('clearCanvas')
  clearCanvas.onclick=function(){
                draw.clearCanvas(canvascontent)
            }
 */
class drawLine {
    constructor() {
        console.log('元素非canvas的时候宽高可以在样式表css中设置，元素是canvas本身的时候宽高必须要在canvas本身上设置')
    }
    draw(ele = '', drawObj = {}) {
        // console.log(ele)
        // lineCap = "butt,round,square";
        // ctx.lineJoin = "bevel,round,miter";
        let defultDrawObj = {
            lineWidth: 1,
            lineCap: 'round',
            lineJoin: 'round',
            strokeStyle: '#000000',
            drawBackFn: () => {}
        }
        let drawOptions = Object.assign({}, defultDrawObj, drawObj)
        // let ele =drawOptions.el;
        let canvas = null;
        if (ele.nodeName.toLowerCase() != 'canvas') {
            var rect = ele.getBoundingClientRect()
            canvas = document.createElement('canvas');
            canvas.width = rect.width;
            canvas.height = rect.height
            ele.append(canvas)
        } else {
            canvas = ele;
        }
        canvas.id = 'my-canvas-' + ele.id
        // canvasObjs[canvas.id]=document.getElementById(canvas.id)
        // console.log(canvasObjs)
        
        var canvasObj = document.getElementById(canvas.id)
        var ctx = canvasObj.getContext('2d')
        for (let key in drawOptions) {
            ctx[key] = drawOptions[key]
        }
        var isDraw = false;
        canvasObj.onmousedown = function (event) {
            isDraw = true;
            let e = event || window.event
            ctx.moveTo(e.offsetX, e.offsetY);
            drawOptions.drawBackFn({
                x: e.offsetX,
                y: e.offsetY
            })
        }
        canvasObj.onmousemove = function (event) {
            if (isDraw) {
                let e = event || window.event
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.moveTo(e.offsetX, e.offsetY)
                ctx.stroke();
                drawOptions.drawBackFn({
                    x: e.offsetX,
                    y: e.offsetY
                })
            }
        }
        canvasObj.onmouseup = function (event) {
            let e = event || window.event
            isDraw = false;
            drawOptions.drawBackFn({
                x: e.offsetX,
                y: e.offsetY
            })
        }
        canvasObj.onmouseleave = function (event) {
            let e = event || window.event
            isDraw = false;
            // ctx.clearRect(0,0,canvasObj.width,canvasObj.height);  

        }
    }
    loadCanvasImg() {
        var url = canvasObj.toDataURL('image/png')
        //   var img=  document.createElement('img')
        //   img.src=url;
        var a = document.createElement('a');
        a.href = url;
        a.download = name || '下载图片名称'
        a.click()
    }
    clearCanvas(ele) {
        var id = null;
        if (ele.nodeName.toLowerCase() != 'canvas') {
            id = 'my-canvas-' + ele.id
        } else {
            id = ele.id
        }
        var c = document.getElementById(id)
        var ctx = c.getContext("2d");
        ctx.beginPath()
        ctx.clearRect(0, 0, c.width, c.height);
    }
}
/***
 * 复制示例：
 *  var copybtn=document.getElementById('copybtn')
            var copytext=document.getElementById('copytext')
            copybtn.onclick=function(){
                copy.copy(copytext,function(data){
                    console.log(data)
                })
            }
 */
class copyText {
    constructor() {}
    copy(ele, success = () => {}) {
        var textarea = document.createElement('textarea')
        textarea.id = 'my-textarea-' + ele.id
        ele.appendChild(textarea)
        textarea.value = ele.innerText
        var textareaId = textarea.id
        var selectTxt = document.getElementById(textareaId)
        selectTxt.select();
        document.execCommand('Copy')
        ele.removeChild(textarea)
        success(ele.innerText)
    }
}

/**
 * 倒计时示例：
 *  var countdown =Tools.countdown
            let time =new Date('2019-03-18 21:31').getTime()
            countdown.timedown({
                el:'countdown',
                endTime:time,
                timeType:'hh:mm:ss',
                callBack:function(data){
                    console.log(data)
                }
            })
 * 
 */
class counttimedown{
    constructor(){
        // console.log('hello time down')
    }
    timedown(option={}){
      let defuleOptions ={
          el:'',
          endTime:new Date().getTime(),
          sysTime:new Date().getTime(),
          timeType:'DD hh:mm:ss',
          dayText:'天',
          hourText:'时',
          minText:'分',
          secondText:'秒',
          currentDate:new Date(),
          callBack:()=>{}
      }
      let options =Object.assign({},defuleOptions,option)
    //   console.log(options)
      let timeType=options.timeType.trim();
      let sysTime=options.sysTime;
      let endTime=options.endTime;
      let dayText=options.dayText;
      let hourText=options.hourText;
      let minText=options.minText;
      let secondText=options.secondText;
      let currentDate=options.currentDate;
      let callBack=options.callBack;
    //   if(timeType!='DD hh:mm:ss'&&timeType!='hh:mm:ss'){
    //     timeType="DD hh:mm:ss"
    //   }

      let ele =document.getElementById(options.el)||document.getElementsByClassName(options.el)[0]
      if(!ele){
          throw new Error(`Element is ${ele}`)
          return false
         }
        let oneDay=86400000; //一天 1000*60*60*24=86400000 毫秒
        let oneHour =3600000;//一小时  1000*60*60= 3600000 毫秒
        let oneMin =60000;//一分钟1000*60= 60000 毫秒
        let oneSecond =1000; // 一秒 1000毫秒
        let timer=null;
        if(timeType=='DD hh:mm:ss'){
            timer=  setInterval(function(){
                sysTime+=1000;
                let intervalTime=endTime-sysTime
                
                let day = Math.floor(intervalTime/oneDay)
                let hour =Math.floor((intervalTime-day*oneDay)/oneHour)
                let min =Math.floor((intervalTime-day*oneDay-hour*oneHour)/oneMin)
                let second =Math.floor((intervalTime-day*oneDay-hour*oneHour-min*oneMin)/oneSecond)
                let timeHtml =`
                <span class="timedown" id="time_hour">${day<10?'0'+day:day}</span>
                <span class="timedown" id="time_txt">${dayText} </span>
                <span class="timedown" id="time_hour">${hour<10?'0'+hour:hour} </span>
                <span class="timedown" id="time_txt">${hourText} </span>
                <span class="timedown" id="time_hour">${min<10?'0'+min:min} </span>
                <span class="timedown" id="time_txt">${minText} </span>
                <span class="timedown" id="time_hour">${second<10?'0'+second:second} </span>
                <span class="timedown" id="time_txt">${secondText} </span>
                `
                if(intervalTime>0){
                    ele.innerHTML=timeHtml
                }else{
                    clearInterval(timer)
                    callBack({
                        day:0,
                        hour:0,
                        min:0,
                        second:0
                    })
                }
              
            },1000)
        }else{
            timer=  setInterval(function(){
                sysTime+=1000;
                let intervalTime=endTime-sysTime
                let hour =Math.floor(intervalTime/oneHour)
                let min =Math.floor((intervalTime-hour*oneHour)/oneMin)
                let second =Math.floor((intervalTime-hour*oneHour-min*oneMin)/oneSecond)
                let timeHtml =`
                <span class="timedown" id="time_hour">${hour<10?'0'+hour:hour} </span>
                <span class="timedown" id="time_txt">${hourText} </span>
                <span class="timedown" id="time_hour">${min<10?'0'+min:min} </span>
                <span class="timedown" id="time_txt">${minText} </span>
                <span class="timedown" id="time_hour">${second<10?'0'+second:second} </span>
                <span class="timedown" id="time_txt">${secondText} </span>
                `
            if(intervalTime>0){
                ele.innerHTML=timeHtml
            }else{
                clearInterval(timer)
                callBack({
                    hour:0,
                    min:0,
                    second:0
                })
            }
            
            },1000)
        }
    }
}

/**
 * 日历使用说明：
 * defuleOption 对象：默认配置参数：el 、getDateData、date、clcikEveryDay、weekList
 * el : 要展示日历的盒子 ，不一定是必须  当getDateData为false 的时候，el必须填。
 * getDateData：释放获取日历对象，当为true 的时候 获取到的结果是一个 日历对象数组，拿到此数组 可以用于mvvm模式的数据双向绑定操作，为false的时候 会生成一个
 * 日历DOM树，加到el元素中显示日历。
 * date：初始化日历时间，不是必须，不填的时候 默认为当天
 * clcikEveryDay：点击某天的回调函数，不是必须。当getDateData为true时，此回调无效。（getDateData为true时，只返回日历对象数组，展示逻辑和事件逻辑需要自己重写。返回数据主要用于mvvm）
 * weekList：日历头文本显示。 不是必须，不填默认为  '一','二','三','四','五','六','日'
 * 
 * 使用示例： 
 *   引入文件：import Tools from './tools.js'  
 *   获取日历相关封装的函数： var calendar=Tools.calendars; 
 * 
 * 初始化日历（getDateData为true）:
 * let getDate= calendar.calendarInit({
                date:new Date(),
                getDateData:true,
                weekList:['one','two','three','four','five','six','seven',]
            })
  console.log(getDate)  得到的是一个日历的数组对象
 * 
 * 
 * 初始化日历（getDateData为false） ：
 * let getDate= calendar.calendarInit({
                el:'calendar',
                date:new Date(),
                getDateData:false,
                clcikEveryDay:function(data){
                    console.log(data)
                }
                weekList:['one','two','three','four','five','six','seven',]
            })

           点击上月 下月：
           let prev =document.getElementById('prev')
            let next =document.getElementById('next')
            prev.onclick=function(){
               calendar.changeMonth(0,function(data){
                console.log(data)
               })
            }
            next.onclick=function(){
                calendar.changeMonth(1,function(data){
                    console.log(data)
                })
            } 
 * 


 * 
 **/
class calendar {
    constructor() {
        this.year='';
        this.month='';
        this.day='';
        this.options=''
        this.clcikDay={
            year:'',
            month:'',
            day:''
        }
    }
    changeMonth(num,fun=()=>{}){
        if(num==0){
            this.month--
        }else{
            this.month++
        }
        let date=new Date(this.year,this.month,0)
        this.options.date=date;
        if(this.options.getDateData){
            return this.calendarInit(this.options)
        }
        this.calendarInit(this.options)
        fun(this.options)
    }
    calendarInit(option={}) {
        let defultOption ={
            el:'',
            getDateData:false,
            date:new Date(),
            clcikEveryDay:()=>{},
            weekList:['一','二','三','四','五','六','日']
        }
        let options =Object.assign({},defultOption,option)
        let ele =document.getElementById(options.el)||document.getElementsByClassName(options.el)[0];
        let weekList =options.weekList;
        let getDateData=options.getDateData//是否只返回数据 返回数据之后 需要业务端自己写DOM模板
        let clcikEveryDay=option.clcikEveryDay//点击每天的回调
        this.options=option
        
        let currentDate= new Date()//当前时间 
        let currentYear =currentDate.getFullYear();
        let currentMonth =currentDate.getMonth()+1;
        let currentDay =currentDate.getDate();

        let date =new Date(options.date) //初始化时间 
        let year =date.getFullYear();//年
        let month =date.getMonth()+1;//月
        let day =date.getDate();//日
        let week=date.getDay();//星期
        this.month=month;
        this.year=year;
        this.day=day;
        // let hour =date.getHours();//时
        // let min =date.getMinutes();//分
        // let second =date.getSeconds();//秒
        week==0?week=7:''
        let  haveDay=new Date(year,month,0).getDate()//选择的当前月份有多少天

        let prevDate=new Date(year,month-1,0)//上个月 
        let prevYear =prevDate.getFullYear();
        let prevMonth =prevDate.getMonth()+1;
        let prevDay =prevDate.getDate();//上个月有多少天
        let  preMonthLastWeek =prevDate.getDay()//上月最后一天是周几 
        preMonthLastWeek==0?preMonthLastWeek=7:''

        let nextDate=new Date(year,month+1,0)//下个月
        let nextYear =nextDate.getFullYear();
        let nextMonth =nextDate.getMonth()+1;
        let nextDay =nextDate.getDate();
        
        // console.log('当前月:',year,month,day,week,haveDay)
        // console.log('上月:',prevYear,prevMonth,prevDay,preMonthLastWeek)
        // console.log('下月:',nextYear,nextMonth,nextDay)
        let dateArray=[]
        for(var i=0;i<42;i++){
            let dateObj ={
                year:'',
                month:'',
                day:'',
                hour:'',
                min:'',
                second:'',
                timeStamp:'',
                currentMonth:false,
                currentDay:false
            }
            // dateObj.day=i+1;
            dateArray.push(dateObj)
        }
        for(let i=0;i<preMonthLastWeek;i++){//设置日历数组中上个月的数据
            dateArray[i].year=prevYear;
            dateArray[i].month=prevMonth;
            dateArray[i].day=(prevDay-preMonthLastWeek+1)+i;
            dateArray[i].timeStamp=new Date(prevYear,prevMonth,(prevDay-preMonthLastWeek+1)+i).getTime()
        }
        for(let i=0;i<haveDay;i++){//设置日历数组中选择的当前月的数据
            let j =preMonthLastWeek+i
           
            dateArray[j].year=year;
            dateArray[j].month=month;
            dateArray[j].day=i+1;
            dateArray[j].currentMonth=true;
            dateArray[i].timeStamp=new Date(year,month,i+1).getTime()
            if(currentYear==year&&currentMonth==month&&currentDay==dateArray[j].day){
                dateArray[j].currentDay=true;
            }
        }
        for(let i=0;i<(42-preMonthLastWeek-haveDay);i++){//设置日历数组中下个月的显示数据
            let j =preMonthLastWeek+haveDay+i
            dateArray[j].year=nextYear;
            dateArray[j].month=nextMonth;
            dateArray[j].day=i+1;
            dateArray[i].timeStamp=new Date(nextYear,nextMonth,i+1).getTime()
        }
        if(getDateData){
            let dateData={
                weekData:weekList,
                dateArray:dateArray,
                year:year,
                month:month
            }
            return dateData
        }
        let weekHtml='';let dateHtml=''
        for(let i=0;i<weekList.length;i++){
            weekHtml+=`<span class="date-defult week-list" style="width:14.28%;height:30px;display:inline-block;text-align:center">
            ${weekList[i]}
            </span>`
        }
        weekHtml=`<div class="week-list-box">${weekHtml}</div>`
        for(let i=0;i<dateArray.length;i++){
            let currentMonthCss=''
            let clcikDay=''
            if(this.clcikDay.year==dateArray[i].year&&this.clcikDay.month==dateArray[i].month&&this.clcikDay.day==dateArray[i].day){//点击某天，保存某天的状态
                clcikDay='clcik-day'
            }
            if(dateArray[i].currentMonth){
                if(dateArray[i].currentDay){
                    currentMonthCss=`current-month current-day ${clcikDay}` //当前天
                }else{
                    currentMonthCss=`current-month ${clcikDay}`//当前月
                }
                
            }else{
                currentMonthCss=`other-month ${clcikDay}`//其他月
            }
            let data=JSON.stringify(dateArray[i])
            // console.log(data)
            dateHtml+=`<div data-date=${data} class="date-defult-css"  style="width:14.28%;height:30px;display:inline-block;text-align:center" >
            <span class="date-item ${currentMonthCss}" data-date=${data} style="width:30px;height:30px;display:inline-block;line-height:30px; position: relative;">
            ${dateArray[i].day}
            <i></i>
            </span>
            </div>`
        }
        dateHtml=`<div class="date-box">${dateHtml}</div>`
        let calendarHtml=weekHtml+dateHtml;
        ele.innerHTML=calendarHtml;
        ele.onclick=(e)=>{
           let dataitem= document.getElementsByClassName('date-item')
            if(e.target.nodeName.toLowerCase()=='span'){
                for(let i=0;i<dataitem.length;i++){
                    dataitem[i].classList.remove('clcik-day')
                    e.target.classList.add('clcik-day')
                }
                let date =JSON.parse(e.target.dataset.date)
                this.clcikDay.year=date.year
                this.clcikDay.month=date.month
                this.clcikDay.day=date.day
                clcikEveryDay(e)
            }
        }
       
    }
}

class mediaPlay {
    constructor(){
        this.isPlay=false;
    };
    mediaInit(option={}){
        let defultOption={
            el:'',
            url:'',
            type:'audio',
            mediaId:'media-id'//可以给音视频 赋值一个ID ，否则使用默认
        }
        let options =Object.assign({},defultOption,option);
        let ele =document.getElementById(options.el)||document.getElementsByClassName(options.el)[0];
        if(!ele){
            throw new Error('element is node defiend!')
            return false
        }
        let mediaUrl =options.url
        let type=options.type
        let mediaId=options.mediaId

        // let mediaBox =document.createElement('div');
        // mediaBox.classList.add('media-box')
        // mediaBox.style.width='100%';
        // mediaBox.style.height='100%';
        // mediaBox.style.position='relative';

        // let mediaEle= document.createElement('video');
        // mediaEle.src=mediaUrl
        // mediaEle.style.width='100%'
        // // media.style.height="100%"
        // mediaBox.appendChild(mediaEle)

        // ele.appendChild(mediaBox)
       
        // mediaEle.ondurationchange=function(e){
        //     mediaEle.pause()
        // }
        let mediaEle=''
        if(type=='video'){
            mediaEle= `<video id=${mediaId}  width="100%" height="100%" src=${mediaUrl}></video>`
        }else if(type=='audio'){
            mediaEle= `<audio id=${mediaId}  style="position:absolute;width:0;height:0;z-index:-10" src=${mediaUrl}></audio>`
        }
        let bgStyle=''
        if(this.isPlay){
            bgStyle='#333333'
        }else{
            bgStyle='#666666'
        }
        let mediaHtml=`<div class="media_box" id="${mediaId}_play_area" style="width:100%;height:100%;position:relative">
            ${mediaEle}
            <div class="media_progress" style="position:absolute;bottom:0;left:0;width:100%;height:30px;border:1px solid red;">
                <div class="pro_box" style="position:relative;bottom:0;left:0;width:100%;height:30px;display:flex;align-items: center;">
                    <div class="play_btn" id="${mediaId}_play_btn"  style="width:30px;height:30px;border-radius:50%;background:${bgStyle}">
                    </div>
                    <div class="pro_line_box" id="${mediaId}_line_box" style="flex:1;height:3px;background:#333;margin:0 10px;position:relative;">
                        <div class="pro_line" id="${mediaId}_pro_line" style="position:absolute;height:100%;left:0;top:0;background:red;"></div>
                        <div class="origin" id="${mediaId}_origin" style="position:absolute;left:0;top:-2px;width:8px;height:8px;border-radius:50%;background:red"></div>
                    </div>
                </div>
            </div>
        </div>`
        ele.innerHTML=mediaHtml
        let getmediaObj=document.getElementById(mediaId);
        let totalTime=''
        
        getmediaObj.oncanplay=function(e){
            totalTime=getmediaObj.duration
            console.log(totalTime)
          
        }
        let _play_btn= document.getElementById(`${mediaId}_play_area`)
        _play_btn.onclick=function(e){
            if(!this.isPlay){
                this.isPlay=true;
                 getmediaObj.play()
                 document.getElementById(`${mediaId}_play_btn`).style.background="red"
            }else{
                 this.isPlay=false;
                 getmediaObj.pause()
                 document.getElementById(`${mediaId}_play_btn`).style.background="#333"
            }
             
         }
        getmediaObj.ontimeupdate=function(e){
            console.log(getmediaObj.currentTime)
            document.getElementById(`${mediaId}_pro_line`).style.width=(getmediaObj.currentTime/totalTime)*100+'%'
            document.getElementById(`${mediaId}_origin`).style.left=(getmediaObj.currentTime/totalTime)*100+'%'
        }
        getmediaObj.onended=function(){
            this.isPlay=false;
            getmediaObj.pause()
            document.getElementById(`${mediaId}_play_btn`).style.background="#333"
        }

    }
}
const toTwoArray =function(x, y) {
    let reg = /^[1-9]+[0-9]*]*$/
    if (!(x instanceof Array)) {
        console.log('请传入数组')
        return false
    }
    if (!reg.test(y)) {
        console.log('请输入正整数')
        return false
    }
    let arr = x
    let num = Math.ceil(x.length / y) // 每组Y个 共分几组
    let j = 0
    let newArr = []
    for (let i = 0; i < num; i++) {
        let a = []
        for (let k = 0; k < y; k++) {
            // if (j > x.length - 1) {
            // 	break
            // }
            a.push(arr[j])
            j++
        }
        newArr.push(a)
    }
    return newArr
}
const DayList =function(date = new Date()) {
    //处理时间方法
    this.year = new Date(date).getFullYear(); //当前年
    this.month = new Date(date).getMonth() + 1; //当前月
    // 设置月份数组对象：
    let dateArray = [];
    // 获取初始化时间
    let initDate = new Date(date);
    let year = initDate.getFullYear();
    let month = initDate.getMonth() + 1;
    // let day =initDate.getDate();
    // 获取初始化时间当月有多少天：
    let haveDay = new Date(year, month, 0).getDate();

    // 获取当前时间
    let currentDate = new Date(); //当前时间
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let currentDay = currentDate.getDate();

    // 获取初始化时间的上个月：
    let prevDate = new Date(year, month - 1, 0);
    let prevYear = prevDate.getFullYear();
    let prevMonth = prevDate.getMonth() + 1;
    let prevDay = prevDate.getDate();
    // 获取上个月最后一天是周几
    let preMonthLastWeek = prevDate.getDay() == 0 ? 7 : prevDate.getDay();

    // 获取初始化时间下个月：
    let nextDate = new Date(year, month + 1, 0);
    let nextYear = nextDate.getFullYear();
    let nextMonth = nextDate.getMonth() + 1;
    // let nextDay =nextDate.getDate();

    for (let i = 0; i < 42; i++) {
      let dayObj = {
        year: "",
        month: "",
        day: "",
        timeStamp: "",
        isCurrentMonth: false,
        isCurrentDay: false,
        haveDate: false,
        weight: "",
        check: false
      };
      dateArray.push(dayObj);
    }
    // 设置初始化时间数据：
    for (let i = 0; i < haveDay; i++) {
      let j = preMonthLastWeek + i;
      dateArray[j].year = year;
      dateArray[j].month = month;
      dateArray[j].day = i + 1;
      dateArray[j].timeStamp = new Date(year, month - 1, i + 1).getTime();
      dateArray[j].isCurrentMonth = true;
      if (
        currentYear == year &&
        currentMonth == month &&
        currentDay == dateArray[j].day
      ) {
        dateArray[j].isCurrentDay = true;
        dateArray[j].check = true;
      }
    }
    // 设置初始化时间的上个月的数据：
    for (let i = 0; i < preMonthLastWeek; i++) {
      dateArray[i].year = prevYear;
      dateArray[i].month = prevMonth;
      dateArray[i].day = prevDay - preMonthLastWeek + 1 + i;
      dateArray[i].timeStamp = new Date(
        prevYear,
        prevMonth - 1,
        prevDay - preMonthLastWeek + 1 + i
      ).getTime();
    }
    // 设置初始化时间的下个月的数据：
    for (let i = 0; i < 42 - preMonthLastWeek - haveDay; i++) {
      //设置日历数组中下个月的显示数据
      let j = preMonthLastWeek + haveDay + i;
      dateArray[j].year = nextYear;
      dateArray[j].month = nextMonth;
      dateArray[j].day = i + 1;
      dateArray[j].timeStamp = new Date(
        nextYear,
        nextMonth - 1,
        i + 1
      ).getTime();
    }
    // console.log(dateArray)
    return dateArray;
  }
var upload = new upLoadFile()
var calendars = new calendar()
var draw = new drawLine()
var copy = new copyText()
var countdown =new counttimedown()
var media=new mediaPlay()
export default {
    upload: upload,
    calendars: calendars,
    draw: draw,
    copy: copy,
    countdown:countdown,
    media:media,
    toTwoArray:toTwoArray,
    DayList:DayList
}