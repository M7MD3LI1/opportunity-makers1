import { Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { logActivity } from "../services/securityService";

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, email, phone, currentPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.password) {
      res.status(404).json({ message: "المستخدم غير موجود." });
      return;
    }

    // Require current password for sensitive changes
    if (!currentPassword) {
      res.status(400).json({ message: "يجب إدخال كلمة المرور الحالية لتأكيد التعديلات." });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة." });
      return;
    }

    const updateData: any = {};

    // Name update
    if (name && name.trim() !== user.name) {
      updateData.name = name.trim().replace(/[<>"']/g, "");
    }

    // Phone update
    if (phone !== undefined && phone.trim() !== user.phone) {
      updateData.phone = phone.trim().replace(/[<>"']/g, "");
    }

    // Email update with uniqueness check
    if (email && email.toLowerCase() !== user.email) {
      const cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        res.status(400).json({ message: "صيغة البريد الإلكتروني غير صحيحة." });
        return;
      }
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        res.status(409).json({ message: "هذا البريد الإلكتروني مستخدم بالفعل." });
        return;
      }
      updateData.email = cleanEmail;
    }

    if (Object.keys(updateData).length === 0) {
      res.json({ message: "لا توجد تغييرات." });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
    });

    await logActivity({
      userId: Number(userId),
      action: "PROFILE_UPDATED",
      details: `Updated: ${Object.keys(updateData).join(", ")}`,
      severity: "INFO",
    });

    res.json({
      message: "تم تحديث البيانات بنجاح.",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        profilePicture: updated.profilePicture,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const updateProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    if (!req.file) {
      res.status(400).json({ message: "لا يوجد ملف صورة." });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { profilePicture: url },
    });
    res.json({ message: "تم تحديث الصورة الشخصية.", profilePicture: url });
  } catch (error) {
    console.error("Update profile picture error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "كلمة المرور الحالية والجديدة مطلوبتان." });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." });
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      res.status(400).json({ message: "كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.password) {
      res.status(404).json({ message: "المستخدم غير موجود." });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة." });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashed, mustChangePassword: false },
    });

    await logActivity({ userId: Number(userId), action: "PASSWORD_CHANGED", severity: "INFO" });

    res.json({ message: "تم تغيير كلمة المرور بنجاح." });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};
