import type { ImagePart } from '../types';

export const generateContent = async (prompt: string, imagePart?: ImagePart): Promise<string> => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'chat', prompt, imagePart }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate content.');
        }
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error generating content:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
         const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'image', prompt }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate image.');
        }
        const data = await response.json();
        return data.imageUrl;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate image. Please try again.");
    }
};

export const generateVideo = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'video', prompt }),
        });

        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.error || 'Failed to generate video.');
        }
        
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate video. Please try again.");
    }
};
