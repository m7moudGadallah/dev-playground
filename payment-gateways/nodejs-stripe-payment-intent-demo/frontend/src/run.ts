import express from 'express';
import morgan from 'morgan';
import path from 'path';

const PORT = Number(process.env?.PORT);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Parse Request body
app.use(express.json());

app.use(morgan('dev'));

// Serve Homepage
app.get('/', (req, res) => {
  res.render('home');
});

// Serve the checkout page
app.get('/checkout', (req, res) => {
  res.render('checkout', {
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    createPaymentIntentEndpoint: process.env.CREATE_PAYMENT_INTENT_ENDPOINT,
  });
});

// Serve the success page
app.get('/success', (req, res) => {
  res.render('success');
});

// Serve the cancel page
app.get('/cancel', (req, res) => {
  res.render('cancel');
});

app.listen(PORT, async () => {
  console.log(`App is up and running on port ${PORT}!`);
});
