import type { APIRoute } from "astro";
import { Resend } from "resend";
import { contactSchema, formatInquiryType, formatTimeline } from "../../lib/schemas/contact";
import { env } from "../../lib/env";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(s: string): string {
  return s.replace(/\n/g, "<br>");
}

function buildEmailHtml(data: Record<string, string>): string {
  const inquiryLabel = escapeHtml(formatInquiryType(data.inquiry_type));
  const timelineLabel = data.timeline ? escapeHtml(formatTimeline(data.timeline)) : "—";

  const e = (s: string) => escapeHtml(s || "—");

  const sectionTitle = (title: string) => `
    <table role="presentation" style="width:100%">
      <tr>
        <td style="padding:0 0 8px 0;border-bottom:1px solid #E6E0D4">
          <p style="margin:0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;color:#B8956E;line-height:1.2">${title}</p>
        </td>
      </tr>
    </table>`;

  const dataField = (label: string, value: string, isLast = false) => `
    <tr>
      <td style="padding:10px 0;${isLast ? "" : "border-bottom:1px solid #E6E0D4;"}vertical-align:top">
        <table role="presentation" style="width:100%">
          <tr>
            <td style="font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#6E7076;padding:0 0 2px 0;line-height:1.3">${label}</td>
          </tr>
          <tr>
            <td style="font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:14px;color:#2C2E33;line-height:1.5;word-break:break-word">${value}</td>
          </tr>
        </table>
      </td>
    </tr>`;

  const contactFields = [
    dataField("Email", e(data.sender_email), false),
    dataField("Empresa", e(data.company), false),
    dataField("Teléfono", e(data.phone), true),
  ].join("");

  const inquiryFields = [
    dataField("Tipo", inquiryLabel, false),
    dataField("Presupuesto", e(data.budget), false),
    dataField("Plazo", timelineLabel, true),
  ].join("");

  const metaFields = [
    dataField("Página de origen", e(data.source_page), false),
    dataField("Dirección IP", e(data.ip_address), false),
    dataField("Enviado el", e(data.submitted_at), true),
  ].join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:transparent;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif">
  <table role="presentation" style="width:100%;max-width:520px;margin:0 auto;padding:32px 24px">
    <tr>
      <td style="padding:0 0 32px 0">
        <table role="presentation" style="width:100%">
          <tr>
            <td style="width:36px;vertical-align:middle">
              <img src="https://www.mikeldev.com/favicon.svg" alt="" width="36" height="36" style="display:block;border-radius:8px;width:36px;height:36px">
            </td>
            <td style="padding:0 0 0 12px;vertical-align:middle">
              <p style="margin:0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:13px;font-weight:700;color:#2C2E33;letter-spacing:-0.02em">mikeldev.com</p>
              <p style="margin:1px 0 0 0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:10px;color:#6E7076;text-transform:uppercase;letter-spacing:0.15em">Nuevo contacto</p>
            </td>
            <td style="text-align:right;vertical-align:middle">
              <p style="margin:0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:10px;color:#B8956E;font-weight:600;letter-spacing:0.12em">${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 16px 0">
        <p style="margin:0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:18px;font-weight:800;color:#2C2E33;letter-spacing:-0.02em;line-height:1.2">${e(data.sender_name)}</p>
      </td>
    </tr>
    <tr><td style="padding:0 0 24px 0">
      <table role="presentation" style="width:100%">
        <tr>
          <td style="padding:0 16px 0 0;width:50%" valign="top">${sectionTitle("Contacto")}${contactFields}</td>
          <td style="padding:0 0 0 16px;width:50%" valign="top">${sectionTitle("Consulta")}${inquiryFields}</td>
        </tr>
      </table>
    </td></tr>
    <tr>
      <td style="padding:0 0 20px 0">
        <table role="presentation" style="width:100%">
          <tr><td style="padding:0 0 12px 0">${sectionTitle("Mensaje")}</td></tr>
          <tr><td style="padding:0"><p style="margin:0;font-family:'Onest Variable','Segoe UI',system-ui,sans-serif;font-size:14px;color:#2C2E33;line-height:1.7;white-space:pre-wrap">${nl2br(e(data.message))}</p></td></tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0"><hr style="border:none;border-top:1px solid #E6E0D4;margin:0 0 20px 0"></td></tr>
    <tr>
      <td style="padding:0">
        <table role="presentation" style="width:100%">
          <tr><td style="padding:0 0 12px 0">${sectionTitle("Metadatos")}</td></tr>
          <tr><td>${metaFields}</td></tr>
        </table>
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
