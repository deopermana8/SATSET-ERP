import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const role = await prisma.role.upsert({
    where:{ name:"Admin" },
    update:{},
    create:{ name:"Admin" }
  });

  const password = await bcrypt.hash("admin123",10);

  await prisma.user.upsert({

    where:{
      email:"admin@lontarsewu.com"
    },

    update:{},

    create:{
      name:"Administrator",
      email:"admin@lontarsewu.com",
      password,
      roleId:role.id
    }

  });

  console.log("================================");
  console.log("ADMIN BERHASIL DIBUAT");
  console.log("Email    : admin@lontarsewu.com");
  console.log("Password : admin123");
  console.log("================================");

}

main()
.catch(console.error)
.finally(async()=>{
  await prisma.$disconnect();
});
