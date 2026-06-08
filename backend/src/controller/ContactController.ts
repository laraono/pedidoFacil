import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { auditLog } from '../utils/logger';

export class ContactController {
  static async sendContactEmail(req: Request, res: Response) {
    const { nome, email, mensagem } = req.body;
    const safeName = String(nome).replace(/[\r\n]/g, '');
    const safeEmail = String(email).replace(/[\r\n]/g, '');

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST, 
        port: Number(process.env.MAIL_PORT), 
        secure: true, 
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${safeName}" <${safeEmail}>`,
        to: 'pedidofacilcontato@gmail.com', 
        replyTo: email, 
        subject: 'Novo Contato pelo Site - PedidoFácil',
        text: `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h3>Novo Contato Recebido</h3>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Mensagem:</strong><br/>${mensagem}</p>
          </div>
        `,
      });

      return res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
      auditLog('contact.failure', {
        nome,
        email,
        mensagem,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });

      return res.status(500).json({
        error: 'Erro interno ao processar a mensagem. Tente novamente mais tarde.',
      });
    }
  }
}