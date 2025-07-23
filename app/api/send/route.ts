import { NextRequest, NextResponse } from "next/server";
import type { Attachment } from "nodemailer/lib/mailer";
import { assertNotRateLimited } from "@/lib/rateLimit";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",").splice(-3, 1)[0];
  if (!ip) {
    return NextResponse.json(
      { success: false, error: "Indirizzo IP non trovato." },
      { status: 400 },
    );
  }
  try {
    await assertNotRateLimited(ip);
  } catch {
    return NextResponse.json(
      { success: false, error: "Troppi tentativi. Riprova più tardi." },
      { status: 429 },
    );
  }

  const data = await req.formData();
  const name = data.get("name");
  const email = data.get("email");
  const phone = data.get("phone");
  const message = data.get("message");
  const files = data.getAll("file");

  const transporter = nodemailer.createTransport({
    host: "smtps.aruba.it",      // <-- server SMTP Aruba
    port: 465,                  // 465 per SSL, 587 per TLS
    secure: true,               // true per 465, false per 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS);

  // Prepara allegati in modo asincrono
  const attachments: Attachment[] =
    files && files.length
      ? (
          await Promise.all(
            files.map(async (file: any) => {
              if (!file || typeof file.arrayBuffer !== "function") return null;
              return {
                filename: file.name,
                content: Buffer.from(await file.arrayBuffer()),
              } as Attachment;
            })
          )
        ).filter((a): a is Attachment => a !== null)
      : [];

  try {
    await transporter.sendMail({
      from: `"${name}" <prototipazione@cliquesrl.it>`,
      to: "leonardo@cliquesrl.it",
      subject: "Nuovo progetto dal sito",
      text: `Nome: ${name}\nEmail: ${email}\nTelefono: ${phone}\nMessaggio: ${message}`,
      attachments, 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore invio mail:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}