import { startOfWeek, isThisWeek } from 'date-fns';

import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const student_id = parseInt(req.params.id, 10);

    const checkins = await Checkin.findAll({
      where: { student_id },
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const student_id = parseInt(req.params.id, 10);

    /**
     * Verify if checkin is at the same week
     */
    const weekStart = startOfWeek(new Date());
    const thisWeek = isThisWeek(weekStart);

    if (thisWeek) {
      const counter = await Checkin.findAndCountAll({ where: { student_id } });

      if (counter.count > 4) {
        return res.status(401).json({
          message: 'You reached the limit of checkins per week',
        });
      }
    }

    await Checkin.create({ student_id });
    return res.json({ message: 'Checkin ok!' });
  }
}

export default new CheckinController();
