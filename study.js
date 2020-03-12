var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var express = require('express');

var counter = 0;
function Product(name, image, price, count) {
    this.index = counter++;
    this.name = name;
    this.image = image;
    this.price = price;
    this.count = count;
}

var products = [
    new Product('더', '파급효과.jpg', '스윙스,Cjamm,바스코,천재노창'),
    new Product('사랑인가요', '사랑인가요.jpg','에릭남'),
    new Product('시차', '시차.jpg','우원재'),
    new Product('노땡큐', 'epic.jpg', '에픽하이'),
    new Product('남이 될 수 있을까', 'bolbbalgan.jpg', '볼빨간 사춘기'),
    new Product('Talking To The Moon', 'bruno.jpg', 'Bruno Mars'),
    new Product('퇴근', '퇴근.jpg', '박재범')
];

var app = express();
var server = http.createServer(app);
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
    var htmlPage = fs.readFileSync('studys.html', 'utf8');

    response.send(ejs.render(htmlPage, {
        products: products
    }));
});

server.listen(52273, function () {
    console.log('Server Running at http://127.0.0.1:52273');
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    function onReturn(index) {
        products[index].count++;

        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    };

    var cart = {};

    socket.on('cart', function (index) {
        products[index].count--;

        cart[index] = {};
        cart[index].index = index;
        cart[index].timerID = setTimeout(function () {
            onReturn(index);
        }, 1000 * 60 * 10);

        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    });
    socket.on('buy', function (index) {
        clearTimeout(cart[index].timerID);


        io.sockets.emit('count', {
            index: index,
            count: products[index].count
        });
    });
    socket.on('return', function (index) {
        onReturn(index);
    });
});