import * as Yup from 'yup';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import HelpOrders from '../models/HelpOrders';
import Student from '../models/Student';

import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';

class AnswerController {
  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const helpOrder = await HelpOrders.findByPk(req.params.id, {
      attributes: ['id', 'question', 'answer', 'answer_at', 'createdAt'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!helpOrder) {
      return res.status(401).json({ error: 'Help order does not exists' });
    }

    const order = await helpOrder.update({
      answer: req.body.answer,
      answer_at: new Date(),
    });

    await Queue.add(AnswerMail.key, {
      student: helpOrder.student,
      question: order.question,
      created_at: format(order.createdAt, "dd 'de' MMMM 'de' yyyy", {
        locale: pt,
      }),
      answer: order.answer,
      answer_at: format(order.answer_at, "dd 'de' MMMM 'de' yyyy", {
        locale: pt,
      }),
    });

    return res.json(order);
  }
}

export default new AnswerController();
