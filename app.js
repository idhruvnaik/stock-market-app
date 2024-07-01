const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoute = require('./routes/userRoutes');

const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/user', userRoute);
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
