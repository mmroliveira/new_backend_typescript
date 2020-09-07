import express from 'express';

const app = express();

app.get('/', (request, response) => {
  response.json({ message: 'Hellow Word' });
});

app.listen(3333);
