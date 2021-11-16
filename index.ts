import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
app.get('/', homepage);
app.get('/sudoku/:sudokuId', SudokuAPI.getSudoku);
app.post('/sudoku/submit', SudokuAPI.postSubmission);
