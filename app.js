const URL="https://cfrcqgxycasadeleyzak.supabase.co",KEY="sb_publishable_ou2feeTIg1pfnnXHxd29JA_X8J0YWs0",db=supabase.createClient(URL,KEY);
let me,cs=[],ts=[],us=[];
const $=x=>document.getElementById(x),today=()=>new Date().toISOString().slice(0,10),esc=x=>(x??"").toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const age=d=>{if(!d)return"";let x=new Date(d),n=new Date(),a=n.getFullYear()-x.getFullYear();if(n<new Date(n.getFullYear(),x.getMonth(),x.getDate()))a--;return a};
const date=d=>d?new Date(d+"T00:00").toLocaleDateString("de-DE"):"—";
async function start(){
  try {
    const { data: { session }, error } = await db.auth.getSession();

    if(error){
      console.error("getSession:", error);
      $("lm").textContent = "Supabase-Fehler: " + error.message;
    }

    if(session){
      await app();
    }

    $("lf").onsubmit = async e => {
      e.preventDefault();

      $("lm").textContent = "Anmeldung läuft...";

      try {
        const { data, error } = await db.auth.signInWithPassword({
          email: $("le").value.trim(),
          password: $("lp").value
        });

        console.log("LOGIN:", data, error);

        if(error){
          $("lm").textContent = "Login-Fehler: " + error.message;
          return;
        }

        if(!data.session){
          $("lm").textContent = "Anmeldung erfolgreich, aber keine Sitzung erhalten.";
          return;
        }

        $("lm").textContent = "Angemeldet. Lade KundenManager...";

        await app();

      } catch(err) {
        console.error(err);
        $("lm").textContent = "Fehler: " + err.message;
      }
    };

    $("out").onclick = async () => {
      await db.auth.signOut();
    };

    db.auth.onAuthStateChange((event, session) => {
      console.log("AUTH EVENT:", event);

      if(!session){
        $("app").hidden = true;
        $("login").hidden = false;
      }
    });

  } catch(err) {
    console.error(err);
    $("lm").textContent = "Startfehler: " + err.message;
  }
}
async function app(){
  try {
    const { data: { user }, error: userError } = await db.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      $("login").hidden = false;
      $("app").hidden = true;
      return;
    }

    const r = await db
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (r.error) {
      throw r.error;
    }

    if (!r.data) {
      throw new Error("Kein Profil für diesen Benutzer gefunden.");
    }

    me = r.data;

    $("login").hidden = true;
    $("app").hidden = false;

    $("who").textContent =
      (me.full_name || user.email) + " · " + me.role;

    await load();
    nav();

  } catch (err) {
    console.error("APP LOGIN FEHLER:", err);

    $("login").hidden = false;
    $("app").hidden = true;

    $("lm").textContent =
      "Fehler beim Laden des Benutzerprofils: " +
      (err.message || err);
  }
}


async function load(){let a=await db.from("customers").select("*").order("updated_at",{ascending:false}),b=await db.from("tasks").select("*").order("due_date",{ascending:true}),c=await db.from("profiles").select("*").order("full_name");cs=a.data||[];ts=b.data||[];us=c.data||[];render()}
function nav(){document.querySelectorAll("aside button[data-v]").forEach(b=>b.onclick=()=>{document.querySelectorAll("main section").forEach(s=>s.hidden=true);$(b.dataset.v).hidden=false;document.querySelectorAll("aside button").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("side").classList.remove("open")});$("menu").onclick=()=>$("side").classList.toggle("open");$("add1").onclick=$("add2").onclick=()=>customer();$("addt").onclick=()=>task();$("search").oninput=$("cat").onchange=$("state").onchange=$("tf").onchange=renderCustomers;$("tfilter").onchange=renderTasks;$("cf").onsubmit=saveCustomer;$("tfm").onsubmit=saveTask}
function render(){let cats=[...new Set(cs.map(c=>c.category).filter(Boolean))].sort();$("cat").innerHTML='<option value="">Alle Kategorien</option>'+cats.map(x=>`<option>${esc(x)}</option>`).join("");$("sc").textContent=cs.length;$("st").textContent=ts.filter(x=>!x.completed).length;$("sa").textContent=cs.filter(x=>x.state!=="Erledigt").length;$("so").textContent=ts.filter(x=>!x.completed&&x.due_date&&x.due_date<today()).length;$("dt").innerHTML=ts.filter(x=>!x.completed).slice(0,8).map(item).join("")||'<div class="empty">Keine offenen Aufgaben.</div>';$("dc").innerHTML=cs.slice(0,8).map(c=>`<div class="item" onclick="detailOpen('${c.id}')"><b>${esc(c.first)} ${esc(c.last)}</b><small>${esc(c.company||"")} · ${esc(c.state)}</small></div>`).join("")||'<div class="empty">Noch keine Kunden.</div>';renderCustomers();renderTasks();renderCalendar();renderUsers()}
function item(t){let c=cs.find(x=>x.id===t.customer_id),over=!t.completed&&t.due_date&&t.due_date<today();return `<div class="item ${t.completed?"done":""} ${over?"over":""}"><b>${esc(t.title)}</b><small>${esc(c?c.first+" "+c.last:"")} · ${t.due_date?"Frist "+date(t.due_date):"Keine Frist"} ${over?"· Überfällig":""}</small><br><button onclick="toggleTask('${t.id}',${!t.completed})">${t.completed?"Öffnen":"Erledigen"}</button> <button onclick="task('${t.id}')">Bearbeiten</button></div>`}
function renderCustomers(){let s=$("search").value.toLowerCase(),cat=$("cat").value,st=$("state").value,tf=$("tf").value;let a=cs.filter(c=>{let text=[c.first,c.last,c.company,c.phone,c.mobile,c.customerEmail,c.trade,c.hobby].join(" ").toLowerCase(),ct=ts.filter(t=>t.customer_id===c.id);if(s&&!text.includes(s))return false;if(cat&&c.category!==cat)return false;if(st&&c.state!==st)return false;if(tf==="open"&&!ct.some(t=>!t.completed))return false;if(tf==="done"&&!ct.some(t=>t.completed))return false;if(tf==="overdue"&&!ct.some(t=>!t.completed&&t.due_date&&t.due_date<today()))return false;return true});$("cl").innerHTML=a.map(c=>{let over=ts.filter(t=>t.customer_id===c.id&&!t.completed&&t.due_date&&t.due_date<today()).length;return `<div class="customer"><div class="av">${esc((c.first?.[0]||"")+(c.last?.[0]||""))}</div><div class="cm"><b>${esc(c.first)} ${esc(c.last)}</b><div><span class="pill">${esc(c.state||"Neu Kunde")}</span>${c.category?`<span class="pill">${esc(c.category)}</span>`:""}${c.company?`<span class="pill">${esc(c.company)}</span>`:""}${over?`<span class="pill red">${over} überfällig</span>`:""}</div></div><button onclick="detailOpen('${c.id}')">Akte</button></div>`}).join("")||'<div class="empty">Keine passenden Kunden.</div>'}
function renderTasks(){let f=$("tfilter").value,a=ts;if(f==="open")a=a.filter(x=>!x.completed);if(f==="done")a=a.filter(x=>x.completed);if(f==="overdue")a=a.filter(x=>!x.completed&&x.due_date&&x.due_date<today());$("tl").innerHTML=a.map(item).join("")||'<div class="empty">Keine Aufgaben.</div>'}
function renderCalendar(){$("cal").innerHTML=ts.filter(x=>x.due_date).map(x=>`<div class="item ${!x.completed&&x.due_date<today()?"over":""}"><b>${date(x.due_date)} · ${esc(x.title)}</b><small>${esc(cs.find(c=>c.id===x.customer_id)?.first||"")} ${esc(cs.find(c=>c.id===x.customer_id)?.last||"")}</small></div>`).join("")||'<div class="empty">Keine Fristen.</div>'}
function renderUsers(){if(me?.role!=="admin")return;$("ul").innerHTML=us.map(u=>`<div class="rights"><b>${esc(u.full_name||"Ohne Name")}</b><div>${esc(u.email||"")} · ${esc(u.role)}</div><label><input type="checkbox" ${u.can_view_all?"checked":""} onchange="right('${u.id}','can_view_all',this.checked)"> Alle Kunden sehen</label><label><input type="checkbox" ${u.can_edit_customers?"checked":""} onchange="right('${u.id}','can_edit_customers',this.checked)"> Kunden bearbeiten</label><label><input type="checkbox" ${u.can_delete_customers?"checked":""} onchange="right('${u.id}','can_delete_customers',this.checked)"> Kunden löschen</label><label><input type="checkbox" ${u.can_manage_users?"checked":""} onchange="right('${u.id}','can_manage_users',this.checked)"> Benutzer verwalten</label></div>`).join("")}
async function right(id,k,v){let o={};o[k]=v;await db.from("profiles").update(o).eq("id",id);await load()}
const fields=["first","last","birth","pfirst","plast","pbirth","child1","child1birth","child2","child2birth","child3","child3birth","company","trade","phone","mobile","customerEmail","hobby","icebreaker","vm","category","state2","notes"];
function customer(id){let c=cs.find(x=>x.id===id);$("ct").textContent=c?"Kunde bearbeiten":"Kunde anlegen";$("cid").value=c?.id||"";fields.forEach(k=>$(k).value=c?.[k.replace("state2","state")]??"");$("age").value=age(c?.birth);$("page").value=age(c?.pbirth);$("cas").innerHTML=me.role==="admin"?`<label>Verantwortliche Benutzer<select id="ca" multiple size="3">${us.map(u=>`<option value="${u.id}">${esc(u.full_name||u.email)}</option>`).join("")}</select></label>`:"";cd.showModal()}
async function saveCustomer(e){e.preventDefault();let id=$("cid").value,o={};fields.forEach(k=>o[k==="state2"?"state":k]=$(`${k}`).value||null);o.updated_at=new Date().toISOString();let r=id?await db.from("customers").update(o).eq("id",id):await db.from("customers").insert({...o,created_by:me.id}).select().single();if(r.error)return alert(r.error.message);cd.close();await load()}
function task(id){let t=ts.find(x=>x.id===id);$("tid").value=t?.id||"";$("tc").innerHTML=cs.map(c=>`<option value="${c.id}">${esc(c.first)} ${esc(c.last)}</option>`).join("");$("tc").value=t?.customer_id||"";$("tt").value=t?.title||"";$("tx").value=t?.description||"";$("due").value=t?.due_date||"";$("done").checked=!!t?.completed;$("tas").innerHTML=me.role==="admin"?`<label>Zuweisen an<select id="ta" multiple size="3">${us.map(u=>`<option value="${u.id}">${esc(u.full_name||u.email)}</option>`).join("")}</select></label>`:"";td.showModal()}
async function saveTask(e){e.preventDefault();let id=$("tid").value,o={customer_id:$("tc").value,title:$("tt").value,description:$("tx").value,due_date:$("due").value||null,completed:$("done").checked};let r=id?await db.from("tasks").update(o).eq("id",id):await db.from("tasks").insert({...o,created_by:me.id}).select().single();if(r.error)return alert(r.error.message);td.close();await load()}
async function toggleTask(id,v){let r=await db.from("tasks").update({completed:v}).eq("id",id);if(r.error)alert(r.error.message);await load()}
async function detailOpen(id){let c=cs.find(x=>x.id===id),ct=ts.filter(x=>x.customer_id===id);$("dtitle").textContent=c.first+" "+c.last;$("dbody").innerHTML=`<div class="detailgrid">${[["Geburtsdatum",date(c.birth)],["Alter",age(c.birth)],["Partner",(c.pfirst||"")+" "+(c.plast||"")],["Partner-Geburtstag",date(c.pbirth)],["Firma",c.company],["Gewerke",c.trade],["Telefon",c.phone],["Handy",c.mobile],["E-Mail",c.customerEmail],["Hobby",c.hobby],["Icebreaker",c.icebreaker],["VM",c.vm],["Kategorie",c.category],["Status",c.state]].map(x=>`<div class="field"><small>${x[0]}</small><b>${esc(x[1]||"—")}</b></div>`).join("")}</div><h3>Notizen</h3><div class="item">${esc(c.notes)||"Keine Notizen."}</div><h3>Aufgaben</h3>${ct.map(item).join("")||'<div class="empty">Keine Aufgaben.</div>'}<div class="actions"><button onclick="customer('${id}')">Bearbeiten</button><button class="primary" onclick="taskFor('${id}')">＋ Aufgabe</button></div>`;detail.showModal()}
function taskFor(id){task();setTimeout(()=>$("tc").value=id,50)}
start();if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
