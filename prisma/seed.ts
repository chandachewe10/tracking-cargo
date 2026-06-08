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

  // Create sample shipments (Zambian context)
  const shipments = [
    {
      trackingNumber: "TRK-SAMPLE-0001",
      description: "Electronics – Laptop, tablet and accessories",
      weight: 3.5,
      senderName: "TechMart Zambia Ltd",
      senderPhone: "+260 977 123 456",
      senderEmail: "dispatch@techmart.co.zm",
      receiverName: "Chanda Bwalya",
      receiverPhone: "+260 966 234 567",
      receiverEmail: "chanda.bwalya@email.com",
      originLocation: "Lusaka City Market, Lusaka",
      destinationLocation: "Kitwe CBD, Kitwe",
      currentLocation: "Ndola Sorting Hub",
      status: "OUT_FOR_DELIVERY",
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      trackingNumber: "TRK-SAMPLE-0002",
      description: "Clothing – Assorted garments and fabric",
      weight: 5.0,
      senderName: "Fashion Hub Zambia",
      senderPhone: "+260 955 345 678",
      senderEmail: "orders@fashionhub.co.zm",
      receiverName: "Mutale Phiri",
      receiverPhone: "+260 977 456 789",
      receiverEmail: "mutale.phiri@email.com",
      originLocation: "Industrial Area, Lusaka",
      destinationLocation: "Livingstone City, Livingstone",
      currentLocation: "Livingstone Distribution Hub",
      status: "DELIVERED",
      expectedDeliveryDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      trackingNumber: "TRK-SAMPLE-0003",
      description: "Medical Supplies – Pharmaceuticals and equipment",
      weight: 2.0,
      senderName: "PharmaCare Zambia",
      senderPhone: "+260 966 567 890",
      receiverName: "Ndola General Hospital",
      receiverPhone: "+260 212 610 000",
      originLocation: "Cairo Road, Lusaka",
      destinationLocation: "Ndola Teaching Hospital, Ndola",
      currentLocation: "Kabwe Checkpoint",
      status: "IN_TRANSIT",
      expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      trackingNumber: "TRK-SAMPLE-0004",
      description: "Agricultural produce – Maize and seed stock",
      weight: 50.0,
      senderName: "Zambia Co-operative Farmers",
      senderPhone: "+260 955 678 901",
      receiverName: "Chingola Fresh Market",
      receiverPhone: "+260 212 311 000",
      originLocation: "Chipata Agricultural Hub, Chipata",
      destinationLocation: "Chingola Town, Chingola",
      currentLocation: "Lusaka Freight Depot",
      status: "DISPATCHED",
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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

      // Build tracking history with intermediate Zambian stops
      const historyItems: {
        status: string;
        location: string;
        description: string;
        timestamp: Date;
      }[] = [
        {
          status: "PENDING",
          location: rest.originLocation,
          description: "Shipment registered and awaiting pickup",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          status: "RECEIVED",
          location: rest.originLocation,
          description: "Package received, verified and logged at origin facility",
          timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
        },
        {
          status: "DISPATCHED",
          location: rest.originLocation,
          description: "Package dispatched from origin — en route",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];

      // Add intermediate stops for Lusaka → Kitwe route
      if (rest.trackingNumber === "TRK-SAMPLE-0001") {
        historyItems.push(
          {
            status: "IN_TRANSIT",
            location: "Kabwe Bus Terminal, Kabwe",
            description: "Item passed through Kabwe checkpoint — on schedule",
            timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
          },
          {
            status: "IN_TRANSIT",
            location: "Kapiri Mposhi Junction, Kapiri Mposhi",
            description: "Item passed through Kapiri Mposhi junction",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            status: "AT_HUB",
            location: "Ndola Sorting Hub, Ndola",
            description: "Arrived at Ndola sorting hub — preparing for final delivery",
            timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
          },
          {
            status: "OUT_FOR_DELIVERY",
            location: "Ndola Sorting Hub, Ndola",
            description: "Out for delivery to Kitwe CBD",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          }
        );
      } else if (rest.status !== "PENDING" && rest.status !== "RECEIVED" && rest.status !== "DISPATCHED") {
        historyItems.push({
          status: "IN_TRANSIT",
          location: rest.currentLocation,
          description: "Package in transit to destination",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        });
      }

      if (rest.status === "DELIVERED") {
        historyItems.push(
          {
            status: "AT_HUB",
            location: rest.currentLocation,
            description: "Arrived at destination hub for final sorting",
            timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
          },
          {
            status: "DELIVERED",
            location: rest.destinationLocation,
            description: "Package successfully delivered to recipient — signature obtained",
            timestamp: deliveredAt || new Date(),
          }
        );
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
