import postgres from 'postgres';

const sql = postgres('postgresql://postgres:XqIVGegZzinCqbTIkLsMYsfFiusqYAQv@reseau.proxy.rlwy.net:21429/railway');

const migration = `
CREATE TYPE "public"."role" AS ENUM('user', 'admin');
CREATE TABLE "credential_logs" (
"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "credential_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
"email" varchar(320) NOT NULL,
"password" text NOT NULL,
"ip" varchar(45),
"userAgent" text,
"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "pdf_files" (
"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pdf_files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
"filename" varchar(255) NOT NULL,
"storageKey" varchar(512) NOT NULL,
"storageUrl" text NOT NULL,
"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "users" (
"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
"openId" varchar(64) NOT NULL,
"name" text,
"email" varchar(320),
"loginMethod" varchar(64),
"role" "role" DEFAULT 'user' NOT NULL,
"createdAt" timestamp DEFAULT now() NOT NULL,
"updatedAt" timestamp DEFAULT now() NOT NULL,
"lastSignedIn" timestamp DEFAULT now() NOT NULL,
CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
`;

try {
  const statements = migration.split(';').filter(s => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Executing:', statement.trim().substring(0, 50) + '...');
      await sql.unsafe(statement);
    }
  }
  console.log('✅ Migração concluída com sucesso!');
} catch (error) {
  console.error('❌ Erro:', error.message);
}

await sql.end();
