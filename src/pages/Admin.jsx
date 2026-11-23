import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Star, Pencil, Trash2, Plus, Upload, Camera, X, LogOut, AlertTriangle } from 'lucide-react';
import { useStore, DEMO_PASSWORD } from '../lib/store';
import ProductImage from '../components/ProductImage';

const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const specsToText = (s = {}) => Object.entries(s).map(([k, v]) => `${k}: ${v}`).join('\n');
const textToSpecs = (t) =>
  Object.fromEntries(
    t
      .split('\n')
      .map((l) => l.split(/:(.*)/s).map((x) => x?.trim()))
      .filter(([k, v]) => k && v)
  );

function Login() {
  const { signIn, isDemo } = useStore();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr((await signIn(email, pw)) || '');
    setBusy(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-10 sm:pt-14 pb-12">
      <p className="label">Owner area</p>
      <h1 className="text-4xl sm:text-5xl mt-1.5 font-serif">Admin login</h1>
      {isDemo && (
        <div className="mt-5 border border-burgundy/50 p-3.5 text-xs sm:text-sm bg-paper/60 flex gap-2.5">
          <AlertTriangle size={18} className="text-burgundy shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong>Local demo mode.</strong> Changes save only in this browser. Demo password:{' '}
            <code className="bg-ivory px-1.5 py-0.5 border border-ink/20 font-mono font-semibold">{DEMO_PASSWORD}</code>
          </p>
        </div>
      )}
      <form onSubmit={submit} className="mt-6 space-y-4">
        {!isDemo && (
          <label className="block text-sm">
            Email
            <input
              className="field mt-1"
              type="email"
              inputMode="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        <label className="block text-sm">
          Password
          <input
            className="field mt-1"
            type="password"
            required
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        {err && (
          <p role="alert" className="text-sm text-burgundy font-medium">
            {err}
          </p>
        )}
        <button className="btn btn-ink w-full !py-3.5" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

function ProductForm({ initial, categories, onSave, onCancel, uploadImage }) {
  const blank = {
    id: `new-${Date.now()}`,
    code: '',
    name: '',
    category: categories[0]?.id,
    description: '',
    price: '',
    images: [],
    visible: true,
    featured: false,
  };
  const [p, setP] = useState({ ...blank, ...initial });
  const [specs, setSpecs] = useState(specsToText(initial?.specs));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const up = (k) => (e) => setP({ ...p, [k]: e.target.value });

  const onFiles = async (e) => {
    setBusy(true);
    setErr('');
    try {
      const urls = [];
      for (const f of [...e.target.files]) urls.push(await uploadImage(f));
      setP((x) => ({ ...x, images: [...x.images, ...urls] }));
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
    e.target.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!p.code.trim() || !p.name.trim()) return setErr('Name and design code are required.');
    setBusy(true);
    const msg = await onSave({
      ...p,
      code: p.code.trim(),
      specs: textToSpecs(specs),
      price: p.price === '' ? null : Number(p.price),
    });
    setBusy(false);
    if (msg) setErr(msg);
  };

  return (
    /* Full-screen form on phone for distraction-free editing with sticky Save bar at the bottom */
    <form
      onSubmit={submit}
      className="fixed inset-0 z-50 overflow-y-auto bg-ivory p-4 pb-28 sm:static sm:p-5 sm:pb-5 space-y-4 border border-ink/40 shadow-xl sm:shadow-none"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-serif">{initial ? 'Edit design' : 'Add a design'}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="sm:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink/60"
          aria-label="Close form"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        <label className="text-sm">
          Design name
          <input className="field mt-1" value={p.name} onChange={up('name')} required />
        </label>
        <label className="text-sm">
          Design code (unique)
          <input className="field mt-1 font-mono" value={p.code} onChange={up('code')} placeholder="e.g. SJ-NK-006" required />
        </label>
        <label className="text-sm">
          Category
          <select className="field mt-1" value={p.category} onChange={up('category')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Price in ₹ (optional)
          <input
            className="field mt-1"
            inputMode="numeric"
            value={p.price ?? ''}
            onChange={up('price')}
            placeholder="Leave empty to hide rate"
          />
        </label>
      </div>

      <label className="block text-sm">
        Short description
        <input className="field mt-1" value={p.description} onChange={up('description')} />
      </label>

      <label className="block text-sm">
        Specifications (one per line, "Name: value")
        <textarea
          className="field mt-1"
          rows={3}
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          placeholder={'Weight: 12 g\nPurity: 22K\nStyle: Traditional'}
        />
      </label>

      <div>
        <p className="text-sm mb-2 font-medium">Photos (compressed client-side before storage)</p>
        <div className="flex flex-wrap gap-2.5">
          {p.images.map((src, i) => (
            <div key={i} className="relative w-20 h-24 border border-ink/30">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                className="absolute -top-2 -right-2 bg-burgundy text-ivory rounded-full w-7 h-7 flex items-center justify-center shadow-md active:scale-90 transition-transform"
                onClick={() => setP({ ...p, images: p.images.filter((_, j) => j !== i) })}
              >
                <X size={15} />
              </button>
            </div>
          ))}

          {/* Camera capture upload */}
          <label className="w-20 h-24 border border-dashed border-ink/40 flex flex-col items-center justify-center text-[11px] cursor-pointer hover:border-burgundy active:bg-ink/5 min-h-[44px]">
            <Camera size={18} className="text-brass mb-1" aria-hidden="true" />
            Camera
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={onFiles} />
          </label>

          {/* File picker upload */}
          <label className="w-20 h-24 border border-dashed border-ink/40 flex flex-col items-center justify-center text-[11px] cursor-pointer hover:border-burgundy active:bg-ink/5 min-h-[44px]">
            <Upload size={18} className="text-ink/60 mb-1" aria-hidden="true" />
            Gallery
            <input type="file" accept="image/*" multiple className="sr-only" onChange={onFiles} />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 text-sm py-1">
        <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-burgundy"
            checked={p.visible}
            onChange={(e) => setP({ ...p, visible: e.target.checked })}
          />{' '}
          Visible to customers
        </label>
        <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-burgundy"
            checked={p.featured}
            onChange={(e) => setP({ ...p, featured: e.target.checked })}
          />{' '}
          Featured
        </label>
      </div>

      {err && (
        <p role="alert" className="text-sm text-burgundy font-medium">
          {err}
        </p>
      )}

      {/* Sticky Save Bar on mobile / inline on desktop */}
      <div className="fixed sm:static bottom-0 left-0 right-0 z-30 p-3 sm:p-0 bg-ivory/95 sm:bg-transparent border-t sm:border-0 border-ink/25 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] flex gap-3 shadow-lg sm:shadow-none">
        <button className="btn btn-ink flex-1 sm:flex-none !py-3 font-semibold" disabled={busy}>
          {busy ? 'Working…' : 'Save design'}
        </button>
        <button type="button" className="btn btn-line flex-1 sm:flex-none !py-3" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProductsTab() {
  const { products, categories, saveProduct, deleteProduct, patchProduct, uploadImage } = useStore();
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');
  const list = products.filter((p) => `${p.name} ${p.code}`.toLowerCase().includes(filter.toLowerCase()));

  const run = async (fn) => {
    setMsg((await fn()) || '');
  };

  if (editing) {
    return (
      <ProductForm
        initial={editing === 'new' ? null : editing}
        categories={categories}
        uploadImage={uploadImage}
        onCancel={() => setEditing(null)}
        onSave={async (p) => {
          const m = await saveProduct(p);
          if (!m) setEditing(null);
          return m;
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <input
          className="field sm:w-72"
          type="search"
          placeholder="Search designs…"
          aria-label="Search designs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button className="btn btn-ink w-full sm:w-auto" onClick={() => setEditing('new')}>
          <Plus size={16} aria-hidden="true" /> Add design
        </button>
      </div>

      {msg && (
        <p role="alert" className="text-sm text-burgundy mt-3 font-medium">
          {msg}
        </p>
      )}

      <ul className="mt-4 border-t border-ink/25">
        {list.map((p) => (
          <li key={p.id} className="flex items-center gap-2 sm:gap-3 py-3 border-b border-ink/15">
            <ProductImage product={p} className="w-12 h-14 shrink-0 [&_span]:hidden [&_svg]:w-4/5" />
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg sm:text-xl leading-tight truncate">
                {p.name}
                {!p.visible && <span className="text-xs font-sans text-burgundy ml-2 font-normal">hidden</span>}
              </p>
              <p className="text-xs text-brass tracking-widest font-mono">{p.code}</p>
            </div>

            {/* 44x44px touch-friendly action buttons with 8px spacing */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                className="min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center text-ink/75 hover:text-ink active:scale-95 transition-all"
                title={p.visible ? 'Hide from customers' : 'Show to customers'}
                aria-label={p.visible ? 'Hide design' : 'Show design'}
                onClick={() => run(() => patchProduct(p, { visible: !p.visible }))}
              >
                {p.visible ? <Eye size={18} /> : <EyeOff size={18} className="text-burgundy" />}
              </button>
              <button
                className="min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center text-ink/75 hover:text-ink active:scale-95 transition-all"
                title="Toggle featured"
                aria-label="Toggle featured"
                aria-pressed={p.featured}
                onClick={() => run(() => patchProduct(p, { featured: !p.featured }))}
              >
                <Star size={18} className={p.featured ? 'fill-brass text-brass' : ''} />
              </button>
              <button
                className="min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center text-ink/75 hover:text-ink active:scale-95 transition-all"
                aria-label={`Edit ${p.name}`}
                onClick={() => setEditing(p)}
              >
                <Pencil size={18} />
              </button>
              <button
                className="min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center text-burgundy active:scale-95 transition-all"
                aria-label={`Delete ${p.name}`}
                onClick={() => confirm(`Delete ${p.name} (${p.code})?`) && run(() => deleteProduct(p.id))}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoriesTab() {
  const { categories, saveCategories, deleteCategory } = useStore();
  const [list, setList] = useState(categories);
  const [msg, setMsg] = useState('');

  const upd = (i, k, v) => setList(list.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  const add = () => setList([...list, { id: `cat-${Date.now()}`, name: '', gu: '', code: '', _new: true }]);

  const save = async () => {
    const clean = list
      .filter((c) => c.name.trim())
      .map((c) => ({
        ...c,
        id: c._new ? slug(c.name) || c.id : c.id,
        code: (c.code || c.name.slice(0, 2)).toUpperCase(),
      }));
    setMsg((await saveCategories(clean)) || 'Saved.');
  };

  return (
    <div>
      <p className="text-sm text-ink/70">Rename categories or add new ones. Gujarati name is optional.</p>
      <div className="mt-4 space-y-3">
        {list.map((c, i) => (
          <div
            key={c.id}
            className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-stretch sm:items-center p-3 sm:p-0 border border-ink/20 sm:border-0 bg-paper/20 sm:bg-transparent"
          >
            <input
              className="field sm:col-span-5"
              aria-label="Category name"
              placeholder="Name"
              value={c.name}
              onChange={(e) => upd(i, 'name', e.target.value)}
            />
            <input
              className="field sm:col-span-4 font-gujarati"
              aria-label="Gujarati name"
              lang="gu"
              placeholder="ગુજરાતી"
              value={c.gu}
              onChange={(e) => upd(i, 'gu', e.target.value)}
            />
            <div className="flex gap-2 sm:col-span-3 items-center">
              <input
                className="field flex-1 uppercase font-mono"
                aria-label="Code letters"
                placeholder="Code"
                maxLength={3}
                value={c.code}
                onChange={(e) => upd(i, 'code', e.target.value)}
              />
              <button
                className="min-h-[44px] min-w-[44px] p-2 text-burgundy flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                aria-label="Delete category"
                onClick={async () => {
                  if (c._new) return setList(list.filter((_, j) => j !== i));
                  const m = await deleteCategory(c.id);
                  if (m) setMsg(m);
                  else setList(list.filter((_, j) => j !== i));
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <button className="btn btn-line w-full sm:w-auto" onClick={add}>
          <Plus size={16} /> Add category
        </button>
        <button className="btn btn-ink w-full sm:w-auto font-medium" onClick={save}>
          Save categories
        </button>
      </div>
      {msg && (
        <p role="status" className="text-sm mt-3 text-burgundy font-medium">
          {msg}
        </p>
      )}
    </div>
  );
}

function ShopTab() {
  const { shop, saveShop, uploadImage } = useStore();
  const [s, setS] = useState(shop);
  const [msg, setMsg] = useState('');
  const up = (k) => (e) => setS({ ...s, [k]: e.target.value });

  const img = (k) => async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      setS({ ...s, [k]: await uploadImage(f) });
    } catch (ex) {
      setMsg(ex.message);
    }
  };

  const field = (k, label, props = {}) => (
    <label className="block text-sm">
      {label}
      <input className="field mt-1" value={s[k] || ''} onChange={up(k)} {...props} />
    </label>
  );

  return (
    <form
      className="space-y-4 max-w-xl pb-10"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg((await saveShop(s)) || 'Saved.');
      }}
    >
      {field('name', 'Shop name')}
      {field('tagline', 'Tagline / location line')}
      <label className="block text-sm">
        About text
        <textarea rows={4} className="field mt-1" value={s.about} onChange={up('about')} />
      </label>
      {field('whatsapp', 'WhatsApp number (digits with country code, e.g. 91XXXXXXXXXX)', {
        inputMode: 'numeric',
        placeholder: 'Leave empty in the demo',
      })}
      {field('phone', 'Phone', { inputMode: 'tel' })}
      {field('address', 'Address')}
      {field('mapsUrl', 'Google Maps link', { type: 'url', inputMode: 'url', placeholder: 'https://maps.google.com/…' })}
      {field('hours', 'Opening hours')}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <label className="border border-ink/20 p-3 bg-paper/20">
          <span className="font-medium block mb-1">Hero photo (gold necklace)</span>
          <input type="file" accept="image/*" className="mt-1 block text-xs min-h-[44px]" onChange={img('heroImage')} />
          {s.heroImage && <img src={s.heroImage} alt="" className="w-20 mt-2 border border-ink/30" />}
        </label>
        <label className="border border-ink/20 p-3 bg-paper/20">
          <span className="font-medium block mb-1">Shop photo (optional)</span>
          <input type="file" accept="image/*" className="mt-1 block text-xs min-h-[44px]" onChange={img('shopImage')} />
          {s.shopImage && <img src={s.shopImage} alt="" className="w-20 mt-2 border border-ink/30" />}
        </label>
      </div>

      <label className="flex items-center gap-2.5 text-sm border border-ink/25 p-3.5 bg-ivory cursor-pointer min-h-[48px]">
        <input
          type="checkbox"
          className="w-4 h-4 accent-burgundy"
          checked={!!s.showPrices}
          onChange={(e) => setS({ ...s, showPrices: e.target.checked })}
        />
        <span>Show prices to customers (off by default)</span>
      </label>

      <button className="btn btn-ink w-full sm:w-auto !py-3">Save shop info</button>
      {msg && (
        <p role="status" className="text-sm text-burgundy font-medium">
          {msg}
        </p>
      )}
    </form>
  );
}

export default function Admin() {
  const { user, signOut, isDemo, resetDemo, loading } = useStore();
  const [tab, setTab] = useState('products');

  if (loading) return <p className="max-w-6xl mx-auto px-4 py-20 text-ink/60">Loading admin…</p>;
  if (!user) return <Login />;

  const t = (id) =>
    `min-h-[44px] px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm border-b-2 flex items-center transition-colors whitespace-nowrap ${
      tab === id ? 'border-burgundy text-burgundy font-semibold' : 'border-transparent text-ink/70 hover:text-ink'
    }`;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 sm:pt-10 md:pt-14 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">Owner area</p>
          <h1 className="text-3xl sm:text-5xl mt-1 font-serif">Admin</h1>
        </div>
        <button className="btn btn-line !py-2 !px-3 text-xs min-h-[44px]" onClick={signOut}>
          <LogOut size={15} aria-hidden="true" /> Sign out
        </button>
      </div>

      {isDemo && (
        <div className="mt-4 border border-burgundy/50 p-3 text-xs sm:text-sm bg-paper/60 flex flex-wrap gap-2.5 items-center justify-between">
          <p className="flex gap-2">
            <AlertTriangle size={18} className="text-burgundy shrink-0 mt-0.5" aria-hidden="true" />
            <span>Local demo: edits save only in this browser.</span>
          </p>
          <button
            className="underline underline-offset-4 text-xs min-h-[44px] flex items-center"
            onClick={() => confirm('Reset all demo data?') && resetDemo()}
          >
            Reset demo data
          </button>
        </div>
      )}

      {/* Tabs with scrollable container and 44px touch targets */}
      <div className="flex border-b border-ink/25 mt-5 overflow-x-auto scrollbar-none" role="tablist">
        {[
          ['products', 'Designs'],
          ['categories', 'Categories'],
          ['shop', 'Shop info & prices'],
        ].map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={t(id)} onClick={() => setTab(id)}>
            {l}
          </button>
        ))}
        <Link
          to="/collections"
          className="ml-auto px-3 py-2.5 text-xs sm:text-sm text-ink/70 hover:text-burgundy whitespace-nowrap min-h-[44px] flex items-center"
        >
          View site →
        </Link>
      </div>

      <div className="mt-6">
        {tab === 'products' ? <ProductsTab /> : tab === 'categories' ? <CategoriesTab /> : <ShopTab />}
      </div>
    </div>
  );
}
