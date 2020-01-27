import Mail from '../../lib/Mail';

class CreationMail {
  get key() {
    return 'CreationMail';
  }

  async handle({ data }) {
    const {
      studentName,
      studentEmail,
      planName,
      formattedEndDate,
      formattedStartDate,
      price,
    } = data;

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
  }
}

export default new CreationMail();
