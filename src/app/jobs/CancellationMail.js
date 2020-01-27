import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { student } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Sua matrícula foi cancelada',
      template: 'cancellation',
      context: {
        student: student.name,
      },
    });
  }
}

export default new CancellationMail();
