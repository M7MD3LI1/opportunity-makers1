import { Request, Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";

// Get all departments (Public)
export const getDepartments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ departments });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Create department (Admin)
export const createDepartment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, headName, viceName } = req.body;

    if (!name || !headName || !viceName) {
      res.status(400).json({ message: "Department name, head name, and vice name are required." });
      return;
    }

    // Check if department name already exists
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      res.status(409).json({ message: "A department with this name already exists." });
      return;
    }

    const department = await prisma.department.create({
      data: { name, headName, viceName },
    });

    res.status(201).json({
      message: "Department created successfully.",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update department (Admin)
export const updateDepartment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, headName, viceName } = req.body;

    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
    });

    if (!department) {
      res.status(404).json({ message: "Department not found." });
      return;
    }

    // Check for duplicate name (if changing name)
    if (name && name !== department.name) {
      const existing = await prisma.department.findUnique({ where: { name } });
      if (existing) {
        res.status(409).json({ message: "A department with this name already exists." });
        return;
      }
    }

    const updated = await prisma.department.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(headName && { headName }),
        ...(viceName && { viceName }),
      },
    });

    res.json({ message: "Department updated successfully.", department: updated });
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delete department (Admin)
export const deleteDepartment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
    });

    if (!department) {
      res.status(404).json({ message: "Department not found." });
      return;
    }

    await prisma.department.delete({ where: { id: Number(id) } });

    res.json({ message: "Department deleted successfully." });
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
