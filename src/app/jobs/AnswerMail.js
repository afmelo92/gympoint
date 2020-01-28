import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { student, question, created_at, answer, answer_at } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Sua pergunta foi respondida',
      template: 'answer',
      context: {
        student: student.name,
        question,
        created_at,
        answer,
        answer_at,
      },
    });
  }
}

export default new AnswerMail();
