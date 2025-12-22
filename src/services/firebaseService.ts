import { ref, onValue, push, set, remove, update } from "firebase/database";
import { db } from "../firebaseConfig";

/**
 * Subscribes to a list of data at a given path.
 * Converts Firebase object map to array of objects with 'id'.
 */
export const subscribeToData = <T extends { id: string }>(
  path: string,
  callback: (data: T[]) => void
) => {
  const dataRef = ref(db, path);
  return onValue(dataRef, (snapshot) => {
    const val = snapshot.val();
    if (val) {
      const list = Object.entries(val).map(([key, value]) => ({
        id: key,
        ...(value as any),
      }));
      callback(list as T[]);
    } else {
      callback([]);
    }
  });
};

/**
 * Adds a new item to a list.
 */
export const addData = async (path: string, data: any) => {
  const listRef = ref(db, path);
  const newRef = push(listRef);
  await set(newRef, data);
  return newRef.key;
};

/**
 * Removes an item by ID.
 */
export const removeData = async (path: string, id: string) => {
  const itemRef = ref(db, `${path}/${id}`);
  await remove(itemRef);
};

/**
 * Updates an item by ID.
 */
export const updateData = async (path: string, id: string, data: any) => {
  const itemRef = ref(db, `${path}/${id}`);
  await update(itemRef, data);
};

/**
 * Clears an entire path in the database. Used for factory reset.
 */
export const clearPath = async (path: string) => {
  const dataRef = ref(db, path);
  await set(dataRef, null);
};
