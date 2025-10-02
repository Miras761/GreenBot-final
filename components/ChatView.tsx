
import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: The ImagePart type is defined in '../types' and should be imported from there.
import type { Message, ImagePart } from '../types';
import { generateContent } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });


const ChatView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', text: "Hello! I'm GreenBot. You can ask me anything or attach an image.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleSendMessage = useCallback(async () => {
        if ((!input.trim() && !imageFile) || isLoading) return;

        setIsLoading(true);
        const userMessageText = input.trim();
        const userMessage: Message = {
            id: Date.now().toString(),
            text: userMessageText,
            sender: 'user',
            image: imagePreview || undefined,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        removeImage();

        try {
            let imagePart: ImagePart | undefined;
            if (imageFile) {
                const base64Data = await fileToBase64(imageFile);
                imagePart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: imageFile.type,
                    },
                };
            }
            
            const prompt = userMessageText || "What do you see in this image?";
            const botResponseText = await generateContent(prompt, imagePart);
            
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, something went wrong. Please try again.",
                sender: 'bot',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, imageFile, isLoading, imagePreview]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0"></div>}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-h-48" />}
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0"></div>
                        <div className="max-w-lg p-3 rounded-2xl bg-gray-700 rounded-bl-none">
                           <LoadingSpinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                {imagePreview && (
                    <div className="relative w-24 h-24 mb-2 p-1 border border-gray-600 rounded-lg">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                        <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">&times;</button>
                    </div>
                )}
                <div className="flex items-center bg-gray-700 rounded-lg p-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-green-400 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Type a message or attach an image..."
                        className="flex-grow bg-transparent focus:outline-none text-gray-200 resize-none px-2 max-h-24"
                        rows={1}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !imageFile)} className="p-2 bg-green-600 text-white rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatView;