// Flows will be imported for their side effects in this file.
import '@/ai/flows/scrapeBeupResult'; 
// Tools are typically imported by the flows that use them, or if they need to be registered globally for other reasons.
// For this setup, fetchBeupPageTool is imported by scrapeBeupResult flow.
// import '@/ai/tools/fetchBeupPageTool'; // Not strictly necessary here if only used by the flow.
