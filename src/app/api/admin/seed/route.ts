import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Only run if no users exist
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      return NextResponse.json(
        { message: "Database already seeded" },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);

    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@luxshipcargo.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json(
      { message: "Admin user created successfully", email: "admin@luxshipcargo.com", password: "admin123" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
