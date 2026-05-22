import "reflect-metadata";
import { AppDataSource } from "./src/database/data-source";
import { User } from "./src/database/entity/User";

async function test() {
  try {
    await AppDataSource.initialize();
    console.log("DB connected");
    
    const raw = await AppDataSource.query("SELECT * FROM USUARIO WHERE Email = ? LIMIT 1", ["test@test.com"]);
    console.log("Raw:", JSON.stringify(raw));

    const user = await AppDataSource.getRepository(User).findOne({
      where: { email: "test@test.com" },
      relations: { establishment: true, role: true }
    });
    console.log("User:", user ? "found" : "not found");
    
    await AppDataSource.destroy();
  } catch (err: any) {
    console.error("ERROR:", err.message);
    console.error("QUERY:", err.query);
  }
}

test();
