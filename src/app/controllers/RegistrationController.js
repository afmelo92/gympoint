import * as Yup from 'yup';
import { startOfDay, isBefore, parseISO, addMonths, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';
// import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registrations = await Registration.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      order: ['start_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json({ registrations });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const checkRegistration = await Registration.findOne({
      where: { student_id },
    });

    if (checkRegistration) {
      return res.status(401).json({
        error: 'Registration already exists for this student',
      });
    }

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

    const formattedStartDate = format(
      dayStart,
      "'dia' dd 'de' MMMM 'de' yyyy",
      {
        locale: pt,
      }
    );

    const endDate = addMonths(parseISO(start_date), checkPlan.duration);
    const formattedEndDate = format(endDate, "'dia' dd 'de' MMMM 'de' yyyy", {
      locale: pt,
    });
    const price = (checkPlan.price * checkPlan.duration).toFixed(2);

    try {
      const registration = await Registration.create({
        start_date,
        end_date: endDate,
        price,
        student_id,
        plan_id,
      });

      /** Send notification to MongoDB
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
        template: 'creation',
        context: {
          student: studentName,
          plan: planName,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          price,
        },
      });

      return res.json(registration);
    } catch (error) {
      return res.json(error);
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { plan_id, start_date } = req.body;
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration does not exists' });
    }

    const dayStart = startOfDay(parseISO(start_date));

    if (isBefore(dayStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const checkPlan = await Plan.findByPk(plan_id);
    const planName = checkPlan.title;

    if (!checkPlan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    const endDate = addMonths(parseISO(start_date), checkPlan.duration);

    const price = (checkPlan.price * checkPlan.duration).toFixed(2);

    const { id } = await registration.update(req.body);

    return res.json({
      id,
      planName,
      start_date,
      endDate,
      price,
    });
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id, {
      attributes: ['id', 'start_date', 'end_date', 'price'],
      order: ['start_date'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!registration) {
      return res.status(400).json({ error: 'Registration does not exists' });
    }

    const student = await Student.findByPk(registration.student.id);

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Sua matrícula foi cancelada',
      template: 'cancellation',
      context: {
        student: student.name,
      },
    });

    // await registration.destroy();

    return res.json({ registration });
  }
}

export default new RegistrationController();
