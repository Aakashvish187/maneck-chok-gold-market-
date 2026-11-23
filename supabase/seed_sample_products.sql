-- Optional: loads the 30 clearly-marked SAMPLE designs (no prices, no images) for a Supabase demo.
-- Run after schema.sql. Delete them from Admin, or run: delete from products where is_sample;
insert into public.products (code, name, category_id, description, specs, visible, featured, is_sample)
select code, name, category_id, description,
       jsonb_build_object('Style', description, 'Details', 'Weight, size and making charges: ask on WhatsApp'),
       true, featured, true
from (values
  ('SJ-CH-001','Rope Chain','chains','Twisted rope links',true),
  ('SJ-CH-002','Box Chain','chains','Square box links',false),
  ('SJ-CH-003','Curb Chain','chains','Flat interlocked curb links',false),
  ('SJ-CH-004','Singapore Chain','chains','Fine twisted weave',false),
  ('SJ-CH-005','Figaro Chain','chains','Alternating short and long links',false),
  ('SJ-NK-001','Temple Necklace','necklaces','Traditional temple motifs',true),
  ('SJ-NK-002','Mango Mala','necklaces','Mango (kairi) motif strand',false),
  ('SJ-NK-003','Layered Haar','necklaces','Long layered strands',false),
  ('SJ-NK-004','Choker Set','necklaces','Close-fit choker style',false),
  ('SJ-NK-005','Antique Finish Necklace','necklaces','Matte antique finish',false),
  ('SJ-BG-001','Plain Kadli Bangle','bangles','Smooth round profile',true),
  ('SJ-BG-002','Patla Bangle','bangles','Flat band style',false),
  ('SJ-BG-003','Kada','bangles','Broad bracelet style',false),
  ('SJ-BG-004','Filigree Bangle','bangles','Fine openwork pattern',false),
  ('SJ-BG-005','Carved Bangle','bangles','Hand-carved surface',false),
  ('SJ-RG-001','Solitaire-Style Ring','rings','Single stone setting',true),
  ('SJ-RG-002','Signet Ring','rings','Flat engraved top',false),
  ('SJ-RG-003','Band Ring','rings','Plain polished band',false),
  ('SJ-RG-004','Floral Ring','rings','Flower motif crown',false),
  ('SJ-RG-005','Cocktail Ring','rings','Broad statement top',false),
  ('SJ-ER-001','Jhumka','earrings','Dome and bell shape',true),
  ('SJ-ER-002','Stud Earrings','earrings','Simple stud pair',false),
  ('SJ-ER-003','Chandbali','earrings','Crescent-shaped drop',false),
  ('SJ-ER-004','Drop Earrings','earrings','Long elegant drop',false),
  ('SJ-ER-005','Hoop Earrings','earrings','Round hoop pair',false),
  ('SJ-BR-001','Bridal Necklace Set','bridal','Necklace, earrings and tikka',true),
  ('SJ-BR-002','Rani Haar Set','bridal','Long haar with matching earrings',false),
  ('SJ-BR-003','Temple Bridal Set','bridal','Temple motif full set',false),
  ('SJ-BR-004','Kundan-Style Set','bridal','Kundan-style setting',false),
  ('SJ-BR-005','Heritage Bridal Set','bridal','Antique finish bridal set',false)
) as t(code, name, category_id, description, featured)
on conflict (code) do nothing;
