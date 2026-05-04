import prisma from "../config/db";
import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });

interface AiInsight {
  type: "warning" | "suggestion" | "info" | "danger";
  title: string;
  message: string;
  action?: string;
  priority: number;
}

// Rule-based AI engine — analyzes real DB data
export async function generateUserInsights(userId: number): Promise<AiInsight[]> {
  const insights: AiInsight[] = [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tasks: { include: { task: true } },
      department: true,
    },
  });

  if (!user) return [];

  // Check overdue tasks
  const now = new Date();
  const overdueTasks = await prisma.task.findMany({
    where: {
      OR: [{ departmentId: null }, { departmentId: user.departmentId ?? undefined }],
      deadline: { lt: now },
    },
  });

  const submittedIds = user.tasks.map((s) => s.taskId);
  const pendingOverdue = overdueTasks.filter((t) => !submittedIds.includes(t.id));

  if (pendingOverdue.length > 0) {
    insights.push({
      type: "danger",
      title: "⚠️ مهام متأخرة",
      message: `لديك ${pendingOverdue.length} مهمة فات موعد تسليمها. يُنصح بتسليمها فوراً.`,
      action: "عرض المهام",
      priority: 1,
    });
  }

  // Check upcoming deadlines (within 48h)
  const soon = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const upcomingTasks = await prisma.task.findMany({
    where: {
      OR: [{ departmentId: null }, { departmentId: user.departmentId ?? undefined }],
      deadline: { gte: now, lte: soon },
    },
  });
  const pendingUpcoming = upcomingTasks.filter((t) => !submittedIds.includes(t.id));

  if (pendingUpcoming.length > 0) {
    insights.push({
      type: "warning",
      title: "⏰ مواعيد تسليم قريبة",
      message: `${pendingUpcoming.length} مهمة يقترب موعد تسليمها خلال 48 ساعة.`,
      action: "عرض المهام",
      priority: 2,
    });
  }

  // Performance suggestion
  if (user.score < 50) {
    insights.push({
      type: "suggestion",
      title: "📈 تحسين الأداء",
      message: "نسبة إنجازك أقل من المتوسط. حاول إنجاز المهام المعلقة لرفع درجتك.",
      priority: 3,
    });
  }

  if (user.score >= 80) {
    insights.push({
      type: "info",
      title: "🌟 أداء ممتاز",
      message: `أداؤك في المستوى الممتاز (${user.score}%). استمر في هذا التميز!`,
      priority: 4,
    });
  }

  // Inactivity check
  const daysSince = Math.floor(
    (Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince >= 3) {
    insights.push({
      type: "warning",
      title: "😴 تنبيه نشاط",
      message: `لم تكن نشطاً منذ ${daysSince} أيام. التفاعل المنتظم يرفع درجة المشاركة.`,
      priority: 2,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

export async function generateAdminInsights(): Promise<AiInsight[]> {
  const insights: AiInsight[] = [];

  // Users with no recent activity
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const inactiveUsers = await prisma.user.count({
    where: { status: "APPROVED", role: "USER", lastActive: { lt: cutoff } },
  });

  if (inactiveUsers > 0) {
    insights.push({
      type: "warning",
      title: "😴 أعضاء غير نشطين",
      message: `${inactiveUsers} عضو لم يكونوا نشطين خلال الأسبوع الماضي.`,
      priority: 1,
    });
  }

  // Pending users
  const pending = await prisma.user.count({ where: { status: "PENDING" } });
  if (pending > 0) {
    insights.push({
      type: "info",
      title: "📋 طلبات انتظار الموافقة",
      message: `${pending} طلب انضمام ينتظر مراجعتك.`,
      action: "مراجعة الطلبات",
      priority: 2,
    });
  }

  // Overdue tasks count
  const overdue = await prisma.task.count({
    where: { deadline: { lt: new Date() } },
  });
  if (overdue > 0) {
    insights.push({
      type: "warning",
      title: "⏰ مهام متأخرة",
      message: `${overdue} مهمة تجاوزت الموعد النهائي في النظام.`,
      priority: 2,
    });
  }

  // Department with lowest avg score
  const depts = await prisma.department.findMany({
    include: { users: { where: { status: "APPROVED" }, select: { score: true } } },
  });

  const deptScores = depts
    .map((d) => ({
      name: d.name,
      avg: d.users.length
        ? d.users.reduce((acc, u) => acc + u.score, 0) / d.users.length
        : 0,
    }))
    .filter((d) => d.avg > 0)
    .sort((a, b) => a.avg - b.avg);

  if (deptScores.length > 0 && deptScores[0].avg < 40) {
    insights.push({
      type: "danger",
      title: "📉 لجنة تحتاج دعم",
      message: `لجنة "${deptScores[0].name}" لديها متوسط أداء منخفض (${Math.round(deptScores[0].avg)}%).`,
      priority: 1,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

// Professional Gemini AI Chatbot
export async function processChatMessage(message: string, context: {
  userName: string;
  role: string;
  committeeId?: number;
  committeeName?: string;
  score: number;
  level: string;
}, history: { role: string; content: string }[] = []): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `أنت "المساعد الذكي الاحترافي" لمنصة "صناع الفرص"، خبير في تحليل الأداء وتطوير المتطوعين، بأسلوب يضاهي ChatGPT و DeepSeek.
          
          بيانات العضو الحالي:
          - الاسم: ${context.userName}
          - الدور: ${context.role}
          - اللجنة: ${context.committeeName}
          - الدرجة: ${context.score}/100
          - المستوى: ${context.level}
          
          إرشادات الرد الاحترافي:
          1. التحدث بلغة عربية فصحى عصرية ومهنية للغاية.
          2. تقديم إجابات مفصلة، تحليلية، ومنظمة (استخدم النقاط والقوائم عند الحاجة).
          3. لا تكتفِ بالإجابات السطحية؛ حلل درجة العضو وقدم خطة استراتيجية لتحسين أدائه بناءً على معايير المنصة.
          4. كن ملهماً ومحفزاً، وتعامل كأنك مستشار تطوير أعمال وخبير في إدارة الموارد البشرية.
          5. إذا سُئلت عن المهام، قدم نصائح حول إدارة الوقت، جودة التسليم، والابتكار في اللجنة.
          6. حافظ على دفء التعامل مع صرامة الاحترافية، واستخدم الإيموجي بذكاء وفي سياقه الصحيح.`
        },
        ...history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "لم أستطع معالجة الرسالة حالياً.";
  } catch (error: any) {
    console.error("Groq Error:", error);
    return "عذراً، أواجه مشكلة في الاتصال بذكائي الاصطناعي حالياً. حاول مرة أخرى لاحقاً!";
  }
}

export async function processPublicChatMessage(message: string, history: { role: string; content: string }[] = []): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `أنت "سفير صناع الفرص الذكي"، مساعد ودود ومهني للغاية متخصص في الرد على استفسارات الزوار حول العمل التطوعي ومنصتنا.
          
          أهدافك:
          1. شرح رؤية "صناع الفرص": منصة تطوعية تحت رعاية وزارة الشباب والرياضة تهدف لتمكين الشباب لسوق العمل.
          2. تحفيز الزوار على الانضمام للكيان من خلال شرح الفوائد (خبرة، علاقات، شهادات، تطوير مهارات).
          3. شرح لجان الكيان (HR, PR, OR, Training, Social Media) وكيف يمكن لكل لجنة أن تضيف لهم.
          4. الإجابة على الأسئلة العامة حول كيفية التسجيل والخطوات (تقديم، تقييم، مقابلة، محاكاة).
          
          إرشادات الرد:
          - استخدم لغة عربية بيضاء (فصيحة مبسطة) جذابة وملهمة.
          - كن ودوداً جداً ومشجعاً.
          - لا تذكر بيانات تقنية أو أرقام سرية.
          - استخدم الإيموجي بشكل مناسب (🚀, ✨, 🤝, 🌟).
          - إذا سألك أحد عن "محمد علي غانم"، أخبره أنه مؤسس المنصة وخبير الأمن السيبراني الذي صمم هذا النظام.`
        },
        ...history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "لم أستطع معالجة الرسالة حالياً.";
  } catch (error: any) {
    console.error("Public Groq Error:", error);
    return "عذراً، أواجه مشكلة في الاتصال حالياً. حاول مرة أخرى لاحقاً!";
  }
}
