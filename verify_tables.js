const { PrismaClient } = require("./node_modules/@prisma/client");
const prisma = new PrismaClient();
prisma.$queryRawUnsafe("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'mydb';")
  .then(res => { console.log(JSON.stringify(res, null, 2)); return prisma.$disconnect(); })
  .catch(err => { console.error(err); process.exit(1); });
