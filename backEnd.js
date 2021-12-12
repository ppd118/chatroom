const userLst = {
    'peipei': {
        'nickname': '菜狗汪汪',
        'password': '000000',
        'avatar': 'imgs/me.png'
    },
    'pig': {
        'nickname': '小猪哼哼',
        'password': '000000',
        'avatar': 'imgs/admin.png'
    },
    'sheep': {
        'nickname': '山羊咩咩',
        'password': '000000',
        'avatar': 'imgs/kunkun.png'
    }
}


const path = require('path')
const http = require('http') // socket的握手就是http
const Koa = require('koa')
const serve = require('koa-static')
const socketIO = require('socket.io')

const hostname = '127.0.0.1'
const port = 3000
const publicPath = path.join(__dirname, 'public')

// 创建koa实例
const app = new Koa()
// 创建http server实例
const server = http.createServer(app.callback())
// 创建socket.io实例
const io = socketIO(server)

// 静态资源路由
app.use(serve(publicPath))


// 登录认证
io.use((socket, next) => {
    const { name, password } = socket.handshake.query

    // 查询数据并进行验证
    if (!userLst[name]) {
        return next(new Error('Invalid username'))
    } else {
        if (userLst[name]['password'] !== password) {
            return next(new Error('Wrong password'))
        }
    }
    next()
})
// 存储所有在线用户
const users = new Map();
// 存储所有历史消息
const history = [];

// 客户端连入
io.on('connection', (socket) => {
    // 记录用户
    const name = socket.handshake.query.name;
    users.set(name, socket);

    console.log(`${name} connected`);

    // 通知所有客户端更新聊天列表
    io.sockets.emit('online', [...users.keys()]);
    // 向客户端发送历史消息
    socket.emit('history', history)

    // 监听客户端发送的消息
    socket.on('sendMessage', (content) => {
        console.log(`${name} send a message: ${content}`);
        const message = {
            time: Date.now(),
            sender: name,
            content: content,
            // avatar: userLst[name]['avatar']
        };
        // 记录消息
        history.push(message);
        // 向所有客户端广播这条消息
        socket.broadcast.emit('receiveMessage', message);
    });

    // 客户端断开连接
    socket.on('disconnect', (reason) => {
        console.log(`${name} disconnected, reason: ${reason}`);
        users.delete(name);
        // 通知所有客户端更新聊天列表
        io.sockets.emit('online', [...users.keys()]);
    });
});

// 静态资源路由
app.use(serve(publicPath));

// 获取所有历史记录的 HTTP 接口
app.use((ctx) => {
    if (ctx.request.path === '/history') {
        ctx.body = history;
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});