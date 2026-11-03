import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface FavCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
}

const Ctx = createContext<FavCtx | null>(null);
const KEY = "lool-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore corrupt/unavailable localStorage */
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined")
        localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore corrupt/unavailable localStorage */
    }
  }, [ids]);

  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) =>
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <Ctx.Provider value={{ ids, has, toggle, count: ids.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
