'use server';
/**
 * @fileOverview Extracts structured user profile information from a resume file.
 *
 * - extractProfileFromResume - A function that handles the resume parsing process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ExtractProfileFromResumeInputSchema, ExtractProfileFromResumeOutputSchema, type ExtractProfileFromResumeInput, type ExtractProfileFromResumeOutput } from '@/lib/schemas';


export async function extractProfileFromResume(input: ExtractProfileFromResumeInput): Promise<ExtractProfileFromResumeOutput> {
  return extractProfileFromResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProfileFromResumePrompt',
  input: { schema: ExtractProfileFromResumeInputSchema },
  output: { schema: ExtractProfileFromResumeOutputSchema },
  prompt: `You are an expert HR assistant. Your task is to analyze the provided resume and extract structured information to fill out a user's professional profile. Be as accurate as possible.

Resume: {{media url=resumeDataUri}}

Extract the following information in Portuguese:
- First Name
- Last Name
- Professional Title (academicTitle): The most relevant or recent job title.
- Nationality
- Years of Experience: Calculate the total years of experience based on the dates provided.
- Functional Area: The main area of work (e.g., 'Recursos Humanos', 'Tecnologia da Informação').
- Skills: A list of relevant technical and soft skills.
- Academic History: A list of all academic qualifications.
- Work Experience: A list of all professional experiences, including company, role, period, and a brief description.`,
});

const extractProfileFromResumeFlow = ai.defineFlow(
  {
    name: 'extractProfileFromResumeFlow',
    inputSchema: ExtractProfileFromResumeInputSchema,
    outputSchema: ExtractProfileFromResumeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
