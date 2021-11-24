import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import RateLimit from 'express-rate-limit';
import homepage from './src/pages/home/home.page';
import SudokuAPI from './src/pages/sudoku/sudoku.page';

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
// === Rate Limiting =======================
// only if you're behind a reverse proxy
// eg. (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
app.enable('trust proxy');
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// apply to all requests
app.use(limiter);
// =========================================

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// === Routes =========================================
app.get('/', homepage);
app.get(SudokuAPI.Routes.getSudoku, SudokuAPI.getSudoku);
app.post(SudokuAPI.Routes.postSudokuList, SudokuAPI.postSudokuList);
app.post(SudokuAPI.Routes.postSubmission, SudokuAPI.postSubmission);
app.post(SudokuAPI.Routes.postGenerateSudoku, SudokuAPI.generateSudoku);
app.post(SudokuAPI.Routes.postGenerateSudokuCallback, SudokuAPI.generateSudokuCallback);
