export const deepMerge = <T>(obj1: T, obj2: T) => {
  const result = {...obj1};
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (typeof result[key] === 'object' && result[key] !== null &&
  typeof obj2[key] === 'object' && obj2[key] !== null &&
  !Array.isArray(result[key]) && !Array.isArray(obj2[key])) {
    result[key] = deepMerge(result[key], obj2[key]);
      } else {
    result[key] = obj2[key];
      }
    }
  }
  return result;
};

// Function for immutably updating an array of objects
export const updateById = <T extends SLCE.GameObject>(arr: T[], id: SLCE.GameObject['id'], newProps: T) =>
  arr.map(item => (item.id === id ? deepMerge(item, newProps) : item));

// Function for immutably removing an item from an array by id
export const removeById = <T extends SLCE.GameObject>(arr: T[], id: SLCE.GameObject['id']) => arr.filter(item => item.id !== id);