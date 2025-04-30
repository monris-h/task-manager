import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Creamos el handler usando la configuración importada desde lib/auth.ts
const handler = NextAuth(authOptions);

// Solo exportamos los controladores de ruta necesarios
export { handler as GET, handler as POST };