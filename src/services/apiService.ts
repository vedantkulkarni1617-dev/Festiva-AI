import {
  EventRecord,
  EventOverviewPlan,
  BudgetSummary,
  TimelineTask,
  VendorItem,
  ThemeCreativeIdea,
  EventCategory,
  CurrencyCode,
} from '../types';

export interface GeneratePlanParams {
  name: string;
  category: EventCategory;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: CurrencyCode;
  themeOrStyle: string;
  venuePreference: string;
  dietaryRequirements: string;
  specialRequests: string;
  planningStyle: string;
}

export interface ApiHealthResponse {
  status: string;
  hasApiKey: boolean;
  environment: string;
  time: string;
}

export class ApiService {
  /**
   * Check backend health and Gemini API key availability
   */
  static async checkHealth(): Promise<ApiHealthResponse> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check returned non-200');
      return await res.json();
    } catch {
      return {
        status: 'error',
        hasApiKey: false,
        environment: 'unknown',
        time: new Date().toISOString(),
      };
    }
  }

  /**
   * Request full AI plan generation from Gemini
   */
  static async generateEventPlan(params: GeneratePlanParams): Promise<{
    overviewPlan: EventOverviewPlan;
    budget: BudgetSummary;
    timeline: TimelineTask[];
    vendors: VendorItem[];
    themeIdeas: ThemeCreativeIdea[];
  }> {
    const res = await fetch('/api/gemini/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to generate event plan from server.');
      err.isApiKeyMissing = data.isApiKeyMissing;
      throw err;
    }

    const { overviewPlan, budgetItems, timelineTasks, vendorChecklist, themeIdea } = data.data;

    // Process budget items with IDs and recalculate exact percentages
    const processedBudgetItems = (budgetItems || []).map((item: any, idx: number) => ({
      id: `b-gen-${idx + 1}`,
      category: item.category || 'General',
      estimatedCost: Number(item.estimatedCost) || 0,
      actualCost: Number(item.estimatedCost) || 0,
      percentage: params.totalBudget > 0 ? Math.round(((Number(item.estimatedCost) || 0) / params.totalBudget) * 1000) / 10 : 0,
      notes: item.notes || '',
    }));

    // Process timeline tasks with date computation
    const eventDate = new Date(params.date);
    const processedTimeline: TimelineTask[] = (timelineTasks || []).map((task: any, idx: number) => {
      const days = Number(task.daysBeforeEvent) || 7;
      const taskDate = new Date(eventDate.getTime() - days * 24 * 60 * 60 * 1000);
      return {
        id: `t-gen-${idx + 1}`,
        title: task.title || `Task #${idx + 1}`,
        description: task.description || '',
        phase: (task.phase as any) || 'Several Weeks Before',
        daysBeforeEvent: days,
        suggestedDeadline: isNaN(taskDate.getTime()) ? params.date : taskDate.toISOString().split('T')[0],
        priority: (task.priority as any) || 'Medium',
        completed: false,
      };
    });

    // Process vendors
    const processedVendors: VendorItem[] = (vendorChecklist || []).map((v: any, idx: number) => ({
      id: `v-gen-${idx + 1}`,
      category: v.category || 'General Vendor',
      name: v.name || `${v.category} Provider`,
      status: 'Researching',
      estimatedCost: Number(v.estimatedCost) || 0,
      notes: v.notes || '',
    }));

    const processedThemes: ThemeCreativeIdea[] = themeIdea
      ? [
          {
            id: 'th-gen-1',
            themeTitle: themeIdea.themeTitle || `${params.name} Signature Aesthetic`,
            tagline: themeIdea.tagline || 'Curated by Festiva AI',
            description: themeIdea.description || '',
            palette: Array.isArray(themeIdea.palette) ? themeIdea.palette : [],
            decorConcepts: Array.isArray(themeIdea.decorConcepts) ? themeIdea.decorConcepts : [],
            dressCodeAdvice: themeIdea.dressCodeAdvice || 'Celebration Chic',
            invitationWording: themeIdea.invitationWording || {
              formal: 'We invite you to celebrate with us.',
              modern: 'Join us for a wonderful gathering.',
              playful: 'Let’s celebrate together!',
            },
            entertainmentAndMusic: Array.isArray(themeIdea.entertainmentAndMusic) ? themeIdea.entertainmentAndMusic : [],
            gamesAndActivities: Array.isArray(themeIdea.gamesAndActivities) ? themeIdea.gamesAndActivities : [],
            foodAndDrinkHighlights: Array.isArray(themeIdea.foodAndDrinkHighlights) ? themeIdea.foodAndDrinkHighlights : [],
            socialMediaCaptions: Array.isArray(themeIdea.socialMediaCaptions) ? themeIdea.socialMediaCaptions : [],
          },
        ]
      : [];

    return {
      overviewPlan: {
        summary: overviewPlan?.summary || 'Tailored celebration blueprint.',
        recommendedTheme: overviewPlan?.recommendedTheme || params.themeOrStyle || 'Celebration Style',
        decorAtmosphere: Array.isArray(overviewPlan?.decorAtmosphere) ? overviewPlan.decorAtmosphere : [],
        venueSelectionCriteria: Array.isArray(overviewPlan?.venueSelectionCriteria) ? overviewPlan.venueSelectionCriteria : [],
        foodAndCateringConcepts: Array.isArray(overviewPlan?.foodAndCateringConcepts) ? overviewPlan.foodAndCateringConcepts : [],
        entertainmentOptions: Array.isArray(overviewPlan?.entertainmentOptions) ? overviewPlan.entertainmentOptions : [],
        guestExperienceFlow: Array.isArray(overviewPlan?.guestExperienceFlow) ? overviewPlan.guestExperienceFlow : [],
        risksAndContingencies: Array.isArray(overviewPlan?.risksAndContingencies) ? overviewPlan.risksAndContingencies : [],
        generatedAt: new Date().toISOString(),
      },
      budget: {
        totalBudget: params.totalBudget,
        currency: params.currency,
        items: processedBudgetItems,
      },
      timeline: processedTimeline,
      vendors: processedVendors,
      themeIdeas: processedThemes,
    };
  }

  /**
   * Request extra theme generations from Gemini
   */
  static async generateThemes(params: {
    category: EventCategory;
    themeOrStyle: string;
    guestCount: number;
    budget: number;
    currency: CurrencyCode;
    specialRequests?: string;
  }): Promise<ThemeCreativeIdea[]> {
    const res = await fetch('/api/gemini/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate creative themes.');
    }

    return (data.themes || []).map((t: any, idx: number) => ({
      id: `th-more-${Date.now()}-${idx}`,
      themeTitle: t.themeTitle || 'Unique Theme Concept',
      tagline: t.tagline || 'Artfully Conceived',
      description: t.description || '',
      palette: Array.isArray(t.palette) ? t.palette : [],
      decorConcepts: Array.isArray(t.decorConcepts) ? t.decorConcepts : [],
      dressCodeAdvice: t.dressCodeAdvice || 'Cocktail Attire',
      invitationWording: t.invitationWording || { formal: '', modern: '', playful: '' },
      entertainmentAndMusic: Array.isArray(t.entertainmentAndMusic) ? t.entertainmentAndMusic : [],
      gamesAndActivities: Array.isArray(t.gamesAndActivities) ? t.gamesAndActivities : [],
      foodAndDrinkHighlights: Array.isArray(t.foodAndDrinkHighlights) ? t.foodAndDrinkHighlights : [],
      socialMediaCaptions: Array.isArray(t.socialMediaCaptions) ? t.socialMediaCaptions : [],
    }));
  }

  /**
   * Send question to contextual AI Event Assistant
   */
  static async askAssistant(
    message: string,
    eventContext: EventRecord,
    chatHistory: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<string> {
    const res = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, eventContext, chatHistory }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to get answer from AI Assistant.');
    }
    return data.reply;
  }

  /**
   * Offline/Curated fallback template generator matching exact user parameters
   */
  static generateCuratedBlueprint(params: GeneratePlanParams): {
    overviewPlan: EventOverviewPlan;
    budget: BudgetSummary;
    timeline: TimelineTask[];
    vendors: VendorItem[];
    themeIdeas: ThemeCreativeIdea[];
  } {
    const total = params.totalBudget || 5000;
    const cat = params.category;
    const eventDate = new Date(params.date);

    // Distribution breakdown
    const ratios: Record<string, number> = {
      'Venue & Location Rental': 0.32,
      'Catering, Drinks & Cake': 0.35,
      'Photography & Visual Memories': 0.11,
      'Decorations, Lighting & Florals': 0.09,
      'Music, Sound & Entertainment': 0.06,
      'Invitations & Guest Collateral': 0.02,
      'Contingency & Incidentals Buffer': 0.05,
    };

    const budgetItems = Object.entries(ratios).map(([name, pct], idx) => {
      const est = Math.round(total * pct);
      return {
        id: `b-cur-${idx + 1}`,
        category: name,
        estimatedCost: est,
        actualCost: est,
        percentage: Math.round(pct * 100),
        notes: `Estimated allocation for ${cat} planning.`,
      };
    });

    const taskTemplates = [
      {
        title: 'Confirm and secure primary venue reservation',
        desc: `Inspect accessibility, acoustics, and curfew for ${params.guestCount} guests.`,
        days: 42,
        phase: 'Several Weeks Before' as const,
        priority: 'High' as const,
      },
      {
        title: 'Interview & shortlist catering options',
        desc: `Review menu selections accommodating: ${params.dietaryRequirements || 'standard diet'}.`,
        days: 35,
        phase: 'Several Weeks Before' as const,
        priority: 'High' as const,
      },
      {
        title: 'Send out invitations and track RSVP headcounts',
        desc: 'Gather confirmations, dietary needs, and song requests.',
        days: 28,
        phase: 'Month Before' as const,
        priority: 'Medium' as const,
      },
      {
        title: 'Finalize decoration scheme and lighting layout',
        desc: `Align setup with preferred style: ${params.themeOrStyle || 'Celebratory'}.`,
        days: 21,
        phase: 'Month Before' as const,
        priority: 'Medium' as const,
      },
      {
        title: 'Coordinate playlist and sound equipment check',
        desc: 'Test microphones, background playlists, and special announcement cues.',
        days: 7,
        phase: 'Final Week' as const,
        priority: 'High' as const,
      },
      {
        title: 'Confirm final headcount with caterer and venue',
        desc: `Lock final guest tally (${params.guestCount} expected) and table layouts.`,
        days: 4,
        phase: 'Final Week' as const,
        priority: 'High' as const,
      },
      {
        title: 'Stage day-of coordinator binder and emergency kit',
        desc: 'Pack scissors, extra tape, power strips, first aid, and vendor contacts list.',
        days: 1,
        phase: 'Day Before' as const,
        priority: 'Medium' as const,
      },
      {
        title: 'Vendor load-in, decor setup, and sound check',
        desc: 'Verify setup completion 90 minutes before guest arrival.',
        days: 0,
        phase: 'Event Day' as const,
        priority: 'High' as const,
      },
    ];

    const timeline: TimelineTask[] = taskTemplates.map((t, idx) => {
      const taskDate = new Date(eventDate.getTime() - t.days * 24 * 60 * 60 * 1000);
      return {
        id: `t-cur-${idx + 1}`,
        title: t.title,
        description: t.desc,
        phase: t.phase,
        daysBeforeEvent: t.days,
        suggestedDeadline: isNaN(taskDate.getTime()) ? params.date : taskDate.toISOString().split('T')[0],
        priority: t.priority,
        completed: false,
      };
    });

    const vendors: VendorItem[] = [
      {
        id: 'v-cur-1',
        category: 'Venue',
        name: 'Premier Celebration Space',
        status: 'Researching',
        estimatedCost: Math.round(total * 0.32),
        notes: `Selected for ${params.venuePreference || 'convenient'} preference.`,
      },
      {
        id: 'v-cur-2',
        category: 'Caterer',
        name: 'Gourmet Feast Catering Co.',
        status: 'Researching',
        estimatedCost: Math.round(total * 0.35),
        notes: `Accommodates: ${params.dietaryRequirements || 'Flexible dietary options'}.`,
      },
      {
        id: 'v-cur-3',
        category: 'Photographer',
        name: 'Storyline Media & Stills',
        status: 'Researching',
        estimatedCost: Math.round(total * 0.11),
        notes: 'Full ceremony & celebration documentation package.',
      },
      {
        id: 'v-cur-4',
        category: 'Decor & Florals',
        name: 'Aura Event Styling Studio',
        status: 'Researching',
        estimatedCost: Math.round(total * 0.09),
        notes: `Palette centered around ${params.themeOrStyle || 'Celebration Elegance'}.`,
      },
    ];

    const themeIdeas: ThemeCreativeIdea[] = [
      {
        id: 'th-cur-1',
        themeTitle: `${params.themeOrStyle || 'Signature Elegance'} Concept`,
        tagline: 'Festiva AI Curated Celebration Blueprint',
        description: `An immersive, stylish experience engineered specifically for this ${cat}. Balances atmosphere, culinary delight, and memorable guest interactions.`,
        palette: [
          { name: 'Royal Indigo', hex: '#4338CA' },
          { name: 'Warm Coral', hex: '#F43F5E' },
          { name: 'Champagne Cream', hex: '#FEF3C7' },
          { name: 'Deep Slate', hex: '#0F172A' },
          { name: 'Soft Rose', hex: '#FDA4AF' },
        ],
        decorConcepts: [
          'Ambient atmospheric warm string lighting and uplights along perimeter',
          'Clean geometric centerpieces with natural seasonal greenery and floral blooms',
          'Custom welcome greeting station with hand-lettered milestone board',
        ],
        dressCodeAdvice: 'Festive Cocktail Attire — comfortable yet sharp, embracing the celebration palette.',
        invitationWording: {
          formal: `You are cordially invited to celebrate ${params.name} on ${params.date} at ${params.location || 'our celebration venue'}.`,
          modern: `Save the date! Join us to celebrate ${params.name}. Great company, music, and unforgettable moments await.`,
          playful: `Get ready to celebrate! ${params.name} is happening and it won't be the same without you.`,
        },
        entertainmentAndMusic: [
          'Curated low-tempo acoustic and jazz playlist for arrivals and dining',
          'High-energy crowd favorites and celebratory dance set for the evening',
        ],
        gamesAndActivities: [
          'Memory capture station with guest polaroid board and handwritten cards',
          'Milestone trivia quiz highlighting fun stories and memories',
        ],
        foodAndDrinkHighlights: [
          'Signature celebration spritz cocktail with citrus garnish',
          'Passed gourmet sliders and artisan flatbread skewers',
          'Tiered celebration dessert showcase with petite pastries',
        ],
        socialMediaCaptions: [
          `Celebrating ${params.name} in style! 🎉✨ #FestivaMoments`,
          'Moments to cherish forever with the best people. ❤️🥂',
        ],
      },
    ];

    return {
      overviewPlan: {
        summary: `A personalized ${cat} plan for ${params.guestCount} guests, harmonizing budget efficiency with a memorable celebration atmosphere.`,
        recommendedTheme: params.themeOrStyle || 'Celebration Splendor',
        decorAtmosphere: [
          'Warm ambient lighting tailored for twilight and evening transition',
          'Statement welcome arch and focal photo area for guest keepsakes',
          'Harmonious tabletop styling emphasizing texture and refined accents',
        ],
        venueSelectionCriteria: [
          `Comfortably hosts ${params.guestCount} seated guests with dancing area`,
          `Matches preferred ${params.venuePreference || 'indoor/outdoor'} environment with weather backup`,
          'Convenient accessibility and parking options for attending guests',
        ],
        foodAndCateringConcepts: [
          'Appetizer mingling hour with 3-4 diverse bite-sized selections',
          'Two main entrée offerings plus dedicated vegetarian/dietary options',
          'Custom dessert station paired with coffee, tea, and signature mocktails',
        ],
        entertainmentOptions: [
          'Professional sound setup with dual wireless microphones for speeches',
          'Carefully paced musical flow transitioning from welcoming to lively',
        ],
        guestExperienceFlow: [
          'Arrival & Welcome Drinks mingling',
          'Main celebration opening, toasts, and program',
          'Culinary service and dinner conversation',
          'Music, celebration activities, and dance floor opening',
          'Sweet farewell send-off',
        ],
        risksAndContingencies: [
          {
            risk: 'Weather fluctuations or seasonal temperature changes',
            mitigation: 'Establish venue indoor backup or reserve patio heating/canopy 5 days ahead.',
          },
          {
            risk: 'Last-minute dietary requirement changes',
            mitigation: 'Direct caterer to keep 5% buffer of vegetarian/GF meals on standby.',
          },
        ],
        generatedAt: new Date().toISOString(),
      },
      budget: {
        totalBudget: total,
        currency: params.currency,
        items: budgetItems,
      },
      timeline,
      vendors,
      themeIdeas,
    };
  }
}
