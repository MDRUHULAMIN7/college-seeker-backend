import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import { UserRoutes } from './app/modules/user/user.routes.js';
import { ReviewRoutes } from './app/modules/review/review.routes.js';
import { GenreRoutes } from './app/modules/genre/genre.routes.js';
import { BookRoutes } from './app/modules/book/book.routes.js';
import { LibraryRoutes } from './app/modules/library/library.routes.js';
const app: Application = express();

//parser
app.use(express.json());
app.use(cors());

//application routes
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/review', ReviewRoutes);
app.use('/api/v1/genre', GenreRoutes);
app.use('/api/v1/book', BookRoutes);
app.use('/api/v1/library', LibraryRoutes);



const getAController = (req: Request, res: Response) => {
  res.send('College Seeker  Server is Running ....');
};

app.get('/', getAController);

export default app;
