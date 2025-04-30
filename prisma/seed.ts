const adminPermissions = [
  // Dashboard
  "dashboard.create",
  "dashboard.read",
  "dashboard.update",
  "dashboard.delete",

  // User Management
  "users.create",
  "users.read",
  "users.update",
  "users.delete",
  "roles.create",
  "roles.read",
  "roles.update",
  "roles.delete",

  // Inventory Management
  "inventory.read",
  "items.create",
  "items.read",
  "items.update",
  "items.delete",
  "categories.create",
  "categories.read",
  "categories.update",
  "categories.delete",
  "brands.create",
  "brands.read",
  "brands.update",
  "brands.delete",
  "units.create",
  "units.read",
  "units.update",
  "units.delete",
  "stock.create",
  "stock.read",
  "stock.update",
  "stock.delete",
  "serial.numbers.create",
  "serial.numbers.read",
  "serial.numbers.update",
  "serial.numbers.delete",
  "transfers.create",
  "transfers.read",
  "transfers.update",
  "transfers.delete",
  "adjustments.create",
  "adjustments.read",
  "adjustments.update",
  "adjustments.delete",

  // Purchases
  "purchase.orders.create",
  "purchase.orders.read",
  "purchase.orders.update",
  "purchase.orders.delete",
  "goods.receipts.create",
  "goods.receipts.read",
  "goods.receipts.update",
  "goods.receipts.delete",
  "suppliers.create",
  "suppliers.read",
  "suppliers.update",
  "suppliers.delete",

  // Sales
  "sales.create",
  "sales.read",
  "sales.update",
  "sales.delete",
  "sales.orders.create",
  "sales.orders.read",
  "sales.orders.update",
  "sales.orders.delete",
  "pos.create",
  "pos.access",
  "pos.update",
  "pos.delete",
  "returns.create",
  "returns.read",
  "returns.update",
  "returns.delete",
  "customers.create",
  "customers.read",
  "customers.update",
  "customers.delete",

  // Reports
  "reports.create",
  "reports.read",
  "reports.update",
  "reports.delete",
  "reports.inventory.create",
  "reports.inventory.read",
  "reports.inventory.update",
  "reports.inventory.delete",
  "reports.purchases.create",
  "reports.purchases.read",
  "reports.purchases.update",
  "reports.purchases.delete",
  "reports.sales.create",
  "reports.sales.read",
  "reports.sales.update",
  "reports.sales.delete",
  "reports.products.create",
  "reports.products.read",
  "reports.products.update",
  "reports.products.delete",

  // Integrations
  "integrations.create",
  "integrations.access",
  "integrations.update",
  "integrations.delete",
  "integrations.pos.create",
  "integrations.pos.access",
  "integrations.pos.update",
  "integrations.pos.delete",
  "integrations.accounting.create",
  "integrations.accounting.access",
  "integrations.accounting.update",
  "integrations.accounting.delete",
  "integrations.api.create",
  "integrations.api.access",
  "integrations.api.update",
  "integrations.api.delete",

  // Settings
  "settings.create",
  "settings.access",
  "settings.update",
  "settings.delete",
  "locations.create",
  "locations.read",
  "locations.update",
  "locations.delete",
  "company.settings.create",
  "company.settings.access",
  "company.settings.update",
  "company.settings.delete",
  "profile.create",
  "profile.read",
  "profile.update",
  "profile.delete",
  "password.create",
  "password.read",
  "password.change",
  "password.delete",

  // Legacy permissions kept for backward compatibility

  "orders.create",
  "orders.read",
  "orders.update",
  "orders.delete",
];

const userPermissions = [
  // Basic user permissions
  "dashboard.read",
  "profile.read",
  "profile.update",
  "password.change",

  // Inventory view access
  "items.read",
  "categories.read",
  "brands.read",
  "units.read",
  "stock.read",

  // Basic sales capabilities
  "sales.orders.read",
  "sales.orders.create",
  "pos.access",
  "customers.read",

  // Legacy permissions for backward compatibility
  "products.read",
  "orders.read",
  "orders.create",
];

const managerPermissions = [
  // All user permissions
  ...userPermissions,

  // Additional management permissions
  "users.read",
  "inventory.read",
  "items.create",
  "items.update",
  "stock.update",
  "transfers.create",
  "transfers.read",
  "transfers.update",
  "purchase.orders.create",
  "purchase.orders.read",
  "purchase.orders.update",
  "goods.receipts.create",
  "goods.receipts.read",
  "suppliers.read",
  "sales.read",
  "sales.update",
  "sales.orders.update",
  "customers.create",
  "customers.update",
  "reports.read",
  "adjustments.create",
  "adjustments.read",
];
import { db } from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const generateApiKey = (): string => {
  const rand = crypto.randomBytes(32).toString("hex");
  return `sk_live_${rand}`;
};
function generateSlug(title: string): string {
  // Convert title to lowercase and replace spaces with dashes
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  // Remove special characters except for dashes
  const cleanedSlug = slug.replace(/[^\w\-]/g, "");

  return cleanedSlug;
}

// Get current year for password generation
const currentYear = new Date().getFullYear();

// Define user role permissions (basic access)

async function cleanDatabase() {
  console.log("Cleaning up existing data...");
  try {
    // Use a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      // Get all users
      const users = await tx.user.findMany({
        include: {
          roles: true,
        },
      });
      // Disconnect all roles from users
      for (const user of users) {
        if (user.roles.length > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              roles: {
                disconnect: user.roles.map((role) => ({ id: role.id })),
              },
            },
          });
        }
      }

      // Delete transaction data first
      await tx.adjustmentLine.deleteMany({});
      await tx.adjustment.deleteMany({});
      await tx.transferLine.deleteMany({});
      await tx.transfer.deleteMany({});
      await tx.salesOrderLine.deleteMany({});
      await tx.salesOrder.deleteMany({});
      await tx.customer.deleteMany({});
      await tx.goodsReceiptLine.deleteMany({});
      await tx.goodsReceipt.deleteMany({});
      await tx.purchaseOrderLine.deleteMany({});
      await tx.purchaseOrder.deleteMany({});

      // Delete inventory data
      await tx.serialNumber.deleteMany({});
      await tx.inventory.deleteMany({});

      // Delete master data
      await tx.itemSupplier.deleteMany({});
      await tx.apiKey.deleteMany({});
      await tx.category.deleteMany({});
      await tx.brand.deleteMany({});
      await tx.unit.deleteMany({});
      await tx.supplier.deleteMany({});
      await tx.taxRate.deleteMany({});
      await tx.item.deleteMany({});
      await tx.location.deleteMany({});
      await tx.organisation.deleteMany({});

      // Delete session data
      await tx.session.deleteMany({});
      await tx.account.deleteMany({});

      // Now safely delete all users
      const deleteUsers = await tx.user.deleteMany({});
      console.log("Deleted users:", deleteUsers.count);

      // Finally delete all roles
      const deleteRoles = await tx.role.deleteMany({});
      console.log("Deleted roles:", deleteRoles.count);
    });

    console.log("Database cleanup completed.");
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log("Starting to seed new data...");

    // Create Organisation
    const org = await db.organisation.create({
      data: {
        name: "Default Organisation",
        slug: "default-organisation",
        industry: "Retail",
        country: "United States",
        state: "California",
        address: "123 Main St, San Francisco, CA 94105",
        currency: "USD",
        timezone: "America/Los_Angeles",
        inventoryStartDate: new Date(),
        fiscalYear: "January-December",
      },
    });
    console.log(`Created organisation: ${org.name}`);
    // Create the Default API Key
    await db.apiKey.create({
      data: {
        name: "Default Key",
        key: generateApiKey(),
        orgId: org.id,
      },
    });
    // Create admin role with all permissions
    console.log("Created API Key...");

    console.log("Creating roles...");

    const adminRole = await db.role.create({
      data: {
        displayName: "Administrator",
        roleName: "admin",
        description: "Full system access",
        permissions: adminPermissions,
        orgId: org.id,
      },
    });
    const managerRole = await db.role.create({
      data: {
        displayName: "Manager",
        roleName: "manager",
        description:
          "Management access with limited administrative capabilities",
        permissions: managerPermissions,
        orgId: org.id,
      },
    });

    // Create user role with limited permissions
    const userRole = await db.role.create({
      data: {
        displayName: "User",
        roleName: "user",
        description: "Basic user access",
        permissions: userPermissions,
        orgId: org.id,
      },
    });
    console.log(
      `Created roles: ${adminRole.displayName}, ${managerRole.displayName}, ${userRole.displayName}`
    );
    // Create locations
    console.log("Creating locations...");
    const locations = await Promise.all([
      db.location.create({
        data: {
          name: "Main Warehouse",
          type: "WAREHOUSE",
          address: "456 Warehouse Blvd, San Francisco, CA 94105",
          phone: "+1-555-123-4567",
          email: "warehouse@example.com",
          orgId: org.id,
        },
      }),
      db.location.create({
        data: {
          name: "Downtown Store",
          type: "SHOP",
          address: "789 Retail St, San Francisco, CA 94105",
          phone: "+1-555-987-6543",
          email: "downtown@example.com",
          orgId: org.id,
        },
      }),
      db.location.create({
        data: {
          name: "Online Store",
          type: "VIRTUAL",
          orgId: org.id,
        },
      }),
    ]);
    console.log(`Created ${locations.length} locations`);
    // Create admin user
    console.log("Creating users...");
    const adminPassword = `Admin@${currentYear}`;
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const managerPassword = `Manager@${currentYear}`;
    const hashedManagerPassword = await bcrypt.hash(managerPassword, 10);
    const userPassword = `User@${currentYear}`;
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);

    const adminUser = await db.user.create({
      data: {
        email: "admin@admin.com",
        name: "System Admin",
        firstName: "System",
        lastName: "Admin",
        phone: "1234567890",
        isVerfied: true,
        orgName: org.name,
        password: hashedAdminPassword,
        orgId: org.id,
        locationId: locations[0].id,
        locationName: locations[0].name,
        roles: {
          connect: { id: adminRole.id },
        },
      },
    });

    const managerUser = await db.user.create({
      data: {
        email: "manager@example.com",
        name: "Store Manager",
        firstName: "Store",
        lastName: "Manager",
        phone: "2345678901",
        isVerfied: true,
        orgName: org.name,
        password: hashedManagerPassword,
        orgId: org.id,
        locationId: locations[1].id,
        locationName: locations[1].name,
        roles: {
          connect: { id: managerRole.id },
        },
      },
    });

    const regularUser = await db.user.create({
      data: {
        email: "user@user.com",
        name: "Regular User",
        firstName: "Regular",
        lastName: "User",
        phone: "0987654321",
        orgName: org.name,
        isVerfied: true,
        password: hashedUserPassword,
        orgId: org.id,
        locationId: locations[1].id,
        locationName: locations[1].name,
        roles: {
          connect: { id: userRole.id },
        },
      },
    });

    // Create brands
    const brands = await Promise.all(
      ["Apple", "Samsung", "Sony", "LG", "Dell"].map((name) =>
        db.brand.create({
          data: {
            name,
            slug: name.toLowerCase().replace(/\s+/g, "-"),
            orgId: org.id,
          },
        })
      )
    );
    console.log(`Created ${brands.length} brands`);

    // Create categories
    const categories = await Promise.all(
      [
        {
          title: "Electronics",
          slug: "electronics",
          description: "Electronic devices and accessories",
        },
        {
          title: "Computers",
          slug: "computers",
          description: "Desktop and laptop computers",
        },
        {
          title: "Phones",
          slug: "phones",
          description: "Mobile phones and accessories",
        },
        {
          title: "TVs",
          slug: "tvs",
          description: "Television sets",
        },
        {
          title: "Audio",
          slug: "audio",
          description: "Audio equipment",
        },
      ].map((category) =>
        db.category.create({
          data: {
            ...category,
            orgId: org.id,
            imageUrl:
              "https://14j7oh8kso.ufs.sh/f/HLxTbDBCDLwf0VMPklPtvnF3cx4uPCTU9aqg2f0oY8klybGQ",
          },
        })
      )
    );
    console.log(`Created ${categories.length} categories`);

    // Create units
    const units = await Promise.all(
      [
        { name: "Piece", symbol: "pc" },
        { name: "Kilogram", symbol: "kg" },
        { name: "Meter", symbol: "m" },
        { name: "Liter", symbol: "L" },
        { name: "Box", symbol: "box" },
      ].map((unit) =>
        db.unit.create({
          data: {
            ...unit,
            orgId: org.id,
          },
        })
      )
    );
    console.log(`Created ${units.length} units`);

    // Create tax rates
    const taxRates = await Promise.all(
      [
        { name: "No Tax", rate: 0 },
        { name: "Reduced Rate", rate: 5 },
        { name: "Standard Rate", rate: 10 },
        { name: "Luxury Rate", rate: 15 },
        { name: "Import Tax", rate: 20 },
      ].map((tax) =>
        db.taxRate.create({
          data: {
            ...tax,
            orgId: org.id,
          },
        })
      )
    );
    console.log(`Created ${taxRates.length} tax rates`);

    // Create suppliers
    const suppliers = await Promise.all(
      [
        {
          name: "TechWholesale Inc.",
          contactPerson: "John Smith",
          email: "john@techwholesale.com",
          phone: "+1-555-111-3333",
          address: "456 Supplier St, San Francisco, CA 94105",
          paymentTerms: 30,
        },
        {
          name: "Global Electronics",
          contactPerson: "Jane Doe",
          email: "jane@globalelectronics.com",
          phone: "+1-555-222-4444",
          address: "789 Vendor Ave, San Francisco, CA 94105",
          paymentTerms: 45,
        },
        {
          name: "Prime Components",
          contactPerson: "Robert Johnson",
          email: "robert@primecomponents.com",
          phone: "+1-555-333-5555",
          address: "101 Parts Rd, San Francisco, CA 94105",
          paymentTerms: 30,
        },
        {
          name: "Digital Supplies Co.",
          contactPerson: "Sarah Wilson",
          email: "sarah@digitalsupplies.com",
          phone: "+1-555-444-6666",
          address: "202 Supply Dr, San Francisco, CA 94105",
          paymentTerms: 15,
        },
        {
          name: "Tech Imports Ltd.",
          contactPerson: "Michael Brown",
          email: "michael@techimports.com",
          phone: "+1-555-555-7777",
          address: "303 Import Blvd, San Francisco, CA 94105",
          paymentTerms: 60,
        },
      ].map((supplier) =>
        db.supplier.create({
          data: {
            ...supplier,
            orgId: org.id,
          },
        })
      )
    );
    console.log(`Created ${suppliers.length} suppliers`);

    // Create 10 items
    const items = [
      {
        name: "MacBook Pro",
        sku: "MB-PRO-001",
        barcode: "1234567890123",
        description: "Apple MacBook Pro with Retina display",
        dimensions: "30.41 x 21.24 x 1.56 cm",
        weight: 1.4,
        categoryId: categories.find((c) => c.title === "Computers")?.id,
        brandId: brands.find((b) => b.name === "Apple")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Standard Rate")?.id,
        tax: 10,
        costPrice: 1200,
        sellingPrice: 1499,
        minStockLevel: 5,
        maxStockLevel: 20,
        isSerialTracked: true,
      },
      {
        name: "iPhone 14 Pro",
        sku: "IP-14P-001",
        barcode: "2345678901234",
        description: "Apple iPhone 14 Pro smartphone",
        dimensions: "14.7 x 7.1 x 0.78 cm",
        weight: 0.2,
        categoryId: categories.find((c) => c.title === "Phones")?.id,
        brandId: brands.find((b) => b.name === "Apple")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Standard Rate")?.id,
        tax: 10,
        costPrice: 900,
        sellingPrice: 1099,
        minStockLevel: 10,
        maxStockLevel: 30,
        isSerialTracked: true,
      },
      {
        name: "Samsung Galaxy S23",
        sku: "SG-S23-001",
        barcode: "3456789012345",
        description: "Samsung Galaxy S23 smartphone",
        dimensions: "15.1 x 7.0 x 0.79 cm",
        weight: 0.21,
        categoryId: categories.find((c) => c.title === "Phones")?.id,
        brandId: brands.find((b) => b.name === "Samsung")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Standard Rate")?.id,
        tax: 10,
        costPrice: 800,
        sellingPrice: 999,
        minStockLevel: 8,
        maxStockLevel: 25,
        isSerialTracked: true,
      },
      {
        name: "Sony BRAVIA XR",
        sku: "SB-XR-001",
        barcode: "4567890123456",
        description: "Sony BRAVIA XR 65-inch 4K TV",
        dimensions: "144.6 x 83.1 x 7.1 cm",
        weight: 22.5,
        categoryId: categories.find((c) => c.title === "TVs")?.id,
        brandId: brands.find((b) => b.name === "Sony")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Luxury Rate")?.id,
        tax: 15,
        costPrice: 1800,
        sellingPrice: 2299,
        minStockLevel: 3,
        maxStockLevel: 10,
        isSerialTracked: true,
      },
      {
        name: "LG OLED C2",
        sku: "LG-C2-001",
        barcode: "5678901234567",
        description: "LG OLED C2 55-inch TV",
        dimensions: "122.4 x 70.5 x 4.7 cm",
        weight: 18.7,
        categoryId: categories.find((c) => c.title === "TVs")?.id,
        brandId: brands.find((b) => b.name === "LG")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Luxury Rate")?.id,
        tax: 15,
        costPrice: 1500,
        sellingPrice: 1899,
        minStockLevel: 3,
        maxStockLevel: 12,
        isSerialTracked: true,
      },
      {
        name: "Dell XPS 15",
        sku: "DL-XPS-001",
        barcode: "6789012345678",
        description: "Dell XPS 15 laptop",
        dimensions: "34.5 x 23.0 x 1.8 cm",
        weight: 1.8,
        categoryId: categories.find((c) => c.title === "Computers")?.id,
        brandId: brands.find((b) => b.name === "Dell")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Standard Rate")?.id,
        tax: 10,
        costPrice: 1100,
        sellingPrice: 1399,
        minStockLevel: 4,
        maxStockLevel: 15,
        isSerialTracked: true,
      },
      {
        name: "Sony WH-1000XM5",
        sku: "SW-XM5-001",
        barcode: "7890123456789",
        description: "Sony WH-1000XM5 Noise Cancelling Headphones",
        dimensions: "19.8 x 17.0 x 5.0 cm",
        weight: 0.25,
        categoryId: categories.find((c) => c.title === "Audio")?.id,
        brandId: brands.find((b) => b.name === "Sony")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Standard Rate")?.id,
        tax: 10,
        costPrice: 280,
        sellingPrice: 349,
        minStockLevel: 10,
        maxStockLevel: 30,
        isSerialTracked: false,
      },
      {
        name: "Samsung Galaxy Tab S8",
        sku: "SG-TS8-001",
        barcode: "8901234567890",
        description: "Samsung Galaxy Tab S8 tablet",
        dimensions: "25.3 x 16.5 x 0.65 cm",
        weight: 0.5,
        categoryId: categories.find((c) => c.title === "Computers")?.id,
        brandId: brands.find((b) => b.name === "Samsung")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Standard Rate")?.id,
        tax: 10,
        costPrice: 550,
        sellingPrice: 699,
        minStockLevel: 6,
        maxStockLevel: 20,
        isSerialTracked: true,
      },
      {
        name: "LG Gram 17",
        sku: "LG-G17-001",
        barcode: "9012345678901",
        description: "LG Gram 17 lightweight laptop",
        dimensions: "38.0 x 26.5 x 1.7 cm",
        weight: 1.35,
        categoryId: categories.find((c) => c.title === "Computers")?.id,
        brandId: brands.find((b) => b.name === "LG")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Standard Rate")?.id,
        tax: 10,
        costPrice: 1300,
        sellingPrice: 1599,
        minStockLevel: 3,
        maxStockLevel: 12,
        isSerialTracked: true,
      },
      {
        name: "Apple AirPods Pro",
        sku: "AP-PRO-001",
        barcode: "0123456789012",
        description: "Apple AirPods Pro wireless earbuds",
        dimensions: "4.5 x 6.0 x 2.1 cm",
        weight: 0.05,
        categoryId: categories.find((c) => c.title === "Audio")?.id,
        brandId: brands.find((b) => b.name === "Apple")?.id,
        unitId: units.find((u) => u.name === "Piece")?.id,
        taxRateId: taxRates.find((t) => t.name === "Standard Rate")?.id,
        tax: 10,
        costPrice: 180,
        sellingPrice: 249,
        minStockLevel: 15,
        maxStockLevel: 40,
        isSerialTracked: true,
      },
    ];

    // Create all items
    const createdItems = await Promise.all(
      items.map((item) =>
        db.item.create({
          data: {
            ...item,
            slug: generateSlug(item.name),
            orgId: org.id,
          },
        })
      )
    );
    console.log(`Created ${createdItems.length} items`);
    // Link suppliers to items
    console.log("Creating item-supplier relationships...");
    for (const item of createdItems) {
      // Link 1-2 suppliers to each item
      const itemSuppliers = suppliers.slice(
        0,
        Math.floor(Math.random() * 2) + 1
      );

      for (const supplier of itemSuppliers) {
        await db.itemSupplier.create({
          data: {
            itemId: item.id,
            supplierId: supplier.id,
            isPreferred: itemSuppliers.indexOf(supplier) === 0, // First supplier is preferred
            supplierSku: `SUP-${item.sku}`,
            leadTime: Math.floor(Math.random() * 10) + 3, // 3-12 days
            minOrderQty: Math.floor(Math.random() * 5) + 1, // 1-5 units
            unitCost: item.costPrice * 0.9, // 10% discount from retail cost price
          },
        });
      }
    }

    // Create inventory records for each item at each location
    console.log("Creating inventory records...");
    const inventoryRecords = [];
    for (const item of createdItems) {
      for (const location of locations) {
        // Main warehouse has more stock than stores
        const baseQuantity = location.type === "WAREHOUSE" ? 50 : 10;
        const quantity = Math.floor(Math.random() * baseQuantity) + 5; // 5-55 for warehouse, 5-15 for stores

        inventoryRecords.push(
          db.inventory.create({
            data: {
              itemId: item.id,
              locationId: location.id,
              quantity: quantity,
              reservedQuantity: 0,
              orgId: org.id,
            },
          })
        );
      }
    }
    await Promise.all(inventoryRecords);
    console.log(`Created ${inventoryRecords.length} inventory records`);

    // Create customers
    console.log("Creating customers...");
    const customers = await Promise.all([
      db.customer.create({
        data: {
          name: "Acme Corporation",
          email: "purchasing@acme.com",
          phone: "+1-555-ACME-123",
          address: "123 Acme Blvd, San Francisco, CA 94105",
          taxId: "ACM-123456",
          notes: "Large corporate client",
          orgId: org.id,
        },
      }),
      db.customer.create({
        data: {
          name: "TechStart Inc.",
          email: "orders@techstart.com",
          phone: "+1-555-TECH-456",
          address: "456 Startup Ave, San Francisco, CA 94105",
          taxId: "TSI-654321",
          notes: "Growing tech startup",
          orgId: org.id,
        },
      }),
      db.customer.create({
        data: {
          name: "San Francisco University",
          email: "procurement@sfu.edu",
          phone: "+1-555-SFU-7890",
          address: "789 University Dr, San Francisco, CA 94105",
          taxId: "SFU-789012",
          notes: "Educational institution",
          orgId: org.id,
        },
      }),
      db.customer.create({
        data: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1-555-123-4567",
          address: "101 Main St, San Francisco, CA 94105",
          notes: "Regular retail customer",
          orgId: org.id,
        },
      }),
      db.customer.create({
        data: {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "+1-555-765-4321",
          address: "202 Oak Ave, San Francisco, CA 94105",
          notes: "Premium member",
          orgId: org.id,
        },
      }),
    ]);
    console.log(`Created ${customers.length} customers`);

    console.log("Seed completed successfully!");
    console.log("Admin credentials:", {
      email: "admin@admin.com",
      password: adminPassword,
    });
    console.log("Manager credentials:", {
      email: "manager@example.com",
      password: managerPassword,
    });
    console.log("User credentials:", {
      email: "user@user.com",
      password: userPassword,
    });
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}
async function main() {
  console.log("Starting database seed process...");

  try {
    // First clean up existing data
    await cleanDatabase();

    // Then seed new data
    await seedDatabase();

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error in main seed process:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Failed to seed database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
