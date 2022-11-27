import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import RateLimit from 'express-rate-limit';
import { HomePage } from './src/pages/home/home.page';
import SudokuAPI from './src/pages/sudoku/sudoku.page';
import TechTestUniDataAPI from './src/pages/technical-tests/uni-data-291121/uni-data-291121.page';
import { NatureRouting } from './src/pages/photos-ive-taken/nature/nature.routing';
import { WildFlowersPage } from './src/pages/photos-ive-taken/nature/pages/wild-flowers.page';
import { ArachnidsPage } from './src/pages/photos-ive-taken/nature/pages/arachnids.page';
import { InsectsPage } from './src/pages/photos-ive-taken/nature/pages/insects.page';
import { LichenPage } from './src/pages/photos-ive-taken/nature/pages/lichen.page';
import { FungiPage } from './src/pages/photos-ive-taken/nature/pages/fungi.page';
import { ConfigService } from './src/services/config.service';
import { SavePageView } from './src/common/view-page.endpoint';

config();
// Heroku exposes PORT env var by default
const PORT = process.env.PORT || ConfigService.Port || 80;

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
app.get('/', HomePage);

app.post('/view-page', SavePageView);

app.get(NatureRouting.WildFlowers, WildFlowersPage);
app.get(NatureRouting.Arachnids, ArachnidsPage);
app.get(NatureRouting.Insects, InsectsPage);
app.get(NatureRouting.Lichen, LichenPage);
app.get(NatureRouting.Fungi, FungiPage);

app.get(SudokuAPI.Routes.getSudoku, SudokuAPI.getSudoku);
app.get(SudokuAPI.Routes.getSudokuLeaderboard, SudokuAPI.getSudokuLeaderboard);
app.post(SudokuAPI.Routes.postSudokuList, SudokuAPI.postSudokuList);
app.post(SudokuAPI.Routes.postSubmission, SudokuAPI.postSubmission);
app.post(SudokuAPI.Routes.postGenerateSudoku, SudokuAPI.generateSudoku);
app.post(SudokuAPI.Routes.postGenerateSudokuCallback, SudokuAPI.generateSudokuCallback);

app.get(TechTestUniDataAPI.Routes.getDashboardGraphs, TechTestUniDataAPI.getDashboardGraphs);
