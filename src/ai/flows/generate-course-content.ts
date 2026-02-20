
'use server';
/**
 * @fileOverview AI-powered course content generation.
 *
 * - generateCourseContent - A function that handles the course content generation process.
 * - GenerateCourseContentInput - The input type for the generateCourseContent function.
 * - GenerateCourseContentOutput - The return type for the generateCourseContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateCourseContentInputSchema, GenerateCourseContentOutputSchema } from '@/lib/schemas';

export type GenerateCourseContentInput = z.infer<typeof GenerateCourseContentInputSchema>;
export type GenerateCourseContentOutput = z.infer<typeof GenerateCourseContentOutputSchema>;

const GenerateCourseContentOutputSchemaWithoutImage = GenerateCourseContentOutputSchema.omit({ imageDataUri: true });


export async function generateCourseContent(input: GenerateCourseContentInput): Promise<z.infer<typeof GenerateCourseContentOutputSchemaWithoutImage>> {
  return generateCourseContentFlow(input);
}

export async function generateCourseImage(imageHint: string): Promise<string> {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Uma imagem de cabeçalho profissional e moderna para um e-mail sobre: ${imageHint}. A imagem deve ser limpa, atrativa e adequada para um contexto de negócios. Evite texto na imagem.`
      });
    if (!media.url) {
        throw new Error("AI failed to generate an image.");
    }
    return media.url;
}

const prompt = ai.definePrompt({
  name: 'generateCourseContentPrompt',
  input: {schema: GenerateCourseContentInputSchema},
  output: {schema: GenerateCourseContentOutputSchemaWithoutImage},
  prompt: `You are an expert instructional designer. Based on the course title, category, and level, generate the following content in Portuguese:
- A unique and descriptive course ID (e.g., 'XY-123').
- A detailed general objective.
- A list of 4-6 specific learning outcomes ('what you will learn').
- A course structure with 4 modules, each containing 2-4 topics.
- A suggested course duration in hours.
- A short hint (1-2 words, e.g. "tech course") for an AI image generator to create a relevant course image.

Course Title: {{{courseName}}}
Category: {{{courseCategory}}}
Level: {{{courseLevel}}}
`,
});


const generateCourseContentFlow = ai.defineFlow(
  {
    name: 'generateCourseContentFlow',
    inputSchema: GenerateCourseContentInputSchema,
    outputSchema: GenerateCourseContentOutputSchemaWithoutImage,
  },
  async input => {
    const {output: textOutput} = await prompt(input);

    if(!textOutput) {
        throw new Error("Failed to generate course content text.");
    }

    return textOutput;
  }
);
