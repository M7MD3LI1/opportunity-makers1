import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";

export const requestDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { type, purpose, title, titleAr } = req.body;

    const document = await prisma.officialDocument.create({
      data: {
        userId: Number(userId),
        type,
        purpose,
        title,
        titleAr,
        referenceNo: uuidv4(),
      }
    });

    res.status(201).json({ message: "تم تقديم طلب المستند بنجاح", document });
  } catch (error) {
    console.error("Request document error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const getMyDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const documents = await prisma.officialDocument.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" }
    });
    res.json({ documents });
  } catch (error) {
    console.error("Get my documents error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const getPendingDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const documents = await prisma.officialDocument.findMany({
      where: { documentUrl: null },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json({ documents });
  } catch (error) {
    console.error("Get pending documents error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const generateDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, documentUrl, issuedBy } = req.body;

    const document = await prisma.officialDocument.update({
      where: { id: Number(id) },
      data: {
        content: content ? JSON.stringify(content) : null,
        documentUrl,
        issuedBy
      }
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: document.userId,
        title: "📄 مستند رسمي جاهز",
        message: `تم إصدار ${document.titleAr}. يمكنك تحميله الآن من ملفك الشخصي.`,
        type: "SUCCESS"
      }
    });

    res.json({ message: "تم إصدار المستند بنجاح", document });
  } catch (error) {
    console.error("Generate document error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};
