
import React, { useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PromoBanner from './components/PromoBanner';
import ServiceItem from './components/ServiceItem';
import { Service } from './types';
import { ServiceContext } from './context/ServiceContext';
import { GoogleGenAI, Type } from '@google/genai';
import { flattenServices } from './serviceHelper';

const { useNavigate, Link } = ReactRouterDOM as any;

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { allServices } = useContext(ServiceContext);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Service[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const flatServiceList = useMemo(() => flattenServices(allServices), [allServices]);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2 || flatServiceList.length === 0) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const serviceContext = JSON.stringify(flatServiceList.map(s => ({ id: s.id, name: s.name, description: s.description, is_bookable: s.is_bookable })));

      const prompt = `You are a search suggestion assistant for a government services website. Based on the user's query, find the most relevant services from the provided JSON list.
      User Query: "${searchQuery}"
      Available Services: ${serviceContext}
      Return a JSON array of up to 5 matching services that are most relevant to the query. Each object in the array must include 'id', 'name', and 'is_bookable'.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                name: { type: Type.STRING },
                is_bookable: { type: Type.BOOLEAN }
              },
              required: ["id", "name", "is_bookable"]
            }
          },
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const resultText = response.text.trim();
      const resultJson = JSON.parse(resultText) as Service[];
      setSuggestions(resultJson);
    } catch (error) {
      console.error("AI suggestion error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [flatServiceList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (newQuery.length > 1) {
      setIsLoading(true);
      debounceTimeout.current = window.setTimeout(() => {
        fetchSuggestions(newQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };
  
  const handleSuggestionClick = (service: Service) => {
    if (service.is_bookable) {
      navigate(`/booking/${service.id}`);
    } else {
      navigate(`/service/${service.id}`);
    }
    setIsFocused(false);
    setQuery('');
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search for services, documents, etc..."
          className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full focus:ring-4 focus:ring-cyan-200 dark:focus:ring-cyan-800 focus:border-cyan-400 dark:focus:border-cyan-500 transition-all duration-300 ease-in-out shadow-sm text-md dark:text-white"
          aria-label="Search for services"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button type="submit" className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-full transition-colors" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>
      {isFocused && query.length > 1 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden z-50 animate-fade-in">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">Loading suggestions...</div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {suggestions.map(s => (
                <li key={s.id} onClick={() => handleSuggestionClick(s)} className="p-4 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 cursor-pointer transition-colors flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{s.name}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">No suggestions found.</div>
          )}
        </div>
      )}
    </div>
  );
};


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { featuredServices, allServices, promoBanners, loading } = useContext(ServiceContext);
  
  const showViewAll = allServices.length > featuredServices.length;

  const handleServiceClick = (service: Service) => {
    if (service.is_bookable) {
      navigate(`/booking/${service.id}`);
    } else {
      navigate(`/service/${service.id}`);
    }
  };

  return (
    <>
      <SearchBar />
      
      {loading ? (
        <div className="relative rounded-2xl h-56 my-8 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
      ) : (
        <PromoBanner slides={promoBanners} />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
          Featured <span className="text-cyan-500">Services.</span>
        </h2>
        {showViewAll && (
           <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors group">
              VIEW ALL
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
           </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {featuredServices.map((service) => (
            <ServiceItem 
                key={service.id} 
                service={service} 
                onClick={() => handleServiceClick(service)} 
            />
            ))}
        </div>
      )}
    </>
  );
};

export default HomePage;
