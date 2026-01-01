
import { GoogleGenAI } from "@google/genai";
import { Order, MenuItem } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProBusinessInsights = async (orders: Order[], menu: MenuItem[]) => {
  try {
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const topItems = menu.slice(0, 3).map(m => m.name).join(', ');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        As a senior restaurant consultant for "Zenith Pro", analyze this premium performance data for an Indian restaurant:
        - Current Revenue: ₹${revenue.toFixed(2)}
        - Total Transactions: ${orders.length}
        - Top Menu Assets: ${topItems}
        
        Provide high-level strategic recommendations focusing on:
        1. Yield Management: How to optimize seating during peak Indian dinner hours?
        2. Menu Engineering: Suggested premium pairings (e.g., specific kebabs with biryani) or upselling tactics.
        3. Operational Excellence: A specific metric to track for staff performance in a high-volume Indian kitchen.
        
        Format: Return three extremely professional, data-driven bullet points.
      `,
    });
    return response.text || "Strategic data pending...";
  } catch (error) {
    console.error("Pro Insights Error:", error);
    return "Pro Intelligence module currently syncing.";
  }
};
