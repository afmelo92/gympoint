import * as Yup from 'yup';

import Student from '../models/Student';
import HelpOrders from '../models/HelpOrders';

class HelpController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const student_id = parseInt(req.params.id, 10);

    const orders = await HelpOrders.findAll({
      attributes: ['id', 'question', 'answer', 'answer_at'],
      where: { student_id },
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
    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student_id = parseInt(req.params.id, 10);

    if (!student_id) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const { question } = req.body;
    const { createdAt } = await HelpOrders.create({
      student_id,
      question,
    });

    return res.json({
      question,
      createdAt,
    });
  }
}

export default new HelpController();
