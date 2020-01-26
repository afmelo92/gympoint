// import * as Yup from 'yup';
import { startOfDay, isBefore, parseISO, addMonths, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import numeral from 'numeral';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';

class RegistrationController {
  async store(req, res) {
    const { student_id, plan_id, start_date } = req.body;

    const checkStudent = await Student.findByPk(student_id);
    const studentName = checkStudent.name;
    const studentEmail = checkStudent.email;

    if (!checkStudent) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const checkPlan = await Plan.findByPk(plan_id);
    const planName = checkPlan.title;

    if (!checkPlan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    const dayStart = startOfDay(parseISO(start_date));

    if (isBefore(dayStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const endDate = addMonths(parseISO(start_date), checkPlan.duration);
    const formattedDate = format(endDate, "'dia' dd 'de' MMMM 'de' yyyy", {
      locale: pt,
    });
    const price = numeral(checkPlan.price * checkPlan.duration).format('0,00');

    try {
      const registration = await Registration.create({
        start_date,
        end_date: endDate,
        price,
        student_id,
        plan_id,
      });

      /**
       * await Notification.create({
        content: `Parabéns, ${studentName}! Você acaba de fazer sua matrícula na GymPoint.
        Segue abaixo o detalhamento:
        Plano: ${planName}
        Data de término: ${formattedDate}
        Price: R$${price}
        `,
        student: student_id,
      });
       */

      await Mail.sendMail({
        to: `${studentName} <${studentEmail}>`,
        subject: 'Sua matrícula foi efetuada',
        text: `Sua matrícula foi efetuada com sucesso no Plano ${planName}.
        A data de término será ${formattedDate} e o valor total é: ${price}!`,
      });

      return res.json(registration);
    } catch (error) {
      return res.json(error);
    }
  }
}

export default new RegistrationController();
