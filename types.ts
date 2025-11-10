
export interface Color {
  name: string;
  hex: string;
}

export interface TypographyStyle {
  fontFamily: string;
  fontWeight: string;
}

export interface Typography {
  heading: TypographyStyle;
  body: TypographyStyle;
}

export interface BrandingKit {
  colorPalette: Color[];
  logoIdeas: string[];
  typography: Typography;
}

export type BrandingInput =
  | { type: 'description'; value: string }
  | { type: 'url'; value: string };

export interface Task {
    id: number;
    text: string;
}

export interface VisualIdea {
  description: string; // The user-facing text
  prompt: string;      // The detailed, copyable prompt for an image generator
}

export interface WebsiteElementSuggestion {
    elementName: string;
    description: string;
    visualIdeas: VisualIdea[];
}

export interface MarketingGraphicSuggestion {
  graphicName: string;
  description: string;
  prompt: string;
  base64Image: string; // The generated preview image
}

export interface SampleOutcome {
  name: string;
  icon: string;
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
  isLiked: boolean;
  feedback: string;
}

export interface FinalAsset {
  name: string;
  type: 'element' | 'graphic';
  base64Image: string;
}
