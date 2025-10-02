
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const loadingMessages = [
    "Warming up the video engine...",
    "Gathering digital stardust...",
    "Directing the pixel orchestra...",
    "Rendering the final cut...",
    "This can take a few minutes, please be patient.",
    "Polishing the frames...",
    "Almost there, the premiere is about to start!"
];

const VideoGenView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isLoading) {
            intervalRef.current = window.setInterval(() => {
                setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
            }, 4000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setCurrentMessageIndex(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLoading]);

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        try {
            const url = await generateVideo(prompt);
            setVideoUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 md:p-6">
            <h2 className="text-xl font-bold text-center mb-4 text-green-400">Video Generation (VEO)</h2>
            <p className="text-center text-gray-400 mb-6">Describe the video you want to create. Note: Video generation can take several minutes.</p>

            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A neon hologram of a cat driving at top speed"
                    className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <LoadingSpinner /> : 'Generate Video'}
                </button>
            </div>

            <div className="flex-grow flex items-center justify-center bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600">
                {isLoading && (
                    <div className="text-center p-4">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-gray-300 text-lg transition-opacity duration-500">
                           {loadingMessages[currentMessageIndex]}
                        </p>
                    </div>
                )}
                {error && <p className="text-red-400 p-4">{error}</p>}
                {videoUrl && (
                    <div className="p-4 w-full h-full flex items-center justify-center">
                        <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl" />
                    </div>
                )}
                {!isLoading && !error && !videoUrl && (
                     <div className="text-center text-gray-500 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        <p>Your generated video will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenView;
