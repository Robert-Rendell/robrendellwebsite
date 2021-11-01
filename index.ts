import * as aws from 'aws-sdk';
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { homepage } from './src/pages/homepage';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
app.use(helmet());
// app.use(cors()); // Don't use CORS for now
app.use(morgan('combined'));
app.use(express.json());
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
app.get("/", homepage);