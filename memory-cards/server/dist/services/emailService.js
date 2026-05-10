import nodemailer from 'nodemailer';
let transporter;
if (process.env.USE_REAL_EMAIL === 'true') {
    const emailUser = process.env.EMAIL_USER || 'delphia.farrell@ethereal.email';
    const emailPass = process.env.EMAIL_PASS || 'xWn9cT6wY4mP2qR8';
    if (emailUser.includes('@gmail.com')) {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
    }
    else {
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
    }
}
else {
    transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
    });
}
export async function sendEmail(to, subject, html) {
    try {
        const info = await transporter.sendMail({
            from: '"记忆卡片" <no-reply@memorycards.dev>',
            to,
            subject,
            html,
        });
        if (process.env.USE_REAL_EMAIL === 'true') {
            console.log('预览邮件:', nodemailer.getTestMessageUrl(info));
        }
        console.log('邮件发送成功:', info.messageId);
        return info;
    }
    catch (error) {
        console.error('邮件发送失败:', error);
        throw new Error('邮件发送失败，请稍后重试');
    }
}
export async function sendVerificationEmail(email, code, type) {
    const subject = type === 'register' ? '注册验证码' : '重置密码验证码';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🧠</div>
        <h2 style="color: #333;">记忆卡片</h2>
      </div>
      <p style="color: #666; line-height: 1.6;">您好！</p>
      <p style="color: #666; line-height: 1.6;">
        ${type === 'register' ? '感谢您注册记忆卡片！' : '您请求重置密码'}
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <span style="color: #fff; font-size: 24px; font-weight: bold; letter-spacing: 3px;">${code}</span>
        </div>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center;">
        验证码有效期5分钟，请尽快使用。如非本人操作，请忽略此邮件。
      </p>
    </div>
  `;
    return sendEmail(email, subject, html);
}
//# sourceMappingURL=emailService.js.map