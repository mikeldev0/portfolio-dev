import type { APIRoute } from "astro";
import { Resend } from "resend";
import { contactSchema, formatInquiryType, formatTimeline } from "../../lib/schemas/contact";
import { env } from "../../lib/env";

function buildEmailHtml(data: Record<string, string>): string {
  const inquiryLabel = formatInquiryType(data.inquiry_type);
  const timelineLabel = data.timeline ? formatTimeline(data.timeline) : "—";

  const section = (title: string, rows: string) => `
    <table role="presentation" style="width:100%;margin-bottom:24px">
      <tr>
        <td style="padding:0 0 12px 0">
          <table role="presentation" style="width:100%">
            <tr>
              <td style="width:4px;background:#B8956E;border-radius:2px"></td>
              <td style="padding:0 0 0 14px">
                <h2 style="margin:0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;color:#6E7076;line-height:1.2">${title}</h2>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#FFFFFF;border-radius:10px;padding:4px 0">
          <table role="presentation" style="width:100%;border-collapse:collapse">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`;

  const field = (label: string, value: string, isLast = false) => `
    <tr>
      <td style="padding:12px 16px;${isLast ? "" : "border-bottom:1px solid #E6E0D4;"}vertical-align:top">
        <table role="presentation" style="width:100%">
          <tr>
            <td style="font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#6E7076;padding:0 0 3px 0;line-height:1.3">${label}</td>
          </tr>
          <tr>
            <td style="font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:15px;color:#2C2E33;line-height:1.5;word-break:break-word">${value}</td>
          </tr>
        </table>
      </td>
    </tr>`;

  const contactRows = [
    field("Nombre", data.sender_name),
    field("Email", data.sender_email),
    field("Empresa", data.company || "—"),
    field("Teléfono", data.phone || "—", true),
  ].join("");

  const inquiryRows = [
    field("Tipo de consulta", inquiryLabel),
    field("Presupuesto", data.budget || "—"),
    field("Plazo", timelineLabel, true),
  ].join("");

  const messageBlock = `
    <table role="presentation" style="width:100%;margin-bottom:24px">
      <tr>
        <td style="padding:0 0 12px 0">
          <table role="presentation" style="width:100%">
            <tr>
              <td style="width:4px;background:#B8956E;border-radius:2px"></td>
              <td style="padding:0 0 0 14px">
                <h2 style="margin:0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;color:#6E7076;line-height:1.2">Mensaje</h2>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#FFFFFF;border-radius:10px;padding:20px 16px">
          <p style="margin:0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:15px;color:#2C2E33;line-height:1.7;white-space:pre-wrap">${data.message}</p>
        </td>
      </tr>
    </table>`;

  const metaRows = [
    field("Página de origen", data.source_page || "—"),
    field("Dirección IP", data.ip_address || "—"),
    field("Enviado el", data.submitted_at || "—", true),
  ].join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FEFCF6;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif">
  <table role="presentation" style="width:100%;max-width:560px;margin:0 auto;padding:40px 24px">
    <tr>
      <td style="padding:0 0 32px 0">
        <table role="presentation" style="width:100%">
          <tr>
            <td style="width:40px;height:40px;background:#333333;border-radius:10px;text-align:center;vertical-align:middle;font-size:18px;line-height:40px;color:#FEFCF6;font-weight:800">M</td>
            <td style="padding:0 0 0 14px;vertical-align:middle">
              <p style="margin:0;font-size:13px;font-weight:700;color:#2C2E33;letter-spacing:-0.02em">mikeldev.com</p>
              <p style="margin:2px 0 0 0;font-size:11px;color:#6E7076;text-transform:uppercase;letter-spacing:0.12em">Nuevo contacto</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0">${section("Información de contacto", contactRows)}</td></tr>
    <tr><td style="padding:0">${section("Detalles de la consulta", inquiryRows)}</td></tr>
    <tr><td style="padding:0">${messageBlock}</td></tr>
    <tr><td style="padding:0">${section("Metadatos", metaRows)}</td></tr>
    <tr>
      <td style="padding:24px 0 0 0;text-align:center">
        <p style="margin:0;font-size:11px;color:#B8956E;font-weight:600;letter-spacing:0.12em">mikeldev.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const rawIp =
      request.headers.get("x-nf-client-connection-ip") ??
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
