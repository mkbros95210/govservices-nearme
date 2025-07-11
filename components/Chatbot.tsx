
import React, { useState, useEffect, useRef, FormEvent, useContext } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ServiceContext } from '../context/ServiceContext';
import { Service } from '../types';


const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [chat, setChat] = useState<Chat | null>(null);
    const { allServices: services } = useContext(ServiceContext);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Generate system instruction once services are loaded
    useEffect(() => {
        if (services.length === 0) return;

        const generateServicesContext = (serviceList: Service[], level = 0): string => {
            let context = '';
            for (const s of serviceList) {
                context += `${' '.repeat(level*2)}- ${s.name}: ${s.description}\n`;
                if (s.subServices && s.subServices.length > 0) {
                    context += generateServicesContext(s.subServices, level + 1);
                }
            }
            return context;
        };
        const servicesContext = generateServicesContext(services);

        const systemInstruction = `You are a friendly and helpful AI assistant for the 'GovServices NearMe' web application.
        Your purpose is to help users find information about government services.
        You have knowledge of the following available services and their hierarchy:
        ${servicesContext}
        Answer user questions based ONLY on this data. Be concise and clear.
        If a user asks for something not in the provided data, politely say that you can only provide information about the listed services.
        Do not make up services or document requirements.
        Start the conversation by greeting the user and asking how you can help them with the available government services.`;

        const initChat = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const chatInstance = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                      systemInstruction,
                      thinkingConfig: { thinkingBudget: 0 }
                    }
                });
                setChat(chatInstance);
                
                // Start with a greeting from the model
                const response = await chatInstance.sendMessageStream({ message: "Hello!" });
                setIsLoading(false);
                let fullResponse = "";
                 for await (const chunk of response) {
                    fullResponse += chunk.text;
                    setMessages([{ role: 'model', text: fullResponse }]);
                }
            } catch (error) {
                console.error("Failed to initialize chatbot:", error);
                setMessages([{ role: 'model', text: 'Sorry, I am unable to connect right now.' }]);
                setIsLoading(false);
            }
        };

        initChat();

    }, [services]); // Rerun when services data changes

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chat) return;

        const userMessage = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model' as const, text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const responseStream = await chat.sendMessageStream({ message: input });
            
            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessageIndex = newMessages.length - 1;
                    if (newMessages[lastMessageIndex]?.role === 'model') {
                        newMessages[lastMessageIndex].text += chunkText;
                        return newMessages;
                    }
                    return prev;
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev.slice(0, -1), { role: 'model', text: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-0 right-0 p-4 sm:p-6 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-cyan-500 text-white rounded-full shadow-2xl hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 flex items-center justify-center transform hover:scale-110 transition-transform"
                    aria-label="Open Chat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.839 8.839 0 01-4.083-.98L2 17l1.03-3.09A7.962 7.962 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.416 11.543a.75.75 0 00-1.032 1.032l1.032-1.032zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div className={`fixed bottom-0 right-0 sm:m-6 bg-white w-full h-full sm:w-[400px] sm:h-[600px] sm:max-h-[calc(100vh-48px)] rounded-none sm:rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-slate-100/70 border-b border-slate-200 rounded-t-none sm:rounded-t-2xl">
                    <h3 className="font-bold text-slate-800 text-lg">AI Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 transition-colors" aria-label="Close Chat">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-500 text-white rounded-br-lg' : 'bg-slate-100 text-slate-800 rounded-bl-lg'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                         <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-100 rounded-bl-lg">
                                <div className="flex items-center gap-1">
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isLoading ? "Please wait..." : "Ask about a service..."}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="flex-shrink-0 w-11 h-11 bg-cyan-500 text-white rounded-lg shadow-sm hover:bg-cyan-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            aria-label="Send Message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Chatbot;
