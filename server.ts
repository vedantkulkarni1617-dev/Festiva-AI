import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Helper to initialize Gemini client safely
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Model fallback generator for high reliability
  async function generateWithFallback(ai: GoogleGenAI, params: any) {
    const models = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
    let lastErr: any;
    for (const m of models) {
      try {
        return await ai.models.generateContent({
          ...params,
          model: m,
        });
      } catch (err: any) {
        console.warn(`Model ${m} encountered issue, trying fallback:`, err?.message || err);
        lastErr = err;
      }
    }
    throw lastErr;
  }

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      environment: process.env.NODE_ENV || 'development',
      time: new Date().toISOString(),
    });
  });

  // 1. Generate Comprehensive AI Event Plan
  app.post('/api/gemini/plan', async (req: Request, res: Response) => {
    try {
      const {
        name,
        category,
        date,
        location,
        guestCount,
        totalBudget,
        currency,
        themeOrStyle,
        venuePreference,
        dietaryRequirements,
        specialRequests,
        planningStyle,
      } = req.body;

      if (!name || !category || !date) {
        return res.status(400).json({ error: 'Missing required event fields (name, category, date)' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is not configured in server environment secrets.',
          isApiKeyMissing: true,
        });
      }

      const prompt = `You are Festiva AI, an elite, world-class celebration and event planning architect.
Create a comprehensive, production-ready event plan based on these user inputs:
- Event Name: ${name}
- Category: ${category}
- Scheduled Date: ${date}
- Target Location: ${location || 'Local area'}
- Expected Guest Count: ${guestCount || 50}
- Total Budget: ${totalBudget || 5000} ${currency || 'USD'}
- Theme/Style Preference: ${themeOrStyle || 'Celebratory & Elegant'}
- Venue Preference: ${venuePreference || 'Hybrid'}
- Dietary Requirements: ${dietaryRequirements || 'None specified'}
- Special Requests: ${specialRequests || 'None'}
- Planning Style: ${planningStyle || 'Balanced & Structured'}

Rules:
1. All generated costs are realistic estimates that strictly sum up to the total budget: ${totalBudget} ${currency}.
2. Never fabricate real vendor bookings or confirmed contracts; clearly structure as planning estimates.
3. Provide a timeline with practical preparation phases (Several Weeks Before, Month Before, Final Week, Day Before, Event Day).
4. Provide categorized vendor checklist items (Venue, Caterer, Decorator, Photographer, Videographer, Entertainment, Florist, Transportation, Invitations, Other).
5. Generate creative theme ideas with color palette hex codes, invitation wording, games/activities, and menu highlights.
6. Return purely valid JSON strictly matching the requested format.`;

      const response = await generateWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert luxury event planner and celebration coordinator. Always return valid, detailed JSON without markdown fences.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overviewPlan: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  recommendedTheme: { type: Type.STRING },
                  decorAtmosphere: { type: Type.ARRAY, items: { type: Type.STRING } },
                  venueSelectionCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
                  foodAndCateringConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  entertainmentOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  guestExperienceFlow: { type: Type.ARRAY, items: { type: Type.STRING } },
                  risksAndContingencies: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        risk: { type: Type.STRING },
                        mitigation: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
              budgetItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    estimatedCost: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                    notes: { type: Type.STRING },
                  },
                },
              },
              timelineTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    phase: { type: Type.STRING },
                    daysBeforeEvent: { type: Type.INTEGER },
                    priority: { type: Type.STRING },
                  },
                },
              },
              vendorChecklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    name: { type: Type.STRING },
                    estimatedCost: { type: Type.NUMBER },
                    notes: { type: Type.STRING },
                  },
                },
              },
              themeIdea: {
                type: Type.OBJECT,
                properties: {
                  themeTitle: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  description: { type: Type.STRING },
                  palette: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        hex: { type: Type.STRING },
                      },
                    },
                  },
                  decorConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  dressCodeAdvice: { type: Type.STRING },
                  invitationWording: {
                    type: Type.OBJECT,
                    properties: {
                      formal: { type: Type.STRING },
                      modern: { type: Type.STRING },
                      playful: { type: Type.STRING },
                    },
                  },
                  entertainmentAndMusic: { type: Type.ARRAY, items: { type: Type.STRING } },
                  gamesAndActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  foodAndDrinkHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                  socialMediaCaptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini model returned an empty response.');
      }

      const planData = JSON.parse(responseText);
      return res.json({ success: true, data: planData });
    } catch (err: any) {
      console.error('Error generating event plan via Gemini:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate event plan from Gemini API.',
      });
    }
  });

  // 2. Generate Themes and Creative Concepts
  app.post('/api/gemini/themes', async (req: Request, res: Response) => {
    try {
      const { category, themeOrStyle, guestCount, budget, currency, specialRequests } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is not configured in server environment secrets.',
          isApiKeyMissing: true,
        });
      }

      const prompt = `As a creative event concept director, generate 2 distinctly imaginative, cohesive celebration theme packages for:
Category: ${category}
Style Preference: ${themeOrStyle || 'Celebratory'}
Guest Count: ${guestCount || 50}
Budget: ${budget || 5000} ${currency || 'USD'}
Special Requests: ${specialRequests || 'None'}

Return a JSON array of 2 theme packages with title, tagline, detailed description, a 5-color palette (name and #HEX code), decor concepts, dress code guidelines, invitation wording (formal, modern, playful), music/entertainment ideas, interactive games/activities, food/cocktail pairings, and 3 social media captions.`;

      const response = await generateWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: 'You are a luxury creative event designer. Always return valid JSON array without markdown fences.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                themeTitle: { type: Type.STRING },
                tagline: { type: Type.STRING },
                description: { type: Type.STRING },
                palette: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      hex: { type: Type.STRING },
                    },
                  },
                },
                decorConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                dressCodeAdvice: { type: Type.STRING },
                invitationWording: {
                  type: Type.OBJECT,
                  properties: {
                    formal: { type: Type.STRING },
                    modern: { type: Type.STRING },
                    playful: { type: Type.STRING },
                  },
                },
                entertainmentAndMusic: { type: Type.ARRAY, items: { type: Type.STRING } },
                gamesAndActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                foodAndDrinkHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                socialMediaCaptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini model returned an empty themes response.');
      }

      const themes = JSON.parse(responseText);
      return res.json({ success: true, themes });
    } catch (err: any) {
      console.error('Error generating themes via Gemini:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate themes from Gemini API.',
      });
    }
  });

  // 3. Conversational AI Event Assistant
  app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
    try {
      const { message, eventContext, chatHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is not configured in server environment secrets.',
          isApiKeyMissing: true,
        });
      }

      const contextSummary = eventContext
        ? `CURRENT SAVED EVENT CONTEXT:
Name: ${eventContext.name}
Category: ${eventContext.category}
Date: ${eventContext.date}
Location: ${eventContext.location}
Guest Count: ${eventContext.guestCount}
Total Budget: ${eventContext.totalBudget} ${eventContext.currency}
Theme: ${eventContext.themeOrStyle}
Dietary constraints: ${eventContext.dietaryRequirements}
Special requests: ${eventContext.specialRequests}
Planned Expenses: ${eventContext.budget?.items?.reduce((acc: number, item: any) => acc + (item.actualCost || item.estimatedCost || 0), 0) || 0}
Pending Timeline Tasks: ${eventContext.timeline?.filter((t: any) => !t.completed).map((t: any) => t.title).slice(0, 5).join(', ') || 'None'}
Booked Vendors: ${eventContext.vendors?.filter((v: any) => v.status === 'Booked').map((v: any) => `${v.category}: ${v.name}`).join(', ') || 'None'}`
        : 'No specific event selected yet.';

      const systemPrompt = `You are Festiva AI Assistant, a wise, warm, and highly practical event planner.
You are helping the user plan their celebration.
Distinguish clearly between their actual saved event parameters and your creative advice or suggestions.
Be concise, well-structured (use bullet points and bolding), friendly, and actionable.
Suggest 2-3 specific, relevant followup actions or questions at the end of your response.

${contextSummary}`;

      const conversationParts = [];
      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        for (const msg of chatHistory.slice(-6)) {
          conversationParts.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
        }
      }
      conversationParts.push(`User: ${message}`);

      const response = await generateWithFallback(ai, {
        contents: conversationParts.join('\n\n'),
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const reply = response.text || 'I could not generate an answer right now.';
      return res.json({ success: true, reply });
    } catch (err: any) {
      console.error('Error in assistant API:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to process assistant question.',
      });
    }
  });

  // Client SPA serving & Vite integration
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Festiva AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Festiva AI server:', err);
  process.exit(1);
});
