import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { ImagePart } from '../types';

// This function will be deployed as a Vercel Serverless Function
// It's the secure backend that communicates with the Gemini API.

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!process.env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API_KEY environment variable not set' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const { action, prompt, imagePart } = await req.json();

        switch (action) {
            case 'chat':
                return await handleChat(ai, prompt, imagePart);
            case 'image':
                return await handleImage(ai, prompt);
            case 'video':
                return await handleVideo(ai, prompt);
            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
        }
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

async function handleChat(ai: GoogleGenAI, prompt: string, imagePart?: ImagePart) {
    const contents = imagePart ? { parts: [{ text: prompt }, imagePart] } : prompt;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
    });
    return new Response(JSON.stringify({ text: response.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

async function handleImage(ai: GoogleGenAI, prompt: string) {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
    return new Response(JSON.stringify({ imageUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

async function handleVideo(ai: GoogleGenAI, prompt: string) {
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: { numberOfVideos: 1 },
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok || !videoResponse.body) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    // Stream the video directly to the client
    return new Response(videoResponse.body, {
        status: 200,
        headers: {
            'Content-Type': 'video/mp4',
            'Content-Disposition': 'attachment; filename="generated-video.mp4"',
        },
    });
}
