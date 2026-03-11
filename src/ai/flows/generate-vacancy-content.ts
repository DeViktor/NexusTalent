'use server';
/**
 * @fileOverview AI-powered job content generation.
 *
 * - generateJobContent - A function that handles the job content generation process.
 * - GenerateJobContentInput - The input type for the generateJobContent function.
 * - GenerateJobContentOutput - The return type for the generateJobContent function.
 */

import {z} from 'genkit';
import { GenerateJobContentInputSchema, GenerateJobContentOutputSchema } from '@/lib/schemas';
import { generateJobContent as generateJobContentBase } from '@/ai/flows/generate-job-content';


export type GenerateJobContentInput = z.infer<typeof GenerateJobContentInputSchema>;
export type GenerateJobContentOutput = z.infer<typeof GenerateJobContentOutputSchema>;


export async function generateJobContent(input: GenerateJobContentInput, apiKey?: string | null): Promise<GenerateJobContentOutput> {
  return generateJobContentBase(input, apiKey);
}
