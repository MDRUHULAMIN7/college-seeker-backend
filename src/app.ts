import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import { UserRoutes } from './app/modules/user/user.routes.js';
import { CollegeRoutes } from './app/modules/college/college.routes.js';
import { AdmissionRoutes } from './app/modules/admission/admission.routes.js';
import { ReviewRoutes } from './app/modules/review/review.routes.js';
const app: Application = express();

//parser
app.use(express.json());
app.use(cors());

//application routes
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/college', CollegeRoutes);
app.use('/api/v1/admission', AdmissionRoutes);
app.use('/api/v1/review', ReviewRoutes);



const getAController = (req: Request, res: Response) => {
  res.send('College Seeker  Server is Running ....');
};

app.get('/', getAController);

export default app;
