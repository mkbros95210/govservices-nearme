
import React, { useState, useEffect, useContext } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { GoogleGenAI, Type } from '@google/genai';
import { ServiceContext } from '../context/ServiceContext';
import { flattenServices } from '../serviceHelper';
import { Service } from '../types';
import ServiceItem from '../components/ServiceItem';
import IconMap from '../components/IconMap';

const { useSearchParams, useNavigate } = ReactRouterDOM as any;

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const { allServices, loading: servicesLoading } = useContext(ServiceContext);
    const [searchResults, setSearchResults] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const flatServiceList = React.useMemo(() => flattenServices(allServices), [allServices]);

    useEffect(() => {
        const performSearch = async () => {
            if (!query || servicesLoading) return;
            setLoading(true);
            setSearchResults([]);

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const serviceContext = JSON.stringify(flatServiceList.map(s => ({ id: s.id, name: s.name, description: s.description, is_bookable: s.is_bookable, price: s.price, icon_name: s.icon_name })));

                const prompt = `You are a search engine for a government services website. You must find all services from the provided JSON list that are relevant to the user's query.
                User Query: "${query}"
                Available Services (JSON): ${serviceContext}
                Return a JSON array of all matching service objects. Each object must be a complete service object from the provided list, including 'id', 'name', 'is_bookable', 'price', and 'icon_name'. If no services match, return an empty array.`;

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
                                    is_bookable: { type: Type.BOOLEAN },
                                    price: { type: Type.NUMBER, nullable: true },
                                    icon_name: { type: Type.STRING },
                                },
                                required: ["id", "name", "is_bookable", "icon_name"]
                            }
                        }
                    }
                });

                const resultText = response.text.trim();
                const resultJson = JSON.parse(resultText) as Service[];
                setSearchResults(resultJson);
            } catch (error) {
                console.error("AI search error:", error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };
        
        if(!servicesLoading) {
           performSearch();
        }
    }, [query, servicesLoading, flatServiceList]);

    const handleServiceClick = (service: Service) => {
        if (service.is_bookable) {
            navigate(`/booking/${service.id}`);
        } else {
            navigate(`/service/${service.id}`);
        }
    };
    
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
            Search Results for "<span className="text-cyan-500">{query}</span>"
          </h1>
        </div>

        {loading || servicesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {searchResults.map((service) => (
              <ServiceItem 
                key={service.id} 
                service={service} 
                onClick={() => handleServiceClick(service)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 animate-fade-in">
            <IconMap iconName="DefaultIcon" className="h-16 w-16 mx-auto text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-6">No Results Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">We couldn't find any services matching your search. Please try a different term.</p>
          </div>
        )}
      </div>
    );
};

export default SearchResultsPage;
