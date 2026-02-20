'use server';
/**
 * @fileOverview AI-powered job content generation.
 *
 * - generateJobContent - A function that handles the job content generation process.
 * - GenerateJobContentInput - The input type for the generateJobContent function.
 * - GenerateJobContentOutput - The return type for the generateJobContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateJobContentInputSchema, GenerateJobContentOutputSchema } from '@/lib/schemas';


export type GenerateJobContentInput = z.infer<typeof GenerateJobContentInputSchema>;
export type GenerateJobContentOutput = z.infer<typeof GenerateJobContentOutputSchema>;


export async function generateJobContent(input: GenerateJobContentInput): Promise<GenerateJobContentOutput> {
  return generateJobContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJobContentPrompt',
  input: {schema: GenerateJobContentInputSchema},
  output: {schema: GenerateJobContentOutputSchema},
  prompt: `You are an expert recruiter. Based on the job title, category, industry, minimum experience, and demand level, generate a detailed job description in Portuguese. 
The description should include a general summary, a list of key responsibilities, a list of required qualifications and skills, and a list of 3-5 insightful, open-ended screening questions to help filter candidates.

Job Title: {{{title}}}
Category: {{{category}}}
Industry: {{{industry}}}
Minimum Experience: {{{minExperience}}}
Demand Level: {{{demandLevel}}}
`,
});

const generateJobContentFlow = ai.defineFlow(
  {
    name: 'generateJobContentFlow',
    inputSchema: GenerateJobContentInputSchema,
    outputSchema: GenerateJobContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
