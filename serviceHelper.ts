
import { Service } from './types';

// Helper function to find a specific service by its numeric ID within the nested structure
export const findServiceById = (services: Service[], id: number): Service | null => {
  for (const service of services) {
    if (service.id === id) {
      return service;
    }
    if (service.subServices) {
      const found = findServiceById(service.subServices, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// Helper function to get the breadcrumb trail for a given service ID
export const getBreadcrumbs = (services: Service[], id: number): Service[] => {
  const findPath = (currentServices: Service[], currentId: number, path: Service[]): Service[] | null => {
    for (const service of currentServices) {
      const newPath = [...path, service];
      if (service.id === currentId) {
        return newPath;
      }
      if (service.subServices) {
        const result = findPath(service.subServices, currentId, newPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };
  
  return findPath(services, id, []) || [];
};

// New helper to flatten the service tree into a simple array, keeping all properties
export const flattenServices = (services: Service[]): Service[] => {
  const flat: Service[] = [];
  const recurse = (serviceList: Service[]) => {
    for (const service of serviceList) {
      const { subServices, ...serviceWithoutChildren } = service;
      flat.push(serviceWithoutChildren as Service); // Push the parent/current service
      if (subServices && subServices.length > 0) {
        recurse(subServices); // Recurse into children
      }
    }
  };
  recurse(services);
  return flat;
};
