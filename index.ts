import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import homepage from './src/pages/home/home.page';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

// Heroku exposes PORT env var by default
const PORT = process.env.PORT || 80;

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
app.get('/', homepage);
