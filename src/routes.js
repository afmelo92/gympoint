import { Router } from 'express';

import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelpController from './app/controllers/HelpController';
import AnswerController from './app/controllers/AnswerController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/session', SessionController.store);

routes.get('/students/:id/checkin', CheckinController.index);
routes.post('/students/:id/checkin', CheckinController.store);

routes.get('/students/:id/help-orders', HelpController.index);
routes.post('/students/:id/help-orders', HelpController.store);

routes.use(authMiddleware);

routes.post('/students', StudentController.store);
routes.put('/students', StudentController.update);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.get('/registration', RegistrationController.index);
routes.post('/registration', RegistrationController.store);
routes.put('/registration/:id', RegistrationController.update);
routes.delete('/registration/:id', RegistrationController.delete);

routes.put('/help-orders/:id/answer', AnswerController.update);

export default routes;
