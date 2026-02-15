//(1)
/* ---------- Data (10 items + images) ---------- */
const items = [
  { id:'pizza',   name:'Pizza', price:8.50, img:'img/pizza.jpg' },
  { id:'burger',  name:'Burger', price:6.75, img:'img/burger.jpg' },
  { id:'hotdog',  name:'Hotdog', price:4.50, img:'img/hotdog.jpg' },
  { id:'pasta',   name:'Pasta', price:7.25, img:'img/pasta.jpg' },
  { id:'salad',   name:'Salad', price:5.00, img:'img/salad.jpg' },
  { id:'wrap',    name:'Wrap', price:6.00, img:'img/wrap.jpg' },
  { id:'taco',    name:'Taco', price:3.75, img:'img/taco.jpg' },
  { id:'fries',   name:'Fries', price:2.50, img:'img/fries.jpg' },
  { id:'soup',    name:'Soup', price:3.25, img:'img/soup.jpg' },
  { id:'dessert', name:'Dessert', price:4.00, img:'img/dessert.jpg' }
];

const supplements = [
  { id:'cheese', label:'Extra cheese', price:0.75 },
  { id:'mayo', label:'Mayonnaise', price:0.25 },
  { id:'ketchup', label:'Ketchup', price:0.20 }
];

/* ---------- Drinks (with images) ---------- */
const drinks = [
  { id:'cola',  name:'Cola',price:1.50, img:'img/cola.jpg' },
  { id:'water', name:'Water',price:1.00, img:'img/water.jpg' },
  { id:'juice', name:'Orange Juice', price:2.00, img:'img/juice.jpg' },
  { id:'pepsi',  name:'Pepsi', price:3.00, img:'img/pepsi.jpg' }
];
/* ------state -----*/
    let state = {
  itemId: null,
  qty: 1,
  selectedSupp: {},
  drinksSelected: {}, // drinkId -> qty (0..5)
  orderItems: [] // array of { id, qty, selectedSupp: {..} }
};

/* ---------- Helpers ---------- */
const fmt = v=>'$'+v.toFixed(2);
//(2)
function calcFoodTotal(){
  const it = items.find(x=>x.id===state.itemId);
  if(!it) return 0;
  let base = it.price * state.qty;
  let suppTotal = Object.keys(state.selectedSupp).reduce((s,k)=>{
    return s + (state.selectedSupp[k] ? supplements.find(x=>x.id===k).price * state.qty : 0);
  },0);
  return base + suppTotal;
}
//(3)
function calcDrinksTotal(){
  return Object.keys(state.drinksSelected).reduce((s,k)=>{
    const d = drinks.find(x=>x.id===k);
    const q = state.drinksSelected[k] || 0;
    return s + (d ? d.price * q : 0);
  },0);
}
//(4)
function calcTotal(){
  return calcFoodTotal() + calcDrinksTotal();
}
//(4.5)
/* ---------- Render list view (foods) ---------- */
const itemsList = document.getElementById('itemsList');
itemsList.innerHTML = '';
items.forEach(it=>{
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="item-left">
      <div class="thumb" data-id="${it.id}" title="${it.name}"><img src="${it.img}" alt="${it.name}"></div>
      <div class="item-info">
        <div class="item-name">${it.name}</div>
        <!-- <div class="item-desc">${it.desc}</div> -->
      </div>
    </div>
    <div class="controls">
      <div style="text-align:right;margin-right:12px">
        <div class="price">${fmt(it.price)}</div>
        <div class="small">each</div>
      </div>
      <div class="qty" data-id="${it.id}">
        <button class="dec">−</button>
        <span class="count">1</span>
        <button class="inc">+</button>
      </div>
    </div>
  `;
  itemsList.appendChild(el);
});
//(5)
/* clickable images open supplement view and select that item */
itemsList.addEventListener('click', e=>{
  const thumb = e.target.closest('.thumb');
  if(thumb){
    const id = thumb.dataset.id;
    const qtyEl = document.querySelector(`.qty[data-id="${id}"] .count`);
    const qty = parseInt(qtyEl.textContent,10);
    state.itemId = id; state.qty = qty; state.selectedSupp = {};
    refreshSidebar(); showSupplementView();
    return;
  }

  const btn = e.target.closest('button');
  if(!btn) return;

  const parentQty = e.target.closest('.qty');
  if(parentQty && (btn.classList.contains('inc') || btn.classList.contains('dec'))){
    const span = parentQty.querySelector('.count');
    let n = parseInt(span.textContent,10);
    if(btn.classList.contains('inc')) n++;
    else if(btn.classList.contains('dec') && n>1) n--;
    span.textContent = n; return;
  }
  if(btn.dataset.id === undefined) return;
  const id = btn.dataset.id;
  const qtyEl = document.querySelector(`.qty[data-id="${id}"] .count`);
  const qty = parseInt(qtyEl.textContent,10);
  state.itemId = id; state.qty = qty; state.selectedSupp = {};
  refreshSidebar(); showSupplementView();
});
//(6)
/* ---------- Sidebar controls ---------- */
/*
document.getElementById('resetBtn').addEventListener('click', ()=>{
  state = { itemId:null, qty:1, selectedSupp:{}, drinksSelected:{} };
  document.querySelectorAll('.qty .count').forEach(s=>s.textContent='1');
  refreshSidebar(); showListView();
});
*/
 document.getElementById('resetBtn').addEventListener('click', ()=>{
  state = { itemId:null, qty:1, selectedSupp:{}, drinksSelected:{}, orderItems:[] };
  document.querySelectorAll('.qty .count').forEach(s=>s.textContent='1');
  refreshSidebar();
  showListView();
});

//(7)

/* ---------- Supplement view rendering (updated) ---------- */
function showSupplementView(){
  document.getElementById('listView').classList.add('hidden');
  document.getElementById('supplementView').classList.remove('hidden');
  document.getElementById('finalView').classList.add('hidden');

  const item = items.find(x=>x.id===state.itemId);
  document.getElementById('selItemLabel').textContent = item ? item.name : '';
  document.getElementById('selQtyLabel').textContent = item ? `${state.qty} piece(s) × ${fmt(item.price)}` : '';
  document.getElementById('selTotalPrice').textContent = fmt(calcFoodTotal());

  const suppList = document.getElementById('suppList');
  suppList.innerHTML = '';
  supplements.forEach(s=>{
    const id = 's_'+s.id;
    const checked = !!state.selectedSupp[s.id];
    const row = document.createElement('label');
    row.className = 'checkbox-item';
    row.innerHTML = `<input type="checkbox" id="${id}" data-id="${s.id}" ${checked?'checked':''}>
      <span style="flex:1">${s.label} <span class="small" style="color:var(--muted)">(${fmt(s.price)} each)</span></span>
      <span class="small">${fmt(s.price * state.qty)}</span>`;
    suppList.appendChild(row);
  });

  suppList.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change', e=>{
      const id = e.target.dataset.id;
      state.selectedSupp[id] = e.target.checked;
      document.getElementById('selTotalPrice').textContent = fmt(calcFoodTotal());
      refreshSidebar();
    });
  });

  // Add "Add another item" action
  const existing = document.getElementById('supplementExtraActions');
  if(existing) existing.remove();
  const extra = document.createElement('div');
  extra.id = 'supplementExtraActions';
  extra.style.marginTop = '12px';
  extra.className = 'no-print';
  extra.innerHTML = `<button class="btn secondary" id="addAnotherItemBtn">Add another item</button>`;
  document.getElementById('supplementView').appendChild(extra);

  document.getElementById('addAnotherItemBtn').addEventListener('click', ()=>{
    if(!state.itemId) return;
    // commit current selection into orderItems
    state.orderItems.push({
      id: state.itemId,
      qty: state.qty,
      selectedSupp: Object.assign({}, state.selectedSupp)
    });
    // reset selection for next item
    state.itemId = null;
    state.qty = 1;
    state.selectedSupp = {};
    document.querySelectorAll('.qty .count').forEach(s=>s.textContent='1');
    refreshSidebar();
    showListView();
  }, { once:true });
}

/* supplement view buttons */
document.getElementById('backBtn').addEventListener('click', ()=>{
  showListView(); refreshSidebar();
});
document.getElementById('toFinalBtn').addEventListener('click', ()=>{ showDrinksView(); });

/* ---------- Drinks view (updated) ---------- */
function showDrinksView(){
  // hide other panels
  document.getElementById('listView').classList.add('hidden');
  document.getElementById('supplementView').classList.add('hidden');
  document.getElementById('finalView').classList.remove('hidden'); // reuse finalView area for drinks selection first

  // build drinks selection UI in finalContent area
  const container = document.getElementById('finalContent');
  container.innerHTML = `<div style="margin-bottom:8px"><strong>Add Drinks (max 5 each)</strong></div>`;

  // take a snapshot of drinks state when entering view so "Skip Drinks" can revert transient changes
  const drinksSnapshot = JSON.stringify(state.drinksSelected || {});
  container.dataset.drinksSnapshot = drinksSnapshot;

  const grid = document.createElement('div');
  grid.style.display = 'flex';
  grid.style.flexWrap = 'wrap';
  grid.style.gap = '10px';

  drinks.forEach(d=>{
    const q = state.drinksSelected[d.id] || 0;

    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.padding = '8px';
    card.style.border = '1px solid rgba(0,0,0,0.04)';
    card.style.borderRadius = '8px';
    card.style.width = '140px';
    card.style.boxSizing = 'border-box';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'thumb';
    imgWrap.style.width = '100px';
    imgWrap.style.height = '100px';
    imgWrap.style.marginBottom = '8px';
    imgWrap.style.cursor = 'pointer';
    imgWrap.dataset.id = d.id;
    imgWrap.innerHTML = `<img src="${d.img}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;

    // clicking image: add 1 unit (max 5) then immediately proceed to final summary
    imgWrap.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const cur = state.drinksSelected[id] || 0;
      if(cur < 5){
        state.drinksSelected[id] = cur + 1;
        const countEl = container.querySelector(`.drinks-count[data-id="${id}"]`);
        if(countEl) countEl.textContent = state.drinksSelected[id];
        refreshSidebar();
      }
      // go straight to final summary
      renderFinalSummary();
    });

    const name = document.createElement('div');
    name.style.fontWeight = '600';
    name.textContent = d.name;

    const price = document.createElement('div');
    price.className = 'small';
    price.style.color = 'var(--muted)';
    price.textContent = `${fmt(d.price)} each`;

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    controls.style.alignItems = 'center';
    controls.style.marginTop = '8px';
    controls.innerHTML = `<button class="drinks-dec" data-id="${d.id}">−</button>
                          <span class="drinks-count" data-id="${d.id}">${q}</span>
                          <button class="drinks-inc" data-id="${d.id}">+</button>`;

    card.appendChild(imgWrap);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(controls);
    grid.appendChild(card);
  });

  container.appendChild(grid);

  // add action buttons: Skip Drinks / Continue to Final Summary
  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '12px';
  actions.className = 'no-print';
  actions.innerHTML = `<button class="btn secondary" id="skipDrinks">Skip Drinks</button>
                       <button class="btn primary" id="toSummary">Continue</button>`;
  container.appendChild(actions);

  // wire up inc/dec controls
  container.querySelectorAll('.drinks-inc').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const cur = state.drinksSelected[id] || 0;
      if(cur < 5){
        state.drinksSelected[id] = cur + 1;
        container.querySelector(`.drinks-count[data-id="${id}"]`).textContent = state.drinksSelected[id];
        refreshSidebar();
      }
    });
  });
  container.querySelectorAll('.drinks-dec').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const cur = state.drinksSelected[id] || 0;
      if(cur > 0){
        state.drinksSelected[id] = cur - 1;
        container.querySelector(`.drinks-count[data-id="${id}"]`).textContent = state.drinksSelected[id];
        refreshSidebar();
      }
    });
  });

  // Skip: if user made only transient changes (changed quantities but didn't press Continue or click image),
  // revert to snapshot before rendering summary.
  document.getElementById('skipDrinks').addEventListener('click', ()=>{
    const snap = container.dataset.drinksSnapshot || '{}';
    const cur = JSON.stringify(state.drinksSelected || {});
    if(cur !== snap){
      // revert to snapshot (discard transient changes)
      state.drinksSelected = JSON.parse(snap);
      refreshSidebar();
    }
    renderFinalSummary();
  }, { once:true });

  // Continue -> render summary using current state (commits selections)
  document.getElementById('toSummary').addEventListener('click', ()=>{
    renderFinalSummary();
  }, { once:true });

  // show totals in sidebar (food + drinks)
  refreshSidebar();
}

/* ---------- Final summary rendering (includes committed items + drinks) ---------- */
function renderFinalSummary(){
  const container = document.getElementById('finalContent');

  // assemble a combined list: committed orderItems plus current selection if any
  const combined = [];

  // committed items from orderItems
  (state.orderItems || []).forEach(it=>{
    const itm = items.find(x=>x.id===it.id);
    const supps = Object.keys(it.selectedSupp || {}).filter(k=>it.selectedSupp[k]);
    combined.push({
      name: itm.name,
      qty: it.qty,
      price: itm.price,
      supps: supps.map(k=>({ id:k, label: supplements.find(s=>s.id===k).label, price: supplements.find(s=>s.id===k).price }))
    });
  });

  // current active selection (not yet committed) — include if itemId is set
  if(state.itemId){
    const itm = items.find(x=>x.id===state.itemId);
    const supps = Object.keys(state.selectedSupp || {}).filter(k=>state.selectedSupp[k]);
    combined.push({
      name: itm.name,
      qty: state.qty,
      price: itm.price,
      supps: supps.map(k=>({ id:k, label: supplements.find(s=>s.id===k).label, price: supplements.find(s=>s.id===k).price }))
    });
  }

  // build lines from combined array
  const lines = [];
  if(combined.length === 0){
    lines.push('<div><strong>Items:</strong> none</div>');
  } else {
    lines.push('<div><strong>Items:</strong></div>');
    lines.push('<ul>');
    combined.forEach(ci=>{
      const baseTotal = ci.price * ci.qty;
      lines.push(`<li>${ci.name} — ${ci.qty} × ${fmt(ci.price)} = ${fmt(baseTotal)}`);
      if(ci.supps && ci.supps.length){
        lines.push('<ul>');
        ci.supps.forEach(s=>{
          lines.push(`<li>${s.label}  = ${fmt(s.price * ci.qty)}</li>`);
        });
        lines.push('</ul>');
      }
      lines.push('</li>');
    });
    lines.push('</ul>');
  }

  // drinks lines
  const drinkLines = Object.keys(state.drinksSelected).filter(k=>state.drinksSelected[k]>0).map(k=>{
    const d = drinks.find(x=>x.id===k);
    const q = state.drinksSelected[k];
    return { name: d.name, qty: q, price: d.price, total: d.price * q };
  });

  if(drinkLines.length){
    lines.push('<div style="margin-top:8px"><strong>Drinks:</strong></div>');
    lines.push('<ul>');
    drinkLines.forEach(d=> lines.push(`<li>${d.name} — ${d.qty} × ${fmt(d.price)} = ${fmt(d.total)}</li>`));
    lines.push('</ul>');
  } else {
    lines.push(`<div style="margin-top:8px"><strong>Drinks:</strong> none</div>`);
  }

  // compute totals: items total (committed + current) + drinks total
  const itemsTotal = combined.reduce((s,ci)=>{
    const base = ci.price * ci.qty;
    const suppTotal = (ci.supps||[]).reduce((ss,sp)=> ss + sp.price * ci.qty, 0);
    return s + base + suppTotal;
  },0);

  const drinksTotal = calcDrinksTotal();
  const grandTotal = itemsTotal + drinksTotal;

  lines.push(`<div style="margin-top:8px;font-weight:700">Total: ${fmt(grandTotal)}</div>`);

  // replace final content with summary and buttons
  container.innerHTML = `<h2 style="margin:0 0 8px">Final Order</h2>` + lines.join('');
  const btns = document.createElement('div');
  btns.style.display = 'flex'; btns.style.gap = '8px'; btns.style.marginTop = '12px';
  btns.className = 'no-print';
  btns.innerHTML = `<button class="btn secondary" id="editFinalBtn">Edit</button><button class="btn primary" id="printFinalBtn">Print</button>`;
  container.appendChild(btns);

  // ensure single handlers (avoid duplicates)
  const onceEdit = ()=>{ showSupplementView(); };
  const oncePrint = ()=>{ window.print(); };

  document.getElementById('editFinalBtn').addEventListener('click', onceEdit, { once:true });
  document.getElementById('printFinalBtn').addEventListener('click', oncePrint, { once:true });

  refreshSidebar();
}

/* utility views */
function showListView(){ document.getElementById('listView').classList.remove('hidden'); document.getElementById('supplementView').classList.add('hidden'); document.getElementById('finalView').classList.add('hidden'); }

function refreshSidebar(){
  const item = items.find(x=>x.id===state.itemId);
  document.getElementById('sideItem').textContent = item ? item.name : '—';
  document.getElementById('sideQty').textContent = state.itemId ? state.qty : 0;
  const supps = Object.keys(state.selectedSupp).filter(k=>state.selectedSupp[k]).map(k=>supplements.find(s=>s.id===k).label);
  document.getElementById('sideSupp').textContent = supps.length? supps.join(', ') : '—';

  // include committed orderItems in sidebar total
  const itemsTotal = (state.orderItems || []).reduce((s,it)=>{
    const itDef = items.find(x=>x.id===it.id);
    const base = itDef.price * it.qty;
    const suppTotal = Object.keys(it.selectedSupp||{}).filter(k=>it.selectedSupp[k]).reduce((ss,k)=>{
      const sp = supplements.find(s=>s.id===k).price;
      return ss + sp * it.qty;
    },0);
    return s + base + suppTotal;
  },0);

  const grand = itemsTotal + calcFoodTotal() + calcDrinksTotal();
  document.getElementById('sideTotal').textContent = fmt(grand);

  // optional: update side count if element exists
  const countEl = document.getElementById('sideCount');
  if(countEl) countEl.textContent = (state.orderItems||[]).length;
}

/* initial state update */
refreshSidebar();
