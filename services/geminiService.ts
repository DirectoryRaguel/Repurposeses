
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { BrandingKit, BrandingInput, WebsiteElementSuggestion, Color, MarketingGraphicSuggestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const brandingSchema = {
  type: Type.OBJECT,
  properties: {
    colorPalette: {
      type: Type.ARRAY,
      description: "An array of 5 color objects for the website's branding.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Descriptive name of the color (e.g., 'Primary Blue')." },
          hex: { type: Type.STRING, description: "The hex code of the color, e.g., #0A74DA." }
        },
        required: ["name", "hex"]
      }
    },
    logoIdeas: {
      type: Type.ARRAY,
      description: "An array of 3 strings, each describing a unique logo concept in one or two sentences.",
      items: { type: Type.STRING }
    },
    typography: {
      type: Type.OBJECT,
      description: "Font pairings for headings and body text from Google Fonts.",
      properties: {
        heading: {
          type: Type.OBJECT,
          properties: {
            fontFamily: { type: Type.STRING, description: "Google Font name for headings (e.g., 'Poppins')." },
            fontWeight: { type: Type.STRING, description: "Recommended font weight for headings (e.g., '700')." }
          },
          required: ["fontFamily", "fontWeight"]
        },
        body: {
          type: Type.OBJECT,
          properties: {
            fontFamily: { type: Type.STRING, description: "Google Font name for body text (e.g., 'Lato')." },
            fontWeight: { type: Type.STRING, description: "Recommended font weight for body text (e.g., '400')." }
          },
          required: ["fontFamily", "fontWeight"]
        }
      },
      required: ["heading", "body"]
    }
  },
  required: ["colorPalette", "logoIdeas", "typography"]
};

const logoIdeasSchema = {
    type: Type.OBJECT,
    properties: {
        logoIdeas: {
            type: Type.ARRAY,
            description: "An array of 3 new, unique logo concept descriptions based on the feedback.",
            items: { type: Type.STRING }
        }
    },
    required: ["logoIdeas"]
};

const colorPaletteSchema = {
  type: Type.OBJECT,
  properties: {
    colorPalette: {
      type: Type.ARRAY,
      description: "An array of 5 new color objects based on the provided theme.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Descriptive name of the color." },
          hex: { type: Type.STRING, description: "The hex code of the color." }
        },
        required: ["name", "hex"]
      }
    }
  },
  required: ["colorPalette"]
};

const websiteElementSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      elementName: { type: Type.STRING, description: "The name of the website element being described." },
      description: { type: Type.STRING, description: "A detailed description and design suggestion for this element, consistent with the branding." },
      visualIdeas: {
        type: Type.ARRAY,
        description: "A list of 2-3 concrete visual ideas. For each idea, provide a user-friendly description and a separate, detailed prompt for an AI image generator.",
        items: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING, description: "The user-friendly description of the visual idea." },
                prompt: { type: Type.STRING, description: "A detailed, context-rich prompt for an AI image generator like Midjourney or DALL-E." }
            },
            required: ["description", "prompt"]
        }
      }
    },
    required: ["elementName", "description", "visualIdeas"]
  }
};

const marketingGraphicSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            graphicName: { type: Type.STRING, description: "The name of the marketing graphic format (e.g., 'Instagram Post')." },
            description: { type: Type.STRING, description: "A detailed description of the design template, including placeholders for user content." },
            prompt: { type: Type.STRING, description: "A detailed, self-contained prompt for an AI image generator to create this template." }
        },
        required: ["graphicName", "description", "prompt"]
    }
};

const imageFileToGenerativePart = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
    return {
        inlineData: {
            mimeType: file.type,
            data: base64,
        },
    };
};

const base64ToGenerativePart = (base64: string, mimeType: string = 'image/png') => {
    return {
        inlineData: {
            mimeType,
            data: base64
        }
    };
};


const parseJsonResponse = <T>(rawText: string): T => {
    let jsonText = rawText.trim();
    
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
    }
    
    return JSON.parse(jsonText) as T;
};


export const generateBranding = async (
    input: BrandingInput,
    inspiration: { logo: File | null; images: File[] }
): Promise<BrandingKit> => {
  try {
    if (input.type === 'url') {
      const prompt = `You are a world-class branding and design expert. Your task is to analyze the provided website URL and generate a professional branding kit.
URL to analyze: "${input.value}"

Use your search tool to access and analyze the content, visual design, target audience, and overall purpose of the website at this URL. You should also research competitor websites in the same niche to understand industry standards and identify opportunities for unique branding. Based on this comprehensive analysis, create a cohesive and compelling branding kit.

Your response MUST be a single, valid JSON object and nothing else. Do not include any explanatory text before or after the JSON object. The JSON object must conform to the following TypeScript interface:
\`\`\`typescript
interface BrandingKit {
  colorPalette: { name: string; hex: string; }[]; // An array of 5 color objects.
  logoIdeas: string[]; // An array of 3 unique logo concept descriptions.
  typography: {
    heading: { fontFamily: string; fontWeight: string; };
    body: { fontFamily: string; fontWeight: string; };
  };
}
\`\`\`
`;
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
              tools: [{googleSearch: {}}],
          },
      });

      return parseJsonResponse<BrandingKit>(response.text);

    } else { // type === 'description'
        const basePrompt = `You are a world-class branding and design expert. Your task is to generate a professional branding kit based on the following description. Analyze the description to understand the brand's essence, target audience, and niche. Then, using your expert knowledge of design principles and industry standards, create a comprehensive branding kit.

      Brand Description: "${input.value}"

      The branding kit should include:
      1.  A color palette with 5 colors (e.g., primary, secondary, accent, neutral-light, neutral-dark). For each color, provide a descriptive name and its hex code.
      2.  Three distinct and creative logo ideas. Describe each concept in one or two sentences.
      3.  A typography scale. Suggest one font for headings and one for body text. Choose modern, legible, and web-safe fonts from the Google Fonts library (e.g., Poppins, Lato, Roboto, Open Sans, Montserrat, Merriweather). Provide the font name and a recommended weight (e.g., 400 for regular, 700 for bold).`;
      
        const inspirationPrompt = `
        
CRITICAL INSTRUCTION: The user has provided visual inspiration (an existing logo and/or reference images). You MUST analyze these visuals to heavily influence the generated branding kit. The new branding should feel like an evolution or professional refinement of the provided assets.
- The color palette should be directly derived from or be perfectly complementary to the colors found in the uploaded images.
- The logo ideas should be inspired by the uploaded logo but offer creative variations or improvements.
- The typography choices should match the mood and style of the visuals.
        `;
        
        const hasInspiration = inspiration.logo || inspiration.images.length > 0;
        const prompt = hasInspiration ? basePrompt + inspirationPrompt : basePrompt;

        const parts: any[] = [{ text: prompt }];

        if (inspiration.logo) {
            parts.push({text: "\n\nThis is the user's current logo for reference:"});
            parts.push(await imageFileToGenerativePart(inspiration.logo));
        }
        if (inspiration.images.length > 0) {
            parts.push({text: "\n\nThese are additional inspiration images from the user:"});
            for (const image of inspiration.images) {
                parts.push(await imageFileToGenerativePart(image));
            }
        }

      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: { parts },
          config: {
              responseMimeType: "application/json",
              responseSchema: brandingSchema,
          },
      });
      
      return parseJsonResponse<BrandingKit>(response.text);
    }
  } catch (error) {
    console.error("Error generating branding kit:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate branding kit: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the branding kit.");
  }
};

export const regenerateLogoIdeas = async (
    originalInput: BrandingInput,
    brandingKit: Omit<BrandingKit, 'logoIdeas'>,
    feedback: string
): Promise<string[]> => {
    try {
        const prompt = `You are a world-class branding expert acting as a design consultant. A branding kit has been generated for a client, and they want new logo ideas.

Original Request: ${originalInput.type === 'url' ? `Analysis of URL: ${originalInput.value}` : `Brand Description: "${originalInput.value}"`}

Current Branding (Colors & Fonts):
- Color Palette: ${brandingKit.colorPalette.map(c => `${c.name} (${c.hex})`).join(', ')}
- Typography: Heading: ${brandingKit.typography.heading.fontFamily}, Body: ${brandingKit.typography.body.fontFamily}

User Feedback for New Logos: "${feedback || 'The user did not provide specific feedback, please generate three new and different ideas.'}"

Based on all this information, generate 3 new, creative, and distinct logo concepts that are consistent with the established visual identity but better aligned with the user's feedback.
`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: logoIdeasSchema,
            },
        });
        const result = parseJsonResponse<{ logoIdeas: string[] }>(response.text);
        return result.logoIdeas;
    } catch (error) {
        console.error("Error regenerating logo ideas:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to regenerate logos: ${error.message}`);
        }
        throw new Error("An unknown error occurred while regenerating the logo ideas.");
    }
};

export const regenerateColorPalette = async (
    originalInput: BrandingInput,
    brandingKit: Omit<BrandingKit, 'colorPalette'>,
    theme: string
): Promise<Color[]> => {
    try {
        const prompt = `You are a world-class branding expert. A branding kit has been generated, and the user wants a new color palette based on a theme.

Original Request: ${originalInput.type === 'url' ? `Analysis of URL: ${originalInput.value}` : `Brand Description: "${originalInput.value}"`}

Current Branding (Fonts & Logo Style):
- Typography: Heading: ${brandingKit.typography.heading.fontFamily}, Body: ${brandingKit.typography.body.fontFamily}
- Logo Direction: ${brandingKit.logoIdeas[0]}

New Palette Theme: "${theme}"

Based on the original request and the new theme, generate a new, cohesive 5-color palette. The palette should be consistent with the brand's identity but reflect the chosen theme.
`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: colorPaletteSchema,
            },
        });
        const result = parseJsonResponse<{ colorPalette: Color[] }>(response.text);
        return result.colorPalette;
    } catch (error) {
        console.error("Error regenerating color palette:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to regenerate palette: ${error.message}`);
        }
        throw new Error("An unknown error occurred while regenerating the color palette.");
    }
};

export const getColorName = async (hex: string): Promise<string> => {
    try {
        const prompt = `Provide a common, descriptive name for the hex color "${hex}". Respond with only the name and nothing else. For example, for #FF0000, you would respond "Red".`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        // Simple response, no JSON parsing needed
        return response.text.trim();
    } catch (error) {
        console.error(`Error getting color name for ${hex}:`, error);
        // Fallback to a generic name or the hex code itself
        return "Custom Color";
    }
};


export const generateWebsiteElements = async (
    brandingKit: BrandingKit,
    elements: string[]
): Promise<WebsiteElementSuggestion[]> => {
    try {
        const prompt = `You are a world-class UI/UX and brand designer acting as a prompt engineer. A branding kit has been finalized. Your task is to generate design concepts for a list of specific website elements, ensuring they are perfectly consistent with the established brand identity.

Finalized Branding Kit:
- Color Palette: ${brandingKit.colorPalette.map(c => `${c.name} (${c.hex})`).join(', ')}
- Typography: Heading: ${brandingKit.typography.heading.fontFamily} (${brandingKit.typography.heading.fontWeight}), Body: ${brandingKit.typography.body.fontFamily} (${brandingKit.typography.body.fontWeight})
- Logo Style Direction: The logo ideas lean towards this style: "${brandingKit.logoIdeas[0]}"

Website Elements to Design: ${elements.join(', ')}

For each element requested, provide a detailed description of how it should look and feel. Then, for each of its 'visualIdeas', you MUST provide two fields:
1. 'description': A clear, user-facing description of the concept.
2. 'prompt': A detailed, self-contained prompt suitable for a separate AI image generator (like Midjourney or DALL-E). This prompt should be highly descriptive, include artistic direction (e.g., 'flat lay photograph', 'minimalist vector art'), technical details (e.g., '16:9 aspect ratio'), and explicitly reference the brand's hex colors and themes. It must not assume any prior context.

**Example for a 'prompt' field**: "photograph, flat lay of a modern workspace, light wood desk, a minimalist coffee bag with a logo of a bean and power button in ${brandingKit.colorPalette[0].hex}, a steaming ceramic mug in ${brandingKit.colorPalette[2].hex}, a sleek laptop, and a notebook. Soft natural morning light, warm tones, professional product photography, hyper-realistic, 16:9 aspect ratio --style raw"
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: websiteElementSchema,
            },
        });
        return parseJsonResponse<WebsiteElementSuggestion[]>(response.text);

    } catch (error) {
        console.error("Error generating website elements:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate website elements: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating website elements.");
    }
};

export const generateMarketingGraphics = async (
    brandingKit: BrandingKit,
    graphics: string[]
): Promise<MarketingGraphicSuggestion[]> => {
    try {
        const promptForText = `You are a world-class creative director and prompt engineer. A branding kit has been finalized. Your task is to generate design concepts for social media and ad graphics.

Finalized Branding Kit:
- Color Palette: ${brandingKit.colorPalette.map(c => `${c.name} (${c.hex})`).join(', ')}
- Typography: Heading: ${brandingKit.typography.heading.fontFamily}, Body: ${brandingKit.typography.body.fontFamily}
- Logo Style Direction: "${brandingKit.logoIdeas[0]}"

Marketing Graphics to Design: ${graphics.join(', ')}

For each graphic, create a template concept. The template must have clear placeholder areas for user-provided content. Specifically describe:
- A placeholder for a background image or graphic.
- A safe area for text like a slogan or value proposition.
- A subtle placement for the brand's logo.

For each graphic, provide:
1. 'graphicName': The name of the format.
2. 'description': A clear description of the template's layout and style.
3. 'prompt': A detailed, self-contained prompt for the 'gemini-2.5-flash-image' model. This prompt should generate a visual example of the template. It must be consistent with the brand kit, specify the correct aspect ratio, and include visual cues for the placeholder areas (e.g., "a semi-transparent grey box that says 'Your Image Here'").
`;

        const textResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptForText,
            config: {
                responseMimeType: "application/json",
                responseSchema: marketingGraphicSchema,
            },
        });

        type TextSuggestion = { graphicName: string; description: string; prompt: string; };
        const textSuggestions = parseJsonResponse<TextSuggestion[]>(textResponse.text);

        const suggestionsWithImages: MarketingGraphicSuggestion[] = await Promise.all(
            textSuggestions.map(async (suggestion) => {
                const imageResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [{ text: suggestion.prompt }],
                    },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                });

                let base64Image = '';
                for (const part of imageResponse.candidates[0].content.parts) {
                    if (part.inlineData) {
                        base64Image = part.inlineData.data;
                        break;
                    }
                }
                
                if (!base64Image) {
                    console.warn(`Could not generate image for ${suggestion.graphicName}`);
                }

                return {
                    ...suggestion,
                    base64Image,
                };
            })
        );

        return suggestionsWithImages;

    } catch (error) {
        console.error("Error generating marketing graphics:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate marketing graphics: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating marketing graphics.");
    }
};

export const generateSampleOutcome = async (
    brandingKit: BrandingKit,
    outcomeType: string,
    feedback?: string
): Promise<string> => { // Returns base64 image string
    try {
        let prompt = `You are a world-class brand visualization AI. Your task is to create a realistic, high-quality mockup for a brand based on its established branding kit.

        **Branding Kit:**
        - **Color Palette:** ${brandingKit.colorPalette.map(c => `${c.name}: ${c.hex}`).join(', ')}. The primary color is ${brandingKit.colorPalette[0].hex}.
        - **Typography:** Headings use '${brandingKit.typography.heading.fontFamily}', Body text uses '${brandingKit.typography.body.fontFamily}'.
        - **Logo Style Direction:** The logo is described as: "${brandingKit.logoIdeas[0]}".

        **Mockup Request:** Generate a "${outcomeType}".

        **Instructions:**
        - The design must STRICTLY adhere to the provided branding kit.
        - The visual should be clean, professional, and visually appealing.
        - For a 'Website Mockup', show the above-the-fold hero section of a homepage.
        - For a 'Business Card', show a front and back design on a realistic surface.
        - For a 'Social Media Profile', show a profile picture and a banner image for a platform like Instagram or X.
        - For an 'App Icon', create a modern, recognizable iOS app icon.
        - The final image should be a photorealistic rendering of the mockup.
        `;

        if (feedback) {
            prompt += `\n\n**User Feedback for Regeneration:** The user was not satisfied with the previous version. You MUST incorporate the following feedback to create a new, improved version: "${feedback}"`;
        }

        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("No image data was returned from the model.");

    } catch (error) {
        console.error(`Error generating sample outcome for ${outcomeType}:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate sample outcome: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the sample outcome.");
    }
};

export const generateFinalAssetImage = async (
    brandingKit: BrandingKit,
    likedSamples: { name: string; image: string }[],
    assetName: string,
    assetType: 'element' | 'graphic'
): Promise<string> => {
    try {
        const parts: any[] = [];
        const prompt = `You are an expert brand asset designer. Your task is to generate a single, high-quality image for a specific brand asset.

        **1. Core Branding Kit (The Foundation):**
        - **Color Palette:** ${brandingKit.colorPalette.map(c => `${c.name}: ${c.hex}`).join(', ')}. Primary color is ${brandingKit.colorPalette[0].hex}.
        - **Typography:** Headings: '${brandingKit.typography.heading.fontFamily}', Body: '${brandingKit.typography.body.fontFamily}'.
        - **Logo Style Direction:** "${brandingKit.logoIdeas[0]}".

        **2. Visual Style Direction (The "Look and Feel"):**
        The user has approved the following mockups. These images are your PRIMARY VISUAL REFERENCE. The asset you generate must match the aesthetic, complexity, and overall style demonstrated in these images.
        `;
        parts.push({ text: prompt });

        for (const sample of likedSamples) {
            parts.push({ text: `\n- Approved Mockup: ${sample.name}`});
            parts.push(base64ToGenerativePart(sample.image));
        }

        const finalInstruction = `
        **3. Your Task:**
        Based on ALL the information above (Core Branding Kit AND Visual Style Direction), generate a single, clean, professional image for the following brand asset: **"${assetName}"**.

        The image should be a final, polished asset, not a template or a placeholder.
        `;
        parts.push({ text: finalInstruction });

        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("No image data was returned from the model for the final asset.");

    } catch (error) {
        console.error(`Error generating final asset for ${assetName}:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate final asset: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the final asset.");
    }
}
