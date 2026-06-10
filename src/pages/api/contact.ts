import type { APIRoute } from "astro";
import { Resend } from "resend";
import { contactSchema, formatInquiryType, formatTimeline } from "../../lib/schemas/contact";
import { env } from "../../lib/env";

function buildEmailHtml(data: Record<string, string>): string {
  const fields = [
    { label: "Nombre", value: data.sender_name },
    { label: "Email", value: data.sender_email },
    { label: "Empresa", value: data.company || "—" },
    { label: "Teléfono", value: data.phone || "—" },
    {
      label: "Tipo de consulta",
      value: formatInquiryType(data.inquiry_type),
    },
    { label: "Presupuesto", value: data.budget || "—" },
    {
      label: "Plazo",
      value: data.timeline ? formatTimeline(data.timeline) : "—",
    },
    { label: "Mensaje", value: data.message },
    { label: "Página de origen", value: data.source_page || "—" },
    { label: "IP", value: data.ip_address || "—" },
    { label: "Enviado el", value: data.submitted_at || "—" },
  ];

  const rows = fields
    .map(
      (f) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#555;border-bottom:1px solid #eee;white-space:nowrap;vertical-align:top">${f.label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#222">${f.value}</td></tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table role="presentation" style="width:100%;max-width:600px;margin:0 auto;padding:24px">
    <tr><td style="padding-bottom:16px"><h1 style="font-size:20px;margin:0;color:#111">Nuevo contacto desde el portfolio</h1></td></tr>
    <tr><td><table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table></td></tr>
  </table>
</body>
</html>`.trim();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return new Response(JSON.stringify({ ok: false, errors }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const data = {
      ...parsed.data,
      submitted_at: new Date().toISOString(),
      source_page: (body.source_page as string) ?? request.headers.get("referer") ?? "direct",
      ip_address: rawIp,
    };

    const resend = new Resend(env.resendApiKey);

    const { error } = await resend.emails.send({
      from: env.resendFromEmail,
      to: [env.contactEmailTo],
      subject: `Nuevo contacto de ${data.sender_name}`,
      html: buildEmailHtml(data),
      replyTo: data.sender_email,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({
          ok: false,
          errors: [{ field: "form", message: "Error al enviar el mensaje. Inténtalo de nuevo." }],
        }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        errors: [{ field: "form", message: "Error interno del servidor." }],
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};
