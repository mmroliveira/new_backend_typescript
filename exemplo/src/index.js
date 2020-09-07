const express = require('express');
const routes = require('./routes');
const morgan = require('morgan');

const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

app.use(routes);

// aproveitar isso para definir rotas publicas e privadas
// require('./controllers/projectController')(app)

app.listen(3333);