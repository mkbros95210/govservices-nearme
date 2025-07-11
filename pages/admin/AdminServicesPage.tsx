

import React, { useState, useContext, useEffect, useReducer } from 'react';
import { supabase } from '../../supabaseClient';
import { Service, BookingConfig, FormField, DocumentRequirement } from '../../types';
import { ServiceContext } from '../../context/ServiceContext';
import IconMap, { iconList } from '../../components/IconMap';

// --- Form Reducer for complex state in modal ---
type FormState = Omit<Service, 'id' | 'subServices'>;
type FormAction = 
    | { type: 'SET_FIELD'; field: keyof FormState; value: any }
    | { type: 'ADD_FORM_FIELD' }
    | { type: 'REMOVE_FORM_FIELD'; index: number }
    | { type: 'UPDATE_FORM_FIELD'; index: number; field: keyof FormField; value: any }
    | { type: 'ADD_DOC_REQ' }
    | { type: 'REMOVE_DOC_REQ'; index: number }
    | { type: 'UPDATE_DOC_REQ'; index: number; field: keyof DocumentRequirement; value: any };

function formReducer(state: FormState, action: FormAction): FormState {
    const newState = { ...state, booking_config: { ...state.booking_config, form_fields: [...(state.booking_config?.form_fields || [])], document_requirements: [...(state.booking_config?.document_requirements || [])] }};
    const { form_fields, document_requirements } = newState.booking_config!;

    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        case 'ADD_FORM_FIELD':
            form_fields.push({ id: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false });
            return newState;
        case 'REMOVE_FORM_FIELD':
            form_fields.splice(action.index, 1);
            return newState;
        case 'UPDATE_FORM_FIELD':
            form_fields[action.index] = { ...form_fields[action.index], [action.field]: action.value };
            return newState;
        case 'ADD_DOC_REQ':
            document_requirements.push({ id: `doc_${Date.now()}`, name: 'New Document', description: 'Description' });
            return newState;
        case 'REMOVE_DOC_REQ':
            document_requirements.splice(action.index, 1);
            return newState;
        case 'UPDATE_DOC_REQ':
            document_requirements[action.index] = { ...document_requirements[action.index], [action.field]: action.value };
            return newState;
        default: return state;
    }
}

// --- ServiceFormModal Component ---
const ServiceFormModal: React.FC<{
    service?: Service | null;
    parentId?: number | null;
    allServices: Service[];
    onClose: () => void;
    onSave: () => void;
}> = ({ service, parentId, allServices, onClose, onSave }) => {
    const initialState: FormState = {
        name: service?.name || '',
        description: service?.description || '',
        icon_name: service?.icon_name || iconList[0],
        parent_id: service ? service.parent_id : parentId,
        is_featured: service?.is_featured || false,
        display_order: service?.display_order || 0,
        is_bookable: service?.is_bookable || false,
        booking_config: service?.booking_config || { form_fields: [], document_requirements: [] },
        price: service?.price ?? null,
    };
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeConfigTab, setActiveConfigTab] = useState<'form' | 'docs'>('form');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const serviceData = state; 

        try {
            let result;
            if (service) {
                result = await supabase.from('services').update(serviceData).eq('id', service.id);
            } else {
                result = await supabase.from('services').insert([serviceData]);
            }
            if (result.error) throw result.error;
            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Create a flattened list for the parent dropdown
    const flatServices: {id: number, name: string, level: number}[] = [];
    const generateFlatList = (services: Service[], level: number) => {
        services.forEach(s => {
            flatServices.push({ id: s.id, name: s.name, level: level });
            if (s.subServices) {
                generateFlatList(s.subServices, level + 1);
            }
        });
    };
    generateFlatList(allServices, 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start z-50 p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl my-8 flex flex-col">
                <div className="p-6 border-b dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{service ? 'Edit' : 'Add'} Service</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Service Name" value={state.name} onChange={e => dispatch({type: 'SET_FIELD', field: 'name', value: e.target.value})} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg" />
                        <input type="number" placeholder="Display Order" value={state.display_order} onChange={e => dispatch({type: 'SET_FIELD', field: 'display_order', value: Number(e.target.value)})} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg" />
                    </div>
                    <textarea placeholder="Description" value={state.description || ''} onChange={e => dispatch({type: 'SET_FIELD', field: 'description', value: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg min-h-[80px]"></textarea>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={state.icon_name} onChange={e => dispatch({type: 'SET_FIELD', field: 'icon_name', value: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg">
                            {iconList.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                        </select>
                        <select value={state.parent_id || ''} onChange={e => dispatch({type: 'SET_FIELD', field: 'parent_id', value: Number(e.target.value) || null})} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg">
                            <option value="">None (Top-Level Service)</option>
                            {flatServices.filter(s => s.id !== service?.id).map(s => <option key={s.id} value={s.id}>{'--'.repeat(s.level)} {s.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t dark:border-slate-700">
                         <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200"><input type="checkbox" checked={state.is_bookable} onChange={e => dispatch({type: 'SET_FIELD', field: 'is_bookable', value: e.target.checked})} className="w-5 h-5 accent-cyan-500"/> Is Bookable</label>
                         {state.is_bookable && (
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Price (₹)</label>
                                <input 
                                    type="number" 
                                    placeholder="e.g., 49.99 or 0 for FREE" 
                                    value={state.price ?? ''} 
                                    onChange={e => dispatch({type: 'SET_FIELD', field: 'price', value: e.target.value ? Number(e.target.value) : null})} 
                                    step="0.01"
                                    min="0"
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg mt-1"
                                />
                            </div>
                        )}
                    </div>

                    {/* Dynamic Booking Config */}
                    {state.is_bookable && (
                        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg space-y-4 border dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Booking Configuration</h3>
                            <div className="flex gap-2 border-b dark:border-slate-700">
                                <button type="button" onClick={() => setActiveConfigTab('form')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg ${activeConfigTab === 'form' ? 'bg-white dark:bg-slate-700 border-x border-t dark:border-slate-600' : 'text-slate-500'}`}>Form Fields</button>
                                <button type="button" onClick={() => setActiveConfigTab('docs')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg ${activeConfigTab === 'docs' ? 'bg-white dark:bg-slate-700 border-x border-t dark:border-slate-600' : 'text-slate-500'}`}>Documents</button>
                            </div>
                            
                            {activeConfigTab === 'form' && <div className="space-y-3">
                                {(state.booking_config?.form_fields || []).map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 p-2 bg-white dark:bg-slate-700/50 rounded-md animate-list-item-in">
                                        <input value={field.label} onChange={e => dispatch({type:'UPDATE_FORM_FIELD', index, field: 'label', value: e.target.value})} placeholder="Label" className="p-2 bg-slate-50 dark:bg-slate-600 border dark:border-slate-500 rounded text-sm" />
                                        <input value={field.id} onChange={e => dispatch({type:'UPDATE_FORM_FIELD', index, field: 'id', value: e.target.value})} placeholder="Field ID (no spaces)" className="p-2 bg-slate-50 dark:bg-slate-600 border dark:border-slate-500 rounded text-sm" />
                                        <select value={field.type} onChange={e => dispatch({type:'UPDATE_FORM_FIELD', index, field: 'type', value: e.target.value})} className="p-2 bg-slate-50 dark:bg-slate-600 border dark:border-slate-500 rounded text-sm">
                                            <option value="text">Text</option><option value="email">Email</option><option value="date">Date</option><option value="tel">Phone</option><option value="number">Number</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={field.required} onChange={e => dispatch({type:'UPDATE_FORM_FIELD', index, field: 'required', value: e.target.checked})} /> Req.</label>
                                          <button type="button" onClick={() => dispatch({type: 'REMOVE_FORM_FIELD', index})} className="text-red-500 hover:text-red-700 p-1">&times;</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => dispatch({type: 'ADD_FORM_FIELD'})} className="text-sm font-semibold text-cyan-600 hover:text-cyan-500">+ Add Form Field</button>
                            </div>}

                            {activeConfigTab === 'docs' && <div className="space-y-3">
                                {(state.booking_config?.document_requirements || []).map((doc, index) => (
                                    <div key={doc.id} className="grid grid-cols-[1fr,1fr,auto] gap-2 p-2 bg-white dark:bg-slate-700/50 rounded-md animate-list-item-in">
                                         <input value={doc.name} onChange={e => dispatch({type:'UPDATE_DOC_REQ', index, field: 'name', value: e.target.value})} placeholder="Document Name" className="p-2 bg-slate-50 dark:bg-slate-600 border dark:border-slate-500 rounded text-sm" />
                                         <input value={doc.description} onChange={e => dispatch({type:'UPDATE_DOC_REQ', index, field: 'description', value: e.target.value})} placeholder="Description" className="p-2 bg-slate-50 dark:bg-slate-600 border dark:border-slate-500 rounded text-sm" />
                                         <button type="button" onClick={() => dispatch({type: 'REMOVE_DOC_REQ', index})} className="text-red-500 hover:text-red-700 p-1">&times;</button>
                                    </div>
                                ))}
                                 <button type="button" onClick={() => dispatch({type: 'ADD_DOC_REQ'})} className="text-sm font-semibold text-cyan-600 hover:text-cyan-500">+ Add Document Requirement</button>
                            </div>}
                        </div>
                    )}
                </form>
                <div className="p-6 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition shadow-md hover:shadow-lg shadow-cyan-500/30">
                        {loading ? 'Saving...' : 'Save Service'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Service Tree Item ---
const ServiceListItem: React.FC<{
    service: Service;
    level: number;
    onEdit: (service: Service) => void;
    onDelete: (id: number) => void;
    onAddSub: (parentId: number) => void;
}> = ({ service, level, onEdit, onDelete, onAddSub }) => {
    const [isExpanded, setIsExpanded] = useState(level < 1); // Expand top levels by default
    const hasSubServices = service.subServices && service.subServices.length > 0;

    return (
        <div className="animate-list-item-in" style={{ animationDelay: `${level * 10}ms` }}>
            <div className="flex items-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" style={{ paddingLeft: `${1 + level * 2}rem` }}>
                 <div className="flex-1 flex items-center gap-4 py-3">
                    <button onClick={() => setIsExpanded(!isExpanded)} disabled={!hasSubServices} className="text-slate-400 disabled:invisible hover:text-slate-800 dark:hover:text-slate-200">
                       <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <IconMap iconName={service.icon_name} className="h-6 w-6 text-cyan-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{service.name}</span>
                    <span className="font-mono text-sm text-slate-400">#{service.id}</span>
                    {!service.is_bookable && <span className="text-xs font-bold uppercase text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Category</span>}
                </div>
                <div className="px-4 py-3 flex items-center gap-4">
                    {service.is_bookable && <span className="font-bold text-sm text-green-600 dark:text-green-400">{service.price === 0 ? 'FREE' : `₹${service.price}`}</span>}
                    <button onClick={() => onAddSub(service.id)} className="text-sm font-semibold text-cyan-600 hover:text-cyan-500 transition">Add Sub-service</button>
                    <button onClick={() => onEdit(service)} className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition">Edit</button>
                    <button onClick={() => onDelete(service.id)} className="text-sm font-semibold text-red-600 hover:text-red-500 transition">Delete</button>
                </div>
            </div>
            {isExpanded && hasSubServices && (
                <div className="border-l border-slate-200 dark:border-slate-700">
                    {service.subServices?.map(sub => (
                        <ServiceListItem key={sub.id} service={sub} level={level + 1} onEdit={onEdit} onDelete={onDelete} onAddSub={onAddSub} />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Main Page Component ---
const AdminServicesPage: React.FC = () => {
  const { allServices, loading: serviceLoading, refetchServices } = useContext(ServiceContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [flatServices, setFlatServices] = useState<Service[]>([]);

  useEffect(() => {
    // Need a flat list for the modal parent dropdown
    const getFlatServices = (services: Service[]): Service[] => {
        let list: Service[] = [];
        services.forEach(s => {
            list.push(s);
            if (s.subServices) {
                list = list.concat(getFlatServices(s.subServices));
            }
        });
        return list;
    };
    setFlatServices(getFlatServices(allServices));
  }, [allServices]);

  const openModal = (service: Service | null = null, parentId: number | null = null) => {
    setSelectedService(service);
    setCurrentParentId(parentId);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
      setIsModalOpen(false);
      setSelectedService(null);
      setCurrentParentId(null);
  };

  const handleSave = () => {
    refetchServices();
    closeModal();
  };

  const handleDelete = async (id: number) => {
      if (window.confirm("Are you sure you want to delete this service? This will also delete all its sub-services and may affect existing bookings.")) {
          await supabase.from('services').delete().eq('id', id);
          refetchServices();
      }
  };

  const handleAddSub = (parentId: number) => {
      openModal(null, parentId);
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Manage Services</h1>
             <button onClick={() => openModal()} className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl shadow-md hover:bg-cyan-600 hover:shadow-lg shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5">
                Add Top-Level Service
            </button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              {serviceLoading ? <div className="p-10 text-center animate-pulse-bg dark:animate-dark-pulse-bg">Loading services...</div> : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {allServices.map(service => (
                          <ServiceListItem 
                            key={service.id} 
                            service={service} 
                            level={0}
                            onEdit={openModal}
                            onDelete={handleDelete}
                            onAddSub={handleAddSub}
                          />
                      ))}
                  </div>
              )}
        </div>

        {isModalOpen && <ServiceFormModal service={selectedService} parentId={currentParentId} allServices={allServices} onClose={closeModal} onSave={handleSave} />}
    </div>
  );
};

export default AdminServicesPage;
