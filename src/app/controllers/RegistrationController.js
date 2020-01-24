import * as Yup from 'yup';
import { startOfHour, isBefore, parseISO, addMonths } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';
import User from '../models/User';

class RegistrationController {
  async store(req, res) {
    const { student_id, plan_id, start_date } = req.body;

    const checkStudent = await Student.findOne({
      where: { id: student_id },
    });

    if (!checkStudent) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const checkPlan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!checkPlan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    const hourStart = startOfHour(parseISO(start_date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const endDate = addMonths(parseISO(start_date), checkPlan.duration);
    const price = checkPlan.price * checkPlan.duration;

    try {
      const registration = await Registration.create({
        start_date,
        end_date: endDate,
        price,
        student_id,
        plan_id,
      });

      return res.json(registration);
    } catch (error) {
      return res.json(error);
    }
  }
}

export default new RegistrationController();
