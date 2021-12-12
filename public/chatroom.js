const data = {
    // 用户个人信息
    'userInfo': {
        'nickName': 'peipei',
        'avatar': 'imgs/me.png'
    },
    // 用户好友信息
    'friendLst': [
        // 好友1
        {
            'friendInfo': {
                'nickName': '小猪哼哼',
                'avatar': 'imgs/admin.png'
            },
            'contents': [
                {
                    'send': 0,
                    'content': '你好呀!'
                },
                {
                    'send': 1,
                    'content': '晚上好！'
                },
                {
                    'send': 1,
                    'content': '今天吃了什么呀？'
                },
                {
                    'send': 0,
                    'content': '松鼠桂鱼，红烧肉，酱爆茄子，油焖大虾！'
                },
            ]
        },
        // 好友2
        {
            'friendInfo': {
                'nickName': '山羊咩咩',
                'avatar': 'imgs/kunkun.png'
            },
            'contents': [
                {
                    'send': 0,
                    'content': '在吗？在干啥呢？'
                },
                {
                    'send': 1,
                    'content': '发呆摸鱼，论文看不懂代码写不出哭哭'
                },
                {
                    'send': 0,
                    'content': '哈哈哈哈谁不是呢'
                },
                {
                    'send': 1,
                    'content': '算了，既然今天事已至此，那我们去恰饭吧！'
                },
            ]
        },
    ]
}

const userInfo = {
    'peipei': {
        'nickname': '菜狗汪汪',
        'avatar': 'imgs/me.png'
    },
    'pig': {
        'nickname': '小猪哼哼',
        'avatar': 'imgs/admin.png'
    },
    'sheep': {
        'nickname': '山羊咩咩',
        'avatar': 'imgs/kunkun.png'
    }
}

let socket = null
let loginUser = null

function doLogin() {
    const username = document.querySelector('#username').value
    const password = document.querySelector('#password').value

    socket = io({
        query: {
            name: username,
            password: password,
        },
        reconnection: false,
    })

    // 处理认证信息
    socket.on('connect_error', (err) => {
        if (err && err.message === 'Invalid username') {
            alert('用户名不存在！')
            return
        }
        else if (err && err.message === 'Wrong password') {
            alert('密码错误！')
            return
        } else {

        }
    })

    socket.on('connect', () => {
        // 连接成功
        alert('登录成功！')
        loginUser = username
        // 隐藏登录框显示聊天室
        let loginEl = document.querySelector('.login')
        loginEl.style.top = '-100%'
        let chatRoomEL = document.querySelector('.chatRoom')
        chatRoomEL.style.top = '0'
        renderUserInfo()
    })

    socket.on('disconnect', () => {
        // 连接断开
        alert('连接断开！')
    })

    socket.on('online', (onlineUsers) => {
        // console.log(onlineUsers)
        renderFriendList(onlineUsers)
    })

    socket.on('history', (history) => {
        renderChatArea(history)
    })

    socket.on('receiveMessage', (message) => {
        // console.log(message)
        addMessage(message)
    })


}

// 渲染用户信息
function renderUserInfo() {
    let left_userInfoEl = document.querySelector('.left_userInfo')
    let userAvatar = left_userInfoEl.querySelector('.user-avatar')
    userAvatar.src = userInfo[loginUser]['avatar']
    left_userInfoEl.querySelector('.left-userName').innerText = userInfo[loginUser]['nickname']
}

// 渲染左侧好友列表
function renderFriendList(users) {
    // 每次渲染聊天列表先清空
    let leftEl = document.querySelector('.friendList')
    leftEl.innerHTML = ''

    for (u of users) {
        if (u === loginUser) continue
        let left_friendInfoEl = document.createElement('div')
        left_friendInfoEl.className = 'li'
        // left_friendInfoEl.id = 'fid_' + index
        left_friendInfoEl.innerText = userInfo[u]['nickname']
        // 事件绑定的函数应该写成回调格式，否则函数会默认执行
        // left_friendInfoEl.addEventListener('click', function () { selectFriend(left_friendInfoEl.id) })
        leftEl.appendChild(left_friendInfoEl)
    }
}

// 选择单个好友聊天
function selectFriend(friendID) {
    // 选中好友时显示底部信息输入框
    if (!selected_friendID) {
        let inputWrap = document.querySelector('.input-wrap')
        inputWrap.style.setProperty("visibility", "visible");
        let msgWrap = document.querySelector('.msg-wrap')
        msgWrap.style.setProperty("visibility", "visible");
    }

    let centerLogoEl = document.querySelector('.center-logo-wrap')
    centerLogoEl.style.setProperty("display", "none");
    // 若传入选中ID为当前ID则不执行任何动作
    if (friendID === selected_friendID) return
    left_friendInfoEl = document.querySelector('#' + friendID)
    left_friendInfoEl.className = 'li selected'
    // 若当前选中friend不为空，则将变更当前选中为传入选中
    if (selected_friendID != null) {
        selected_friendEl = document.querySelector('#' + selected_friendID)
        selected_friendEl.className = 'li'
    }
    selected_friendID = friendID
    // 选中信息变化，重新渲染右侧聊天框
    renderChatArea()
}

// 渲染右侧聊天框
function renderChatArea(history) {
    if (history.length > 0) {
        let centerLogoEl = document.querySelector('.center-logo-wrap')
        centerLogoEl.style.setProperty("display", "none");
    }
    // 每次重新渲染需要清空聊天框 
    // msgWrapEl.innerHTML = ''
    // 遍历消息列表进行渲染
    for (message of history) {
        addMessage(message)
    }
}



// 发送聊天信息
function sendMessage() {
    let msgWrapEl = document.querySelector('.msg-wrap')
    let bottomInputEL = document.querySelector('#bottomInput')

    let content = bottomInputEL.value
    if (content.length < 1) {
        alert('发送消息为空！')
        return
    }
    // 隐藏logo和slogan
    let centerLogoEl = document.querySelector('.center-logo-wrap')
    centerLogoEl.style.setProperty("display", "none");
    // 生成聊天对话框
    let msgEl = document.createElement('div')
    let imgEl = document.createElement('img')
    msgEl.className = 'msg msg-me'
    imgEl.src = userInfo[loginUser]['avatar']
    imgEl.className = 'avatar'
    msgEl.appendChild(imgEl)
    let msgTxtEl = document.createElement('div')
    msgTxtEl.className = 'msg-txt'
    msgTxtEl.innerText = content
    msgEl.appendChild(msgTxtEl)

    msgWrapEl.appendChild(msgEl)

    // 将新增数据添加到data中
    // data['friendLst'][selected_friendID.split('_').pop()]['contents'].push({ 'send': 1, 'content': content })
    // 清空发送框
    bottomInputEL.value = ''

    // 先检测on的话消息就发送不出去
    // socket.on('connect', () => {
    // 发送消息
    socket.emit('sendMessage', content)
    // console.log('客户端已发送消息！')
    // })


}

// 向消息框追加消息
function addMessage(message) {
    let centerLogoEl = document.querySelector('.center-logo-wrap')
    centerLogoEl.style.setProperty("display", "none");

    let rightEl = document.querySelector('.right')
    let msgWrapEl = rightEl.querySelector('.msg-wrap')
    // 每次重新渲染需要清空聊天框 
    // msgWrapEl.innerHTML = ''
    // 遍历消息列表进行渲染

    let msgEl = document.createElement('div')
    let imgEl = document.createElement('img')
    imgEl.className = 'avatar'
    imgEl.src = userInfo[message['sender']]['avatar']
    if (message['sender'] === loginUser) {
        msgEl.className = 'msg msg-me'
    } else {
        msgEl.className = 'msg'
    }
    msgEl.appendChild(imgEl)

    let msgTxtEl = document.createElement('div')
    msgTxtEl.className = 'msg-txt'
    msgTxtEl.innerText = message['content']
    msgEl.appendChild(msgTxtEl)
    msgWrapEl.appendChild(msgEl)
}

