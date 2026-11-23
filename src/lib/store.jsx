import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, hasSupabase, BUCKET } from './supabase';
import { SAMPLE_PRODUCTS, CATEGORIES } from '../data/sampleProducts';
import { DEFAULT_SHOP } from '../data/shop';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export const DATA_VERSION = 'v2_real_photos';
const LS = {
  products: 'sj_products',
  categories: 'sj_categories',
  shop: 'sj_shop',
  auth: 'sj_demo_auth',
  version: 'sj_data_version',
};
export const DEMO_PASSWORD = 'demo1234'; // local demo only; never used with Supabase

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    alert('Browser storage is full. Use smaller images or connect Supabase.');
  }
};

// DB row <-> app object
const fromRow = (r) => ({
  id: r.id, code: r.code, name: r.name, category: r.category_id, description: r.description || '',
  specs: r.specs || {}, price: r.price, images: r.images || [], visible: r.visible, featured: r.featured, is_sample: r.is_sample,
});
const toRow = (p) => ({
  code: p.code, name: p.name, category_id: p.category, description: p.description, specs: p.specs || {},
  price: p.price === '' || p.price == null ? null : Number(p.price), images: p.images || [], visible: p.visible,
  featured: p.featured, is_sample: !!p.is_sample,
});

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => {
    if (hasSupabase) return [];
    try {
      const savedVersion = read(LS.version, null);
      if (savedVersion !== DATA_VERSION) {
        const existingProducts = read(LS.products, []);
        const customUserProducts = Array.isArray(existingProducts)
          ? existingProducts.filter((p) => !p.is_sample && !String(p.id).startsWith('sample-'))
          : [];
        return [...SAMPLE_PRODUCTS, ...customUserProducts];
      }
      return read(LS.products, SAMPLE_PRODUCTS);
    } catch {
      return SAMPLE_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState(() => (hasSupabase ? CATEGORIES : read(LS.categories, CATEGORIES)));

  const [shop, setShop] = useState(() => {
    if (hasSupabase) return DEFAULT_SHOP;
    try {
      const existingShop = read(LS.shop, {});
      return {
        ...DEFAULT_SHOP,
        ...existingShop,
        heroImage: existingShop.heroImage || DEFAULT_SHOP.heroImage,
        shopImage: existingShop.shopImage || DEFAULT_SHOP.shopImage,
      };
    } catch {
      return DEFAULT_SHOP;
    }
  });

  const [loading, setLoading] = useState(hasSupabase);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState(() => read('sj_view', 'retailer')); // demo: retailer | wholesaler

  useEffect(() => write('sj_view', viewMode), [viewMode]);

  const load = useCallback(async () => {
    if (hasSupabase) {
      const [p, c, s] = await Promise.all([
        supabase.from('products').select('*').order('code'),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('shop_settings').select('*').eq('id', 1).maybeSingle(),
      ]);
      if (p.data) setProducts(p.data.map(fromRow));
      if (c.data?.length) setCategories(c.data.map((x) => ({ id: x.id, name: x.name, gu: x.name_gu || '', code: x.code || x.id.slice(0, 2).toUpperCase() })));
      if (s.data) setShop({ ...DEFAULT_SHOP, ...s.data.data, showPrices: s.data.show_prices });
    } else {
      const savedVersion = read(LS.version, null);
      if (savedVersion !== DATA_VERSION) {
        // Upgrade sample products to new version with photos, preserving any custom user-added products
        const existingProducts = read(LS.products, []);
        const customUserProducts = Array.isArray(existingProducts)
          ? existingProducts.filter((p) => !p.is_sample && !String(p.id).startsWith('sample-'))
          : [];
        const nextProducts = [...SAMPLE_PRODUCTS, ...customUserProducts];

        // Ensure shop has the new hero and shop images while preserving custom edits to name/tagline/about
        const existingShop = read(LS.shop, {});
        const nextShop = {
          ...DEFAULT_SHOP,
          ...existingShop,
          heroImage: existingShop.heroImage || DEFAULT_SHOP.heroImage,
          shopImage: existingShop.shopImage || DEFAULT_SHOP.shopImage,
        };

        write(LS.products, nextProducts);
        write(LS.shop, nextShop);
        write(LS.version, DATA_VERSION);

        setProducts(nextProducts);
        setCategories(read(LS.categories, CATEGORIES));
        setShop(nextShop);
      } else {
        setProducts(read(LS.products, SAMPLE_PRODUCTS));
        setCategories(read(LS.categories, CATEGORIES));
        setShop({ ...DEFAULT_SHOP, ...read(LS.shop, {}) });
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    if (hasSupabase) {
      supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
      return () => sub.subscription.unsubscribe();
    }
    setUser(read(LS.auth, false) ? { email: 'demo-owner (local demo)' } : null);
  }, [load]);

  const persistLocal = (next) => { setProducts(next); write(LS.products, next); };

  const api = useMemo(() => ({
    async signIn(email, password) {
      if (hasSupabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? error.message : null;
      }
      if (password !== DEMO_PASSWORD) return 'Wrong demo password.';
      write(LS.auth, true);
      setUser({ email: 'demo-owner (local demo)' });
      return null;
    },
    async signOut() {
      if (hasSupabase) await supabase.auth.signOut();
      else { localStorage.removeItem(LS.auth); setUser(null); }
    },
    async saveProduct(p) {
      if (hasSupabase) {
        const q = p.id && !String(p.id).startsWith('new-')
          ? supabase.from('products').update(toRow(p)).eq('id', p.id)
          : supabase.from('products').insert(toRow(p));
        const { error } = await q;
        if (error) return error.message;
        await load();
        return null;
      }
      const exists = products.some((x) => x.id === p.id);
      if (products.some((x) => x.code === p.code && x.id !== p.id)) return 'Design code already exists.';
      persistLocal(exists ? products.map((x) => (x.id === p.id ? p : x)) : [{ ...p, id: `local-${Date.now()}` }, ...products]);
      return null;
    },
    async deleteProduct(id) {
      if (hasSupabase) { const { error } = await supabase.from('products').delete().eq('id', id); if (error) return error.message; await load(); return null; }
      persistLocal(products.filter((x) => x.id !== id));
      return null;
    },
    async patchProduct(p, patch) {
      return api.saveProduct({ ...p, ...patch });
    },
    async uploadImage(file) {
      if (hasSupabase) {
        const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file);
        if (error) throw new Error(error.message);
        return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      }
      return resizeToDataUrl(file); // local demo: stored in this browser only
    },
    async saveShop(s) {
      const { showPrices, ...rest } = s;
      if (hasSupabase) {
        const { error } = await supabase.from('shop_settings').upsert({ id: 1, data: rest, show_prices: showPrices });
        if (error) return error.message;
      } else write(LS.shop, s);
      setShop(s);
      return null;
    },
    async saveCategories(list) {
      if (hasSupabase) {
        const { error } = await supabase.from('categories').upsert(list.map((c, i) => ({ id: c.id, name: c.name, name_gu: c.gu, code: c.code, sort_order: i })));
        if (error) return error.message;
        await load();
        return null;
      }
      setCategories(list); write(LS.categories, list);
      return null;
    },
    async deleteCategory(id) {
      if (products.some((p) => p.category === id)) return 'Move or delete the products in this category first.';
      if (hasSupabase) { const { error } = await supabase.from('categories').delete().eq('id', id); if (error) return error.message; await load(); return null; }
      const next = categories.filter((c) => c.id !== id); setCategories(next); write(LS.categories, next);
      return null;
    },
    resetDemo() {
      Object.values(LS).forEach((k) => localStorage.removeItem(k));
      write(LS.version, DATA_VERSION);
      setProducts(SAMPLE_PRODUCTS); setCategories(CATEGORIES); setShop(DEFAULT_SHOP); setUser(null);
    },
    reload: load,
  }), [products, categories, load]);

  const value = { products, categories, shop, loading, user, viewMode, setViewMode, isDemo: !hasSupabase, hasSupabase, ...api };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Compresses uploads client-side before storage (max 1000px, WebP/JPEG ~80%)
function resizeToDataUrl(file, max = 1000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      try {
        const webp = c.toDataURL('image/webp', 0.8);
        if (webp.startsWith('data:image/webp')) return resolve(webp);
      } catch {}
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = url;
  });
}
