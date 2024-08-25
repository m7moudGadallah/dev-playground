import express from 'express';
import morgan from 'morgan';
import { sendEmail, MailData } from './send-email';

const PORT = Number(process.env.PORT);

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.post('/send-email', async (req, res) => {
  try {
    await sendEmail(req.body as MailData);
    res.status(200).send({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send email' });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
  });
});

app.listen(PORT, () => {
  console.log(`App is up and running on port ${PORT}!`);
});
