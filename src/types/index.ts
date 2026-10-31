/**
 * Festiva AI Data Types & Models
 */

export type EventCategory =
  | 'Wedding'
  | 'Birthday'
  | 'Anniversary'
  | 'College Festival'
  | 'Corporate Event'
  | 'Community Gathering'
  | 'Custom';

export type VenuePreference = 'Indoor' | 'Outdoor' | 'Hybrid / Either' | 'Destination';

export type PlanningStyle = 'Relaxed & Delegated' | 'Balanced & Structured' | 'Hands-On & Detailed';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
}

export interface BudgetItem {
  id: string;
  category: string;
  estimatedCost: number;
  actualCost: number;
  percentage: number;
  notes?: string;
  isCustom?: boolean;
}

export interface BudgetSummary {
  totalBudget: number;
  currency: CurrencyCode;
  items: BudgetItem[];
}

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  phase: 'Several Weeks Before' | 'Month Before' | 'Final Week' | 'Day Before' | 'Event Day';
  daysBeforeEvent: number;
  suggestedDeadline: string; // ISO date or formatted
  priority: PriorityLevel;
  completed: boolean;
}

export type VendorStatus = 'Researching' | 'Contacted' | 'Quoted' | 'Booked' | 'Declined';

export interface VendorItem {
  id: string;
  category: string;
  name: string;
  contactPerson?: string;
  phoneOrEmail?: string;
  status: VendorStatus;
  estimatedCost: number;
  confirmedCost?: number;
  deadline?: string;
  notes?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ThemeCreativeIdea {
  id: string;
  themeTitle: string;
  tagline: string;
  description: string;
  palette: ColorSwatch[];
  decorConcepts: string[];
  dressCodeAdvice: string;
  invitationWording: {
    formal: string;
    modern: string;
    playful: string;
  };
  entertainmentAndMusic: string[];
  gamesAndActivities: string[];
  foodAndDrinkHighlights: string[];
  socialMediaCaptions: string[];
}

export interface EventOverviewPlan {
  summary: string;
  recommendedTheme: string;
  decorAtmosphere: string[];
  venueSelectionCriteria: string[];
  foodAndCateringConcepts: string[];
  entertainmentOptions: string[];
  guestExperienceFlow: string[];
  risksAndContingencies: {
    risk: string;
    mitigation: string;
  }[];
  generatedAt: string;
}

export interface EventRecord {
  id: string;
  name: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: CurrencyCode;
  themeOrStyle: string;
  venuePreference: VenuePreference;
  dietaryRequirements: string;
  specialRequests: string;
  planningStyle: PlanningStyle;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;

  // Associated Planner Modules
  overviewPlan?: EventOverviewPlan;
  budget: BudgetSummary;
  timeline: TimelineTask[];
  vendors: VendorItem[];
  themeIdeas?: ThemeCreativeIdea[];
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  referencedContext?: string;
}

export type ActiveTab =
  | 'overview'
  | 'budget'
  | 'timeline'
  | 'vendors'
  | 'themes'
  | 'assistant';
