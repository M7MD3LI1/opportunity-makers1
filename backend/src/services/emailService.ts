import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.APP_URL || "http://localhost:5173";
const FROM = process.env.SMTP_FROM || '"صناع الفرص" <no-reply@sana3alforsa.gov.eg>';

export async function sendApprovalEmail(opts: {
  to: string;
  name: string;
  username: string;
  password: string;
}): Promise<{ sent: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #680f67, #9c2e9b); padding: 40px 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.85; font-size: 14px; }
    .body { padding: 40px 32px; }
    .body p { color: #444; line-height: 1.8; font-size: 15px; }
    .credentials { background: #f8f0ff; border: 2px solid #680f67; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e8d5ff; }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { color: #888; font-size: 13px; font-weight: 600; }
    .cred-value { color: #680f67; font-size: 16px; font-weight: 700; font-family: monospace; }
    .btn { display: block; width: fit-content; margin: 32px auto 0; background: linear-gradient(135deg, #680f67, #9c2e9b); color: white; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; text-align: center; }
    .warning { background: #fff8e1; border-right: 4px solid #FFB300; padding: 16px; border-radius: 8px; margin: 24px 0; font-size: 13px; color: #555; }
    .footer { background: #fafafa; padding: 24px 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
    .org-logo { font-size: 48px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="org-logo">🏛️</div>
      <h1>صناع الفرص</h1>
      <p>وزارة الشباب والرياضة — منصة الإدارة الذكية</p>
    </div>
    <div class="body">
      <p>السلام عليكم ورحمة الله وبركاته،</p>
      <p>يسعدنا إبلاغك <strong>${opts.name}</strong> بأنه تمت <strong>الموافقة على طلب انضمامك</strong> إلى منصة صناع الفرص.</p>
      <p>فيما يلي بيانات تسجيل الدخول الخاصة بك:</p>
      
      <div class="credentials">
        <div class="cred-row">
          <span class="cred-label">اسم المستخدم</span>
          <span class="cred-value">${opts.username}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">كلمة المرور المؤقتة</span>
          <span class="cred-value">${opts.password}</span>
        </div>
      </div>

      <div class="warning">
        ⚠️ <strong>تنبيه أمني:</strong> يجب عليك تغيير كلمة المرور فور تسجيل الدخول الأول. هذه البيانات سرية ولا تشاركها مع أحد.
      </div>

      <a href="${APP_URL}/login" class="btn">تسجيل الدخول الآن →</a>
    </div>
    <div class="footer">
      <p>© 2026 صناع الفرص — وزارة الشباب والرياضة. جميع الحقوق محفوظة.</p>
      <p>إذا لم تقم بهذا الطلب، يرجى التواصل مع الإدارة فوراً.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: FROM,
      to: opts.to,
      subject: "✅ تم قبول طلبك — صناع الفرص",
      html,
    });
    return { sent: true };
  } catch (error: any) {
    console.error("Email send error:", error.message);
    return { sent: false, error: error.message };
  }
}

export async function sendRejectionEmail(opts: {
  to: string;
  name: string;
  reason?: string;
}): Promise<{ sent: boolean }> {
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; }
  .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
  .header { background: #c0392b; padding: 32px; text-align: center; color: white; }
  .body { padding: 32px; }
  .footer { background: #fafafa; padding: 16px; text-align: center; color: #999; font-size: 12px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>صناع الفرص</h1></div>
    <div class="body">
      <p>السلام عليكم ورحمة الله،</p>
      <p>نأسف لإبلاغك <strong>${opts.name}</strong> بأنه تم <strong>رفض طلب انضمامك</strong> إلى منصة صناع الفرص.</p>
      ${opts.reason ? `<p><strong>السبب:</strong> ${opts.reason}</p>` : ""}
      <p>يمكنك التواصل مع الإدارة لمزيد من التفاصيل.</p>
    </div>
    <div class="footer">© 2026 صناع الفرص — وزارة الشباب والرياضة</div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: FROM,
      to: opts.to,
      subject: "طلب الانضمام — صناع الفرص",
      html,
    });
    return { sent: true };
  } catch {
    return { sent: false };
  }
}
