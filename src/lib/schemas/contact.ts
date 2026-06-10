import { z } from "zod/v3";

export const INQUIRY_VALUES = ["project", "collaboration", "job", "support", "other"] as const;

export const TIMELINE_VALUES = ["", "asap", "1-3", "3-6", "flexible"] as const;

export const INQUIRY_OPTIONS = [
  { value: "", label: "Selecciona...", i18nKey: "form.selectDefault" },
  { value: "project", label: "Nuevo proyecto", i18nKey: "form.inquiryProject" },
  { value: "collaboration", label: "Colaboración", i18nKey: "form.inquiryCollaboration" },
  { value: "job", label: "Oportunidad laboral", i18nKey: "form.inquiryJob" },
  { value: "support", label: "Soporte", i18nKey: "form.inquirySupport" },
  { value: "other", label: "Otro", i18nKey: "form.inquiryOther" },
] as const;

export const TIMELINE_OPTIONS = [
  { value: "", label: "Selecciona...", i18nKey: "form.selectDefault" },
  { value: "asap", label: "Lo antes posible", i18nKey: "form.timelineASAP" },
  { value: "1-3", label: "1–3 meses", i18nKey: "form.timeline1to3" },
  { value: "3-6", label: "3–6 meses", i18nKey: "form.timeline3to6" },
  { value: "flexible", label: "Flexible", i18nKey: "form.timelineFlexible" },
] as const;

export const contactSchema = z.object({
  sender_name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre es demasiado largo"),
  sender_email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  company: z.string().max(200).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  inquiry_type: z.enum(INQUIRY_VALUES, {
    message: "Selecciona un tipo de consulta",
  }),
  budget: z.string().max(200).optional().default(""),
  timeline: z.enum(TIMELINE_VALUES).default(""),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(5000, "El mensaje es demasiado largo"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export function formatInquiryType(value: string): string {
  return INQUIRY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function formatTimeline(value: string): string {
  return TIMELINE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
