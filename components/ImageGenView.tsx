
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const ImageGenView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        try {
            const url = await generateImage(prompt);
            setImageUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full p-4 md:p-6">
            <h2 className="text-xl font-bold text-center mb-4 text-green-400">Image Generation</h2>
            <p className="text-center text-gray-400 mb-6">Describe the image you want to create. Be as specific as you can!</p>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A green robot planting a tree on Mars"
                    className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <LoadingSpinner /> : 'Generate'}
                </button>
            </div>

            <div className="flex-grow flex items-center justify-center bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600">
                {isLoading && (
                    <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-gray-300">Generating your masterpiece...</p>
                    </div>
                )}
                {error && <p className="text-red-400 p-4">{error}</p>}
                {imageUrl && (
                    <div className="p-4">
                        <img src={imageUrl} alt={prompt} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl" />
                    </div>
                )}
                {!isLoading && !error && !imageUrl && (
                     <div className="text-center text-gray-500 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p>Your generated image will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenView;
