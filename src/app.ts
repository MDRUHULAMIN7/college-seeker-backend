import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import { StudentRoutes } from './app/modules/student/student.route.js';
const app: Application = express();

//parser
app.use(express.json());
app.use(cors());

//application routes

app.use('/api/v1/students', StudentRoutes);

const getAController = (req: Request, res: Response) => {
  res.send('Server is Running ....');
};

app.get('/', getAController);

export default app;
