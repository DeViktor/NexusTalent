'use server';
/**
 * @fileOverview A chatbot assistant to help users navigate the platform.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { searchCourses, searchJobs } from '@/lib/chatbot-service';
import { ChatbotAssistanceInputSchema, ChatbotAssistanceOutputSchema, type ChatbotAssistanceInput, type ChatbotAssistanceOutput } from '@/lib/schemas';


export async function chatbotAssistance(input: ChatbotAssistanceInput): Promise<ChatbotAssistanceOutput> {
  return chatbotAssistanceFlow(input);
}

const findCoursesTool = ai.defineTool(
    {
      name: 'findCourses',
      description: 'Searches for available courses based on a query.',
      inputSchema: z.object({ query: z.string().describe('The search term for courses, like a topic or course name.') }),
      outputSchema: z.array(z.object({
          id: z.string(),
          name: z.string(),
          category: z.string(),
          format: z.string(),
          generalObjective: z.string(),
      })),
    },
    async ({ query }) => searchCourses(query)
  );
  
  const findJobsTool = ai.defineTool(
    {
      name: 'findJobs',
      description: 'Searches for available job postings based on a query.',
      inputSchema: z.object({ query: z.string().describe('The search term for jobs, like a job title or location.') }),
      outputSchema: z.array(z.object({
          id: z.string(),
          title: z.string(),
          location: z.string(),
          type: z.string(),
          description: z.string(),
      })),
    },
    async ({ query }) => searchJobs(query)
  );

const prompt = ai.definePrompt({
    name: 'chatbotAssistancePrompt',
    input: { schema: ChatbotAssistanceInputSchema },
    output: { schema: ChatbotAssistanceOutputSchema },
    tools: [findCoursesTool, findJobsTool],
    prompt: `You are a friendly and helpful AI assistant for the NexusTalent platform. Your goal is to provide comprehensive answers about the platform's services, features, and guide users to the correct pages.

- Your name is 'Nexus Assistant'.
- Be concise, professional, and direct in your answers.

**About NexusTalent & Our Services:**
NexusTalent is a complete platform for professional training and recruitment, connecting talent to opportunities. Our main services are:
1.  **Formação (Training):** We offer a wide range of online, in-person, and hybrid courses. Use the 'findCourses' tool if a user asks about specific courses. Guide them to the '/courses' page for the full catalog.
2.  **Recrutamento (Recruitment):** We connect companies with qualified professionals. Use the 'findJobs' tool for job-related queries. Guide users to the '/recruitment' page to see all open positions.
3.  **Cessão de Mão de Obra (Labor Outsourcing):** We provide specialized labor outsourcing services in Brazil, Angola, and Portugal. For more details, guide users to the '/about' page.

**Our AI Features:**
- We use AI to analyze resumes, generate course and job content, and provide personalized course recommendations. Mention these features when relevant.

**Your Role:**
- Use the available tools to find information about courses and jobs when the user asks.
- If you find relevant items, mention their names and include them in the 'suggestedLinks' output so the user can easily click on them. The URL for a course is '/courses/[id]' and for a job is '/recruitment/[id]'.
- For general questions about our services, pricing, or company, guide them to the appropriate pages like '/about' or '/pricing'.
- If you don't know the answer or can't find relevant information, politely say so and suggest they browse the site manually.

- The current page context is: '{{{context}}}'
- The user's question is: '{{{query}}}'`,
});

const chatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'chatbotAssistanceFlow',
    inputSchema: ChatbotAssistanceInputSchema,
    outputSchema: ChatbotAssistanceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
