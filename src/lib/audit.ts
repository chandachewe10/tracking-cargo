import { prisma } from "@/lib/prisma";

interface AuditLogParams {
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  shipmentId?: string;
  details?: string;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        shipmentId: params.shipmentId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
