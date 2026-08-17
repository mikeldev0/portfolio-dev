export type LanguageModelAvailability =
  | "available"
  | "downloadable"
  | "downloading"
  | "unavailable";

type LanguageModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type LanguageModelExpectedInput = {
  type: "text";
  languages?: string[];
};

type LanguageModelCoreOptions = {
  expectedInputs: LanguageModelExpectedInput[];
  expectedOutputs: LanguageModelExpectedInput[];
};

type LanguageModelDownloadProgressEvent = Event & {
  loaded: number;
  total: number;
};

type LanguageModelMonitor = {
  addEventListener(
    type: "downloadprogress",
    listener: (event: LanguageModelDownloadProgressEvent) => void
  ): void;
};

type LanguageModelSession = {
  promptStreaming(input: string, options?: { signal?: AbortSignal }): ReadableStream<string>;
  destroy(): void;
};

type LanguageModelApi = {
  availability(options: LanguageModelCoreOptions): Promise<LanguageModelAvailability>;
  create(
    options: LanguageModelCoreOptions & {
      initialPrompts?: LanguageModelMessage[];
      monitor?: (monitor: LanguageModelMonitor) => void;
    }
  ): Promise<LanguageModelSession>;
};

type BuiltInAiWindow = typeof globalThis & {
  LanguageModel?: LanguageModelApi;
};

export const LANGUAGE_MODEL_OPTIONS: LanguageModelCoreOptions = {
  expectedInputs: [{ type: "text" }],
  expectedOutputs: [{ type: "text" }],
};

function getLanguageModel(): LanguageModelApi | undefined {
  return (globalThis as BuiltInAiWindow).LanguageModel;
}

export async function getLanguageModelAvailability(): Promise<LanguageModelAvailability> {
  const languageModel = getLanguageModel();

  if (!languageModel) return "unavailable";

  try {
    return await languageModel.availability(LANGUAGE_MODEL_OPTIONS);
  } catch {
    return "unavailable";
  }
}

export async function createLanguageModelSession(
  systemPrompt: string,
  onDownloadProgress?: (loaded: number, total: number) => void
): Promise<LanguageModelSession> {
  const languageModel = getLanguageModel();

  if (!languageModel) {
    throw new Error("Chrome Built-in AI is not available.");
  }

  return languageModel.create({
    ...LANGUAGE_MODEL_OPTIONS,
    initialPrompts: [{ role: "system", content: systemPrompt }],
    monitor: onDownloadProgress
      ? (monitor) => {
          monitor.addEventListener("downloadprogress", (event) => {
            onDownloadProgress(event.loaded, event.total);
          });
        }
      : undefined,
  });
}

export async function streamLanguageModelResponse(
  session: LanguageModelSession,
  input: string,
  onUpdate: (response: string) => void,
  signal: AbortSignal
): Promise<string> {
  const stream = session.promptStreaming(input, { signal });
  const reader = stream.getReader();
  let response = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      response += value;
      onUpdate(response);
    }
  } finally {
    reader.releaseLock();
  }

  return response.trim();
}

export type { LanguageModelSession };
