import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { hashPassword } from "../src/lib/indicators.auth.ts";

const path = new URL("../.env.local", import.meta.url);
let env = existsSync(path) ? readFileSync(path, "utf8") : "";
if (/^ADMIN_PASSWORD_HASH=.+/m.test(env) && !process.argv.includes("--reset")) {
  throw new Error("Ya hay un administrador. Para cambiar sus credenciales usá npm run admin:setup -- --reset");
}
const username = "admin";
const password = randomBytes(18).toString("base64url");
const config = {
  ADMIN_USERNAME: username,
  ADMIN_PASSWORD_HASH: await hashPassword(password),
  ADMIN_SESSION_SECRET: randomBytes(32).toString("hex"),
};
for (const [key, value] of Object.entries(config)) {
  env = env.replace(new RegExp(`^${key}=.*(?:\\r?\\n|$)`, "gm"), "");
  env += `\n${key}=${value}`;
}
writeFileSync(path, env.trim() + "\n", { mode: 0o600 });
console.log(`Acceso local creado. Guardá estos datos en tu gestor de contraseñas.\nUsuario: ${username}\nContraseña: ${password}\nLa contraseña no se guardó en texto plano. Reiniciá el servidor si estaba abierto.`);
