export interface ExampleSummary { id: string; title: string; description: string }
export interface Example extends ExampleSummary { markdown: string }
export interface DocSummary { id: string; title: string; summary: string }
export interface Doc extends DocSummary { content: string; url: string }
export interface ProductInfo {
  product: { name: string; url: string; description: string };
  privacy: { browserProcessing: boolean; publicDocsReadOnly: boolean; documentUploadRequired: boolean };
  features: string[];
  limits: string[];
  links: { developers: string; openapi: string; llms: string; examples: string; docs: string; mcp: string };
}
export interface ClientOptions { baseUrl?: string; timeoutMs?: number; fetch?: typeof globalThis.fetch }
export interface MdprintClient {
  getInfo(): Promise<ProductInfo>;
  listExamples(): Promise<{ examples: ExampleSummary[] }>;
  getExample(id: string): Promise<{ example: Example }>;
  listDocs(): Promise<{ sections: DocSummary[] }>;
  getDoc(id: string): Promise<{ section: Doc }>;
}
export class MdprintError extends Error {
  constructor(message: string, options?: { code?: string; status?: number });
  code: string;
  status?: number;
}
export function validateBaseUrl(value?: string): string;
export function createClient(options?: ClientOptions): MdprintClient;
