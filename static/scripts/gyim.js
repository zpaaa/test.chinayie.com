URLOBJ = returnToObj(location);
LOGUSER = URLOBJ.username || '测试'; // 用户
touserCompanyId = window.atob(URLOBJ.touserCompanyId || '')
LOGUSER = window.atob(LOGUSER);
URL_TOSER = URLOBJ.touser; // 公司
URL_PRODUCTID = URLOBJ.productId;// 产品ID
URL_TOSER = window.atob(URL_TOSER);
URL_OFFERS = URLOBJ.offers; // 资源单 ID
USER_TYPE = URLOBJ.type; // 用户类别
LOGUSER_HEAD = null; // 用户头像
touser_companyid = null;
user_companyid = null;
receipt_id =  URLOBJ.offers || '';
receipt_type = URLOBJ.receipt_type || '';

// API = "http://192.168.33.243:8081"; // 爱雷
// API = "http://192.168.10.129:8081"; //

API = "https://www.chinayie.com/api/trade"; // test
SCOKET = 'https://www.chinayie.com?'; // test

HEAD_API = API + "/trade/v1/companies/images?filePath=";
COMP_API = API + "/trade/v1/user/company/";
OFFERS_API = API + "/trade/public/v1/mall/offerInfo?offerId=";
// OFFERS_API =API +"/trade/v1/offers/?offerId=";

SPONSOR_ODR = "/my.html#/order/reAdd?typeId=2&orderId=";
CHECK_ODR = "/my.html#/order/detail?orderId=";
ORDER_CENTER = "/my.html#/order/list";
// SCOKET = 'http://192.168.10.132' + '?';
// SAVE_HIS = API + '/trade/logistics/v1/consignments/imInfos';  // 正式

historyOrder =API+'/trade/public/v1/orders/tradeHistory';
newHistoryOrder =API+'/public/v1/orders/im/history'; // 4.25


SAVE_HIS = API+'/trade/im/chatRecords';  //  王鹏飞 单聊
SEARCH_COMP = API +'/trade/im/groups/companies',// 搜索公司
SEARCH_CONCANTACTS = API + '/trade/im/v1/contacts', // 搜索主页用户
CREATE_GRP = API + '/trade/im/groups/', // 创建组
SEARCH_CHATLIST = API+'/trade/im/chatRecords' //  查询IM左侧列表
CHATLIST_DETAILS = API+ '/trade/im/chatRecords/' //  查询用户详细信息
SAVE_OFFER_ID = API+'/trade/im/v1/latestLookOffer' //  保存订单ID
CHANGE_GROUP_MEMBER = API+'/trade/im/groupMembers/' //  修改群组
MKORDER =  API+'/trade/logistics/v1/dmkOrder/' //  查询撮合订单
function returnToObj(href) {
    var params = href.hash;
    params = params.slice(1);
    var paramArr = params.split('&');
    var res = {};
    for (var i = 0; i < paramArr.length; i++) {
        var str = paramArr[i].split('=');
        res[str[0]] = str[1];
    }
    return res;
};


(function (owner, $) {
    //创建连接

    owner.conn = new WebIM.connection({
        isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
        https: typeof WebIM.config.https === 'boolean' ? WebIM.config.https : location.protocol === 'https:',
        url: WebIM.config.xmppURL,
        isAutoLogin: true,
        heartBeatWait: WebIM.config.heartBeatWait,
        autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
        autoReconnectInterval: WebIM.config.autoReconnectInterval,
        apiUrl: WebIM.config.apiURL
    });

    //进行环信注册登录
    owner.reg = function (account) {
        console.log('account', account);
        var options = {
            username: account,
            password: account,
            nickname: account,
            appKey: WebIM.config.appkey,
            success: function (result) {
                owner.log(account);
                console.log("注册成功")
            },
            error: function (e) { //注册失败;
                owner.log(account);
                console.log("注册失败")
            },
            apiUrl: WebIM.config.apiURL
        };

        var conn_con = new WebIM.connection();
        owner.conn.registerUser(options);
    }

    //环信登录
    owner.log = function (mobile) {
        var options = {
            apiUrl: WebIM.config.apiURL,
            user: mobile,
            pwd: mobile,
            appKey: WebIM.config.appkey,
            success: function (token) {
                var token = token.access_token;
                owner.setAccessToken(token);
                console.log("登陆成功")
            }
        };
        owner.conn.open(options);
    }

    owner.setAccessToken = function (accessToken) {
        accessToken = accessToken || "";
        localStorage.setItem('$accessToken', accessToken);
    }
    // 单聊发送文本消息
    owner.sendPrivateText = function (content, touser, callback) {
        var id = owner.conn.getUniqueId(); // 生成本地消息id
        var msg = new WebIM.message('txt', id); // 创建文本消息
        msg.set({
            msg: content, // 消息内容
            to: touser, // 接收消息对象（用户id）
            roomType: false,
            success: function (id, serverMsgId) {
                console.log("发送成功" + touser)
                callback()
            },
            fail: function (e) {
                alert('消息发送失败,请检查网络连接');
            }
        });
        msg.body.chatType = 'singleChat';
        owner.conn.send(msg.body);
    };
    // 暂时没啥用，都没见调用过
    owner.addtextmsg = function (msg, box, inp, touser_head) {

        if (msg.from == LOGUSER) {
            var new_el = document.createElement("div");
            new_el.classList.add("chatitem_cent");
            new_el.innerHTML = "<img src='" + LOGUSER_HEAD + "' class='headimg'/><p>" + msg.content + "</p>";
            box.appendChild(new_el);
            box.parentNode.scrollTop = box.parentNode.scrollHeight;
        } else if (msg.from != LOGUSER) {
            var new_el = document.createElement("div");
            new_el.classList.add("chatitem_res");
            new_el.innerHTML = "<img src='" + touser_head + "' class='headimg'/><p>" + msg.content + "</p>";
            box.appendChild(new_el);
            box.parentNode.scrollTop = box.parentNode.scrollHeight;
        }
        inp.value = "";
    };

    owner.addHisSingle = function (touser, message) { //增加单条记录

        var localhistory = localStorage.getItem("localhis_" + LOGUSER);

        if (!localhistory) {

            localhistory = '{"' + touser + '":[' + JSON.stringify(message) + ']}';
            localStorage.setItem("localhis_" + LOGUSER, localhistory);

        } else {

            var newobj = JSON.parse(localhistory);

            if (touser in newobj) {
                newobj[touser].push(message);
                localStorage.setItem("localhis_" + LOGUSER, JSON.stringify(newobj));
            } else {

                localhistory = '{' + localhistory.slice(1, -1) + ',"' + touser + '":[' + JSON.stringify(message) + ']}';
                localStorage.setItem("localhis_" + LOGUSER, localhistory);
            }

        }
    };
    // 暂时没啥用，都没见调用过
    owner.addHisArr = function (touser, data) {
        var localhistory = localStorage.getItem("localhis_" + LOGUSER);
        if (!localhistory) {
            localhistory = '{"' + touser + '":' + JSON.stringify(data) + '}';
            localStorage.setItem("localhis_" + LOGUSER, localhistory);
        } else {

            var newobj = JSON.parse(localhistory);
            if (!(touser in newobj)) {

                localhistory = '{' + localhistory.slice(1, -1) + ',"' + touser + '":' + JSON.stringify(data) + '}';

                localStorage.setItem("localhis_" + LOGUSER, localhistory);
            }
        };
    };


}(window.gyim = {}, jQuery));
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

function isToday(str) {
    if (new Date(str).toDateString() === new Date().toDateString()) {
        //今天
        var d = new Date(str);
        var hour = d.getHours();
        var min = d.getMinutes();
        var sec = d.getSeconds();
        console.log(hour + ":" + min + ":" + sec);

    } else if (new Date(str) < new Date()) {
        //之前
        var d = new Date(str);
        var year = d.getYear();
        var mouth = d.getMonth() + 1;
        var day = d.getDate();
        console.log(year + "-" + mouth + "-" + day);
    }
}
