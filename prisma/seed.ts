import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@trackit.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@trackit.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user:", admin.email);

  // Create sample shipments
  const shipments = [
    {
      trackingNumber: "TRK-SAMPLE-0001",
      description: "Electronics - Laptop and accessories",
      weight: 3.5,
      senderName: "TechMart Kenya",
      senderPhone: "+254 700 123 456",
      senderEmail: "dispatch@techmart.co.ke",
      receiverName: "John Mwangi",
      receiverPhone: "+254 711 234 567",
      receiverEmail: "john.mwangi@email.com",
      originLocation: "Mombasa Port, Kenya",
      destinationLocation: "Nairobi CBD, Kenya",
      currentLocation: "Nairobi Sorting Facility",
      status: "OUT_FOR_DELIVERY",
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      trackingNumber: "TRK-SAMPLE-0002",
      description: "Clothing - Assorted garments",
      weight: 5.0,
      senderName: "Fashion Hub Ltd",
      senderPhone: "+254 722 345 678",
      senderEmail: "orders@fashionhub.co.ke",
      receiverName: "Sarah Kamau",
      receiverPhone: "+254 733 456 789",
      receiverEmail: "sarah.kamau@email.com",
      originLocation: "Nairobi Industrial Area",
      destinationLocation: "Kisumu City, Kenya",
      currentLocation: "Kisumu Distribution Hub",
      status: "DELIVERED",
      expectedDeliveryDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      trackingNumber: "TRK-SAMPLE-0003",
      description: "Medical Supplies - Pharmaceuticals",
      weight: 2.0,
      senderName: "PharmaCare Ltd",
      senderPhone: "+254 744 567 890",
      receiverName: "Nakuru General Hospital",
      receiverPhone: "+254 755 678 901",
      originLocation: "Nairobi Westlands",
      destinationLocation: "Nakuru, Kenya",
      currentLocation: "Nakuru, Kenya",
      status: "IN_TRANSIT",
      expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const shipmentData of shipments) {
    const { deliveredAt, ...rest } = shipmentData as typeof shipmentData & { deliveredAt?: Date };
    const existing = await prisma.shipment.findUnique({
      where: { trackingNumber: rest.trackingNumber },
    });
    
    if (!existing) {
      const shipment = await prisma.shipment.create({
        data: {
          ...rest,
          ...(deliveredAt ? { deliveredAt } : {}),
        },
      });

      // Add tracking history
      const historyItems = [
        {
          status: "PENDING",
          location: rest.originLocation,
          description: "Shipment registered in system",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          status: "RECEIVED",
          location: rest.originLocation,
          description: "Package received and verified at origin facility",
          timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
        },
        {
          status: "DISPATCHED",
          location: rest.originLocation,
          description: "Package dispatched from origin",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];

      if (rest.status !== "PENDING" && rest.status !== "RECEIVED") {
        historyItems.push({
          status: "IN_TRANSIT",
          location: "En Route",
          description: "Package in transit to destination",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        });
      }

      if (rest.status === "OUT_FOR_DELIVERY" || rest.status === "DELIVERED") {
        historyItems.push({
          status: "AT_HUB",
          location: rest.currentLocation,
          description: "Arrived at destination hub",
          timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
        });
      }

      if (rest.status === "DELIVERED") {
        historyItems.push({
          status: "DELIVERED",
          location: rest.destinationLocation,
          description: "Package successfully delivered to recipient",
          timestamp: deliveredAt || new Date(),
        });
      } else if (rest.status === "OUT_FOR_DELIVERY") {
        historyItems.push({
          status: "OUT_FOR_DELIVERY",
          location: rest.currentLocation,
          description: "Package out for delivery",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        });
      }

      for (const item of historyItems) {
        await prisma.trackingHistory.create({
          data: {
            shipmentId: shipment.id,
            ...item,
            updatedById: admin.id,
          },
        });
      }

      console.log(`Created shipment: ${rest.trackingNumber}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
