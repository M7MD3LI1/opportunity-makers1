import prisma from "../config/db";

export async function logActivity(opts: {
  userId?: number;
  action: string;
  details?: string;
  ip?: string;
  severity?: "INFO" | "WARNING" | "DANGER";
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        details: opts.details,
        ip: opts.ip,
        severity: opts.severity || "INFO",
      },
    });
  } catch (e) {
    console.error("ActivityLog error:", e);
  }
}

export async function detectAnomaly(opts: {
  userId: number;
  ip: string;
  lastIp?: string | null;
}): Promise<boolean> {
  // Simple anomaly: IP changed significantly
  if (opts.lastIp && opts.lastIp !== opts.ip) {
    const lastPrefix = opts.lastIp.split(".").slice(0, 2).join(".");
    const currPrefix = opts.ip.split(".").slice(0, 2).join(".");
    if (lastPrefix !== currPrefix) {
      await logActivity({
        userId: opts.userId,
        action: "SUSPICIOUS_LOGIN",
        details: `IP changed from ${opts.lastIp} to ${opts.ip}`,
        ip: opts.ip,
        severity: "WARNING",
      });

      // Notify admins
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "⚠️ تنبيه أمني",
            message: `تسجيل دخول من IP مختلف للمستخدم ID: ${opts.userId}`,
            type: "SECURITY",
          },
        });
      }
      return true;
    }
  }
  return false;
}

export async function checkBruteForce(userId: number): Promise<{
  locked: boolean;
  remainingMinutes?: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true, lockedUntil: true },
  });

  if (!user) return { locked: false };

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMs = user.lockedUntil.getTime() - Date.now();
    return { locked: true, remainingMinutes: Math.ceil(remainingMs / 60000) };
  }

  return { locked: false };
}

export async function recordFailedLogin(userId: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true },
  });

  const attempts = (user?.loginAttempts ?? 0) + 1;
  const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

  await prisma.user.update({
    where: { id: userId },
    data: { loginAttempts: attempts, ...(lockedUntil && { lockedUntil }) },
  });
}

export async function resetLoginAttempts(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { loginAttempts: 0, lockedUntil: null },
  });
}
