const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');


const app = express();
let port = 3000;
let host = 'localhost';


let events = [
    {id: '1', category: 'Clubbing', title: 'Emo Nite', host: '', details: '', location: '', start: '', end: '', banner: ''}, 
    {id: '2', category: 'Clubbing', title: 'Kpop Club Night', host: '', details: '', location: '', start: '', end: '', banner: ''}, 
    {id: '3', category: 'Clubbing', title: 'Shrek Night', host: '', details: '', location: '', start: '', end: '', banner: ''}
];

app.use(express.static('public')); //middleware to give access to css style and images
app.use(express.urlencoded({ extended: true }));

app.use(morgan('tiny'));

app.use((req, res, next) => {
        if (req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
        // so console is less cluttered
        return next();
    }
    console.log(req.method);
    console.log(req.url);
    next();
});


app.get('/', (req, res)=> {
    res.sendFile('./views/index.html', { root: __dirname });
});

app.get('/events', (req, res) => {
    res.json(events);
});

app.post('/events', upload.single('banner'), (req, res) => {
    console.log(req.body);
    console.log(req.file);
    let event = req.body;
    event.id = uuidv4();
    // Attach banner filename or path if file uploaded
    if (req.file) {
        event.banner = req.file.filename; // or req.file.path for full path
    } else {
        event.banner = '';
    }
    events.push(event);
    res.redirect('/events');
});

app.get('/events/create', (req, res) => {
    res.sendFile('./views/newEvent.html', { root: __dirname });
});

//send event with a particular id back to the client
app.get('/events/:eid', (req, res) => {
    let id = req.params.eid;
    let event = events.find(element => element.id === id);
    res.json(event);
});

app.get('/index.html', (req, res) => {
    res.sendFile('./views/index.html', { root: __dirname });
});

app.get('/events.html', (req, res) => {
    res.sendFile('./views/events.html', { root: __dirname });
});

app.get('/event.html', (req, res) => {
    res.sendFile('./views/event.html', { root: __dirname });
});

app.get('/newEvent.html', (req, res) => {
    res.sendFile('./views/newEvent.html', { root: __dirname });
});

app.get('/contact', (req, res) => {
    res.send('Contact page');
});


app.get('/contact-me', (req, res) => {
    res.redirect(301, '/contact')
});

app.use((req, res, next) => { //Middleware to distribute our own 404 raw handler
    res.status(404).send('Page cannot be found');
});

app.listen(port, host, () => {
    console.log('The server is running at port', port);
});

