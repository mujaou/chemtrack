import { useState, useMemo, useRef } from "react";

function loadSheetJS(cb) {
  if (window.XLSX) { cb(); return; }
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  s.onload = cb;
  document.head.appendChild(s);
}

const C = {
  red:"#C8102E",redLight:"#F5E6E9",white:"#FFFFFF",
  gray50:"#FAFAFA",gray100:"#F4F4F5",gray200:"#E4E4E7",
  gray300:"#D4D4D8",gray400:"#A1A1AA",gray500:"#71717A",
  gray600:"#52525B",gray800:"#27272A",gray900:"#18181B",
  green:"#15803D",greenLight:"#DCFCE7",
  yellow:"#B45309",yellowLight:"#FEF9C3",
  redAlert:"#B91C1C",redAlertLight:"#FEE2E2",
  blue:"#1D4ED8",blueLight:"#DBEAFE",
};

const initialProducts = [
  {id:1, name:"SULFATO DE ALUMÍNIO",               codeSAP:"60111242",unit:"KG",type:"sólido", supplier:"QUIMICA CREDIE LTDA",  leadTime:15,criticality:"Alta"},
  {id:2, name:"CLORETO DE SÓDIO",                  codeSAP:"60493888",unit:"KG",type:"sólido", supplier:"",                     leadTime:10,criticality:"Média"},
  {id:3, name:"ÁCIDO CÍTRICO",                     codeSAP:"60502298",unit:"KG",type:"sólido", supplier:"A M QUIMICA INDUST",   leadTime:10,criticality:"Média"},
  {id:4, name:"FLOCULANTE SC 25KG",                codeSAP:"62107397",unit:"KG",type:"sólido", supplier:"",                     leadTime:20,criticality:"Média"},
  {id:5, name:"FLOCULANTE CNT 1000L",              codeSAP:"62775833",unit:"KG",type:"líquido",supplier:"QQS COMERCIO DE PROD", leadTime:20,criticality:"Alta"},
  {id:6, name:"HIDRÓXIDO DE SÓDIO 50%",            codeSAP:"62789580",unit:"KG",type:"líquido",supplier:"A M QUIMICA INDUST",   leadTime:15,criticality:"Alta"},
  {id:7, name:"HIPOCLORITO DE SÓDIO",              codeSAP:"62789876",unit:"KG",type:"líquido",supplier:"A M QUIMICA INDUST",   leadTime:7, criticality:"Alta"},
  {id:8, name:"HIPOCLORITO DE CÁLCIO 65%",         codeSAP:"62790049",unit:"KG",type:"sólido", supplier:"",                     leadTime:10,criticality:"Média"},
  {id:9, name:"ÁCIDO CLORÍDRICO 30%",              codeSAP:"62790539",unit:"KG",type:"líquido",supplier:"",                     leadTime:12,criticality:"Alta"},
  {id:10,name:"INIBIDOR DE CORROSÃO FOSFATO",      codeSAP:"62794703",unit:"KG",type:"sólido", supplier:"",                     leadTime:25,criticality:"Alta"},
  {id:11,name:"DISPERSANTE DE INCRUSTAÇÃO",        codeSAP:"62794704",unit:"KG",type:"sólido", supplier:"",                     leadTime:25,criticality:"Média"},
  {id:12,name:"INIBIDOR CORROSÃO METAIS AMARELOS", codeSAP:"62794705",unit:"KG",type:"sólido", supplier:"",                     leadTime:25,criticality:"Média"},
  {id:13,name:"INIBIDOR DE CORROSÃO ZINCO",        codeSAP:"62794706",unit:"KG",type:"sólido", supplier:"",                     leadTime:25,criticality:"Alta"},
  {id:14,name:"POLÍMERO CATIÔNICO IBC 1000L",      codeSAP:"62794831",unit:"KG",type:"líquido",supplier:"",                     leadTime:30,criticality:"Baixa"},
];

const initialMovements = [
  // SULFATO DE ALUMÍNIO (id:1)
  {id:101,productId:1, date:"2026-01-09",type:"saida",  qty:3000, docMat:"4901083634",deposito:"BQ3",obs:""},
  {id:102,productId:1, date:"2026-02-19",type:"entrada",qty:6000, docMat:"5000417520",deposito:"RC01",obs:"Compra NF"},
  {id:103,productId:1, date:"2026-03-06",type:"saida",  qty:4000, docMat:"4901122206",deposito:"BQ3",obs:""},
  {id:104,productId:1, date:"2026-03-06",type:"saida",  qty:1000, docMat:"4901124729",deposito:"BQ3",obs:""},
  {id:105,productId:1, date:"2026-03-26",type:"saida",  qty:1125, docMat:"4901139522",deposito:"BQ3",obs:""},
  {id:106,productId:1, date:"2026-04-10",type:"saida",  qty:1125, docMat:"4901148905",deposito:"BQ3",obs:""},
  {id:107,productId:1, date:"2026-04-17",type:"saida",  qty:1125, docMat:"4901154042",deposito:"BQ3",obs:""},
  {id:108,productId:1, date:"2026-04-24",type:"entrada",qty:3000, docMat:"5000437857",deposito:"RC01",obs:"Compra NF"},
  {id:109,productId:1, date:"2026-04-24",type:"saida",  qty:3000, docMat:"4901159271",deposito:"BQ3",obs:""},
  {id:110,productId:1, date:"2026-04-27",type:"saida",  qty:1500, docMat:"4901160501",deposito:"BQ3",obs:""},
  // ÁCIDO CÍTRICO (id:3)
  {id:201,productId:3, date:"2026-01-19",type:"saida",  qty:400,  docMat:"4901090113",deposito:"BQ3",obs:""},
  {id:202,productId:3, date:"2026-02-12",type:"entrada",qty:1800, docMat:"5000415761",deposito:"RC01",obs:"Compra NF"},
  {id:203,productId:3, date:"2026-02-13",type:"saida",  qty:1250, docMat:"4901108707",deposito:"BQ3",obs:""},
  {id:204,productId:3, date:"2026-04-24",type:"entrada",qty:1800, docMat:"5000437869",deposito:"RC01",obs:"Compra NF"},
  // FLOCULANTE SC (id:4)
  {id:301,productId:4, date:"2026-01-09",type:"saida",  qty:125,  docMat:"4901083634",deposito:"BQ3",obs:""},
  {id:302,productId:4, date:"2026-01-19",type:"saida",  qty:200,  docMat:"4901090113",deposito:"BQ3",obs:""},
  // FLOCULANTE CNT (id:5)
  {id:401,productId:5, date:"2026-01-09",type:"saida",  qty:1000, docMat:"4901083841",deposito:"BQ3",obs:""},
  {id:402,productId:5, date:"2026-01-19",type:"saida",  qty:2000, docMat:"4901090113",deposito:"BQ3",obs:""},
  {id:403,productId:5, date:"2026-02-06",type:"saida",  qty:2000, docMat:"4901103001",deposito:"BQ3",obs:""},
  {id:404,productId:5, date:"2026-02-19",type:"saida",  qty:2000, docMat:"4901113197",deposito:"BQ3",obs:""},
  {id:405,productId:5, date:"2026-03-06",type:"saida",  qty:1000, docMat:"4901124729",deposito:"BQ3",obs:""},
  {id:406,productId:5, date:"2026-03-13",type:"saida",  qty:2000, docMat:"4901129556",deposito:"BQ3",obs:""},
  {id:407,productId:5, date:"2026-04-24",type:"entrada",qty:1500, docMat:"5000437901",deposito:"RC01",obs:"Compra NF"},
  {id:408,productId:5, date:"2026-04-24",type:"saida",  qty:1500, docMat:"4901159352",deposito:"BQ3",obs:""},
  // HIDRÓXIDO DE SÓDIO (id:6)
  {id:501,productId:6, date:"2026-01-09",type:"saida",  qty:1530,  docMat:"4901083634",deposito:"BQ3",obs:""},
  {id:502,productId:6, date:"2026-02-11",type:"saida",  qty:2000,  docMat:"4901107347",deposito:"BQ3",obs:""},
  {id:503,productId:6, date:"2026-02-12",type:"saida",  qty:2000,  docMat:"4901107717",deposito:"BQ3",obs:""},
  {id:504,productId:6, date:"2026-02-19",type:"entrada",qty:9180,  docMat:"5000417551",deposito:"RC01",obs:"Compra NF"},
  {id:505,productId:6, date:"2026-03-06",type:"saida",  qty:1530,  docMat:"4901124295",deposito:"BQ3",obs:""},
  {id:506,productId:6, date:"2026-03-06",type:"saida",  qty:7650,  docMat:"4901124331",deposito:"BQ3",obs:""},
  {id:507,productId:6, date:"2026-03-06",type:"saida",  qty:7650,  docMat:"4901124412",deposito:"BQ3",obs:""},
  {id:508,productId:6, date:"2026-03-20",type:"saida",  qty:1530,  docMat:"4901135219",deposito:"BQ3",obs:""},
  {id:509,productId:6, date:"2026-04-07",type:"entrada",qty:19500, docMat:"5000431941",deposito:"RC01",obs:"Compra NF"},
  {id:510,productId:6, date:"2026-04-09",type:"saida",  qty:4000,  docMat:"4901148489",deposito:"BQ3",obs:""},
  {id:511,productId:6, date:"2026-04-13",type:"saida",  qty:3000,  docMat:"4901151003",deposito:"BQ3",obs:""},
  {id:512,productId:6, date:"2026-04-15",type:"saida",  qty:1530,  docMat:"4901152426",deposito:"BQ3",obs:""},
  {id:513,productId:6, date:"2026-04-30",type:"saida",  qty:4470,  docMat:"4901163292",deposito:"BQ3",obs:""},
  // HIPOCLORITO DE SÓDIO (id:7)
  {id:601,productId:7, date:"2026-02-20",type:"entrada",qty:9000, docMat:"5000417807",deposito:"RC01",obs:"Compra NF"},
  {id:602,productId:7, date:"2026-03-19",type:"saida",  qty:1440, docMat:"4901133994",deposito:"BQ3",obs:""},
  {id:603,productId:7, date:"2026-04-13",type:"saida",  qty:1980, docMat:"4901150980",deposito:"BQ3",obs:""},
  // INIBIDOR FOSFATO (id:10)
  {id:701,productId:10,date:"2026-01-08",type:"saida", qty:1000, docMat:"4901081064",deposito:"DIF1",obs:""},
  {id:702,productId:10,date:"2026-03-24",type:"saida", qty:2000, docMat:"4901159271",deposito:"BQ3",obs:""},
  {id:703,productId:10,date:"2026-04-24",type:"entrada",qty:3000,docMat:"",deposito:"RC01",obs:"Compra NF"},
  // DISPERSANTE (id:11)
  {id:801,productId:11,date:"2026-01-08",type:"saida", qty:1000, docMat:"4901081064",deposito:"DIF1",obs:""},
  {id:802,productId:11,date:"2026-03-06",type:"saida", qty:1000, docMat:"",deposito:"BQ3",obs:""},
  // INIBIDOR METAIS AMARELOS (id:12)
  {id:901,productId:12,date:"2026-01-08",type:"saida", qty:1000, docMat:"4901081064",deposito:"DIF1",obs:""},
  {id:902,productId:12,date:"2026-03-06",type:"saida", qty:1100, docMat:"",deposito:"BQ3",obs:""},
  // INIBIDOR ZINCO (id:13)
  {id:1001,productId:13,date:"2026-01-08",type:"saida",qty:1000, docMat:"4901081064",deposito:"DIF1",obs:""},
  {id:1002,productId:13,date:"2026-03-06",type:"saida",qty:2200, docMat:"",deposito:"BQ3",obs:""},
  {id:1003,productId:13,date:"2026-04-24",type:"saida",qty:900,  docMat:"",deposito:"BQ3",obs:""},
  // POLÍMERO CATIÔNICO (id:14)
  {id:1101,productId:14,date:"2026-03-06",type:"saida",qty:3598, docMat:"",deposito:"BQ3",obs:""},
];

// Saldo SAP real extraído do relatório resumo (01/05/2026)
const stockSummary = {
  1:{sapStock:3125},2:{sapStock:13000},3:{sapStock:2350},4:{sapStock:0},
  5:{sapStock:0},6:{sapStock:10500},7:{sapStock:5580},8:{sapStock:485},
  9:{sapStock:2150},10:{sapStock:3000},11:{sapStock:6100},12:{sapStock:4200},
  13:{sapStock:4000},14:{sapStock:2},
};

const TABS=["Dashboard","Produtos","Movimentos","Importar SAP","Alertas","Relatórios"];
const MESES=["2026-01","2026-02","2026-03","2026-04","2026-05"];

function fmtN(n){return Number(n).toLocaleString("pt-BR");}
function fmtDate(s){if(!s)return"—";const[y,m,d]=s.split("-");return`${d}/${m}/${y}`;}

function StatusBadge({days}){
  if(days===999||days>=60)return<span style={{background:C.greenLight,color:C.green,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>● ADEQUADO</span>;
  if(days>=30)return<span style={{background:C.yellowLight,color:C.yellow,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>◐ ATENÇÃO</span>;
  return<span style={{background:C.redAlertLight,color:C.redAlert,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>✕ CRÍTICO</span>;
}
function CritBadge({level}){
  const m={Alta:{bg:C.redAlertLight,co:"#B91C1C"},Média:{bg:C.yellowLight,co:C.yellow},Baixa:{bg:C.greenLight,co:C.green}};
  const s=m[level]||m.Baixa;
  return<span style={{background:s.bg,color:s.co,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700}}>{level}</span>;
}
function MiniBar({value,max,color}){
  return<div style={{background:C.gray200,borderRadius:4,height:6,width:"100%",overflow:"hidden"}}>
    <div style={{background:color,width:`${Math.min(100,(value/(max||1))*100)}%`,height:"100%",borderRadius:4}}/>
  </div>;
}

const inp={border:`1.5px solid ${C.gray200}`,borderRadius:8,padding:"8px 12px",fontSize:14,color:C.gray900,background:C.white,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit"};
const btnP={background:C.red,color:C.white,border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"};
const btnS={background:C.white,color:C.gray600,border:`1.5px solid ${C.gray200}`,borderRadius:8,padding:"9px 20px",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"};
const TH={textAlign:"left",padding:"9px 14px",fontSize:10,color:C.gray400,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",borderBottom:`1px solid ${C.gray100}`};

function Modal({title,onClose,children,width=520}){
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{background:C.white,borderRadius:16,padding:32,width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontWeight:800,fontSize:17}}>{title}</div>
        <button onClick={onClose} style={{...btnS,padding:"4px 12px",fontSize:15}}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}

/* ═══ IMPORTAR SAP ═══ */
function ImportSAP({products,onImport}){
  const[step,setStep]=useState("upload");
  const[rawRows,setRawRows]=useState([]);
  const[headers,setHeaders]=useState([]);
  const[map,setMap]=useState({material:"",nome:"",data:"",qtd:"",tipo:""});
  const[importDate,setImportDate]=useState(new Date().toISOString().slice(0,10));
  const[preview,setPreview]=useState([]);
  const[fileName,setFileName]=useState("");
  const[importing,setImporting]=useState(false);
  const[result,setResult]=useState(null);
  const fileRef=useRef();

  const handleFile=(file)=>{
    if(!file)return;
    setFileName(file.name);setStep("upload");setResult(null);
    loadSheetJS(()=>{
      const reader=new FileReader();
      reader.onload=(e)=>{
        const wb=window.XLSX.read(e.target.result,{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const data=window.XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:""});
        let hdrIdx=0;
        for(let i=0;i<Math.min(10,data.length);i++){
          if(data[i].filter(c=>c!=="").length>3){hdrIdx=i;break;}
        }
        const hdrs=data[hdrIdx].map(h=>String(h||"").trim());
        const rows=data.slice(hdrIdx+1).filter(r=>r.some(c=>c!==""));
        setHeaders(hdrs);setRawRows(rows);
        const am={material:"",nome:"",data:"",qtd:"",tipo:""};
        hdrs.forEach((h,i)=>{
          const lh=h.toLowerCase();
          if(lh.includes("material")&&!lh.includes("texto"))am.material=String(i);
          if(lh.includes("texto breve")||lh.includes("descrição"))am.nome=String(i);
          if(lh.includes("data de lançamento")||lh.includes("data lçto"))am.data=String(i);
          if(lh.includes("estoque final"))am.qtd=String(i);
          else if(lh.includes("qtd")&&(lh.includes("registro")||lh.includes("saída")))am.qtd=String(i);
          if(lh.includes("tipo de movimento")||lh.includes("tmv"))am.tipo=String(i);
        });
        setMap(am);setStep("map");
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const buildPreview=()=>{
    const parsed=[];
    rawRows.slice(0,500).forEach(row=>{
      const matRaw=row[Number(map.material)];
      if(!matRaw)return;
      const matCode=String(matRaw).trim();
      if(!matCode)return;
      const nomeRaw=row[Number(map.nome)]||"";
      const qtdRaw=row[Number(map.qtd)];
      const tipoRaw=map.tipo?String(row[Number(map.tipo)]||""):"";
      let dataRaw=map.data?row[Number(map.data)]:importDate;
      if(!qtdRaw&&qtdRaw!==0)return;
      let dateStr=importDate;
      if(dataRaw){
        if(typeof dataRaw==="number"){const d=new Date((dataRaw-25569)*86400*1000);dateStr=d.toISOString().slice(0,10);}
        else if(typeof dataRaw==="string"&&dataRaw.includes(".")){const[dd,mm,yy]=dataRaw.split(".");dateStr=`${yy}-${mm}-${dd}`;}
        else if(dataRaw instanceof Date)dateStr=dataRaw.toISOString().slice(0,10);
      }
      const qtd=parseFloat(String(qtdRaw).replace(/\./g,"").replace(",","."));
      if(isNaN(qtd))return;
      const prod=products.find(p=>p.codeSAP===matCode);
      const tipoNum=tipoRaw.trim();
      let type="saida";
      if(tipoNum===""||tipoNum==="0")type=qtd>=0?"saldo":"saida";
      else if(["101","311","202"].includes(tipoNum))type="entrada";
      else if(tipoNum==="201"||tipoNum==="261")type="saida";
      parsed.push({codeSAP:matCode,nome:String(nomeRaw).slice(0,40)||matCode,date:dateStr,qty:Math.abs(qtd),type,tipoMov:tipoNum,matched:!!prod,productId:prod?.id});
    });
    setPreview(parsed);setStep("preview");
  };

  const doImport=()=>{
    setImporting(true);
    const newMovements=[];const newProducts=[];let newProds=0;
    const tempProds={};
    preview.forEach((row,i)=>{
      let pid=row.productId;
      if(!pid){
        if(!tempProds[row.codeSAP]){
          const np={id:Date.now()+i,name:row.nome.toUpperCase(),codeSAP:row.codeSAP,unit:"KG",type:"sólido",supplier:"",leadTime:15,criticality:"Média"};
          newProducts.push(np);tempProds[row.codeSAP]=np.id;newProds++;
        }
        pid=tempProds[row.codeSAP];
      }
      newMovements.push({id:Date.now()+i+5000,productId:pid,date:row.date,type:row.type,qty:row.qty,docMat:"IMPORT-SAP",deposito:"BQ3",obs:`Importado: ${fileName}`});
    });
    setTimeout(()=>{
      onImport(newMovements,newProducts,fileName);
      setResult({added:newMovements.length,newProds});
      setImporting(false);setStep("done");
    },700);
  };

  const stepLabels=["1. Arquivo","2. Colunas","3. Revisão","4. Concluído"];
  const stepKeys=["upload","map","preview","done"];

  return<div>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:21,fontWeight:800}}>Importar Relatório SAP</div>
      <div style={{fontSize:12,color:C.gray400,marginTop:2}}>Suporta MB51 (movimentos), MB52/MB5B (resumo) e Extrato de depósito</div>
    </div>

    {/* Stepper */}
    <div style={{display:"flex",gap:0,marginBottom:24,background:C.white,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      {stepLabels.map((s,i)=>{
        const active=stepKeys[i]===step;
        const done=stepKeys.indexOf(step)>i;
        return<div key={s} style={{flex:1,padding:"13px 0",textAlign:"center",fontSize:12,fontWeight:active?700:500,color:active?C.red:done?C.green:C.gray400,background:active?C.redLight:done?C.greenLight:"transparent",borderBottom:active?`2px solid ${C.red}`:done?`2px solid ${C.green}`:`2px solid ${C.gray200}`}}>
          {done?"✓ ":""}{s}
        </div>;
      })}
    </div>

    {/* STEP 1 */}
    {step==="upload"&&<div>
      <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}}
        onClick={()=>fileRef.current.click()}
        style={{border:`2px dashed ${C.gray300}`,borderRadius:16,padding:56,textAlign:"center",cursor:"pointer",background:C.gray50}}>
        <div style={{fontSize:44,marginBottom:10}}>📊</div>
        <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Arraste o arquivo Excel do SAP aqui</div>
        <div style={{color:C.gray400,fontSize:13,marginBottom:16}}>ou clique para selecionar · .xlsx</div>
        <div style={{display:"inline-block",...btnP}}>Selecionar arquivo</div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
      </div>
      <div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[
          {icon:"📋",title:"MB51 – Movimentos",desc:"Entradas e saídas por documento"},
          {icon:"📋",title:"MB52 / MB5B – Resumo",desc:"Estoque final por produto"},
          {icon:"📋",title:"Extrato de Depósito",desc:"Histórico por material e depósito"},
        ].map(f=><div key={f.title} style={{background:C.blueLight,borderRadius:10,padding:14}}>
          <div style={{fontWeight:700,fontSize:12,color:C.blue,marginBottom:4}}>{f.icon} {f.title}</div>
          <div style={{fontSize:11,color:C.blue}}>{f.desc}</div>
        </div>)}
      </div>
      <div style={{marginTop:12,background:C.greenLight,borderRadius:10,padding:12,color:C.green,fontSize:12}}>
        <b>✓ Dados históricos já carregados:</b> Jan–Mai 2026 · {initialProducts.length} produtos · {initialMovements.length} movimentos extraídos das suas planilhas SAP
      </div>
    </div>}

    {/* STEP 2 */}
    {step==="map"&&<div>
      <div style={{background:C.greenLight,borderRadius:8,padding:11,marginBottom:18,fontSize:13,color:C.green}}>
        ✓ <b>{fileName}</b> · {rawRows.length} linhas · {headers.length} colunas detectadas
      </div>
      <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.gray200}`,padding:20,marginBottom:18}}>
        <div style={{fontWeight:700,marginBottom:14,fontSize:14}}>Mapeamento de Colunas</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {label:"Código do Material (SAP) *",field:"material"},
            {label:"Nome / Descrição",field:"nome"},
            {label:"Data do Lançamento",field:"data"},
            {label:"Quantidade *",field:"qtd"},
            {label:"Tipo de Movimento",field:"tipo"},
          ].map(f=><div key={f.field}>
            <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>{f.label}</label>
            <select style={inp} value={map[f.field]} onChange={e=>setMap(m=>({...m,[f.field]:e.target.value}))}>
              <option value="">— não usar —</option>
              {headers.map((h,i)=><option key={i} value={String(i)}>{h||`Coluna ${i+1}`}</option>)}
            </select>
          </div>)}
        </div>
        <div style={{marginTop:14}}>
          <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>Data de referência (se não houver coluna de data)</label>
          <input type="date" style={{...inp,width:220}} value={importDate} onChange={e=>setImportDate(e.target.value)}/>
        </div>
      </div>
      {/* Mini preview */}
      <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.gray200}`,overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.gray100}`,fontWeight:600,fontSize:12}}>Prévia (5 primeiras linhas)</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr>{headers.slice(0,8).map((h,i)=><th key={i} style={{...TH,fontSize:10}}>{h||`Col${i}`}</th>)}</tr></thead>
            <tbody>{rawRows.slice(0,5).map((r,i)=><tr key={i}>{r.slice(0,8).map((c,j)=><td key={j} style={{padding:"5px 10px",borderBottom:`1px solid ${C.gray100}`}}>{String(c||"").slice(0,20)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button style={btnS} onClick={()=>setStep("upload")}>← Voltar</button>
        <button style={btnP} onClick={buildPreview} disabled={!map.material||!map.qtd}>Processar →</button>
      </div>
    </div>}

    {/* STEP 3 */}
    {step==="preview"&&<div>
      <div style={{display:"flex",gap:12,marginBottom:16}}>
        {[
          {v:preview.filter(p=>p.matched).length,label:"reconhecidos",color:C.green,bg:C.greenLight},
          {v:preview.filter(p=>!p.matched).length,label:"novos produtos",color:C.yellow,bg:C.yellowLight},
          {v:preview.length,label:"registros total",color:C.blue,bg:C.blueLight},
        ].map(k=><div key={k.label} style={{flex:1,background:k.bg,borderRadius:10,padding:14,textAlign:"center"}}>
          <div style={{fontSize:28,fontWeight:800,color:k.color}}>{k.v}</div>
          <div style={{fontSize:11,color:k.color}}>{k.label}</div>
        </div>)}
      </div>
      <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.gray200}`,overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.gray100}`,fontWeight:600,fontSize:13}}>Registros a importar</div>
        <div style={{maxHeight:300,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead style={{position:"sticky",top:0}}>
              <tr style={{background:C.gray50}}>
                {["Código SAP","Produto","Data","Qtd KG","Tipo","Status"].map(h=><th key={h} style={TH}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {preview.map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.gray100}`,background:i%2===0?C.white:C.gray50}}>
                <td style={{padding:"6px 12px",fontFamily:"monospace",fontSize:10}}>{r.codeSAP}</td>
                <td style={{padding:"6px 12px",fontWeight:500}}>{r.nome}</td>
                <td style={{padding:"6px 12px"}}>{fmtDate(r.date)}</td>
                <td style={{padding:"6px 12px",fontWeight:700}}>{fmtN(r.qty)}</td>
                <td style={{padding:"6px 12px"}}>
                  <span style={{background:r.type==="entrada"?C.greenLight:r.type==="saldo"?C.blueLight:C.redAlertLight,color:r.type==="entrada"?C.green:r.type==="saldo"?C.blue:C.redAlert,padding:"1px 7px",borderRadius:20,fontSize:10,fontWeight:700}}>
                    {r.type==="entrada"?"ENTRADA":r.type==="saldo"?"SALDO":"SAÍDA"}
                  </span>
                </td>
                <td style={{padding:"6px 12px"}}>
                  {r.matched
                    ?<span style={{color:C.green,fontSize:10,fontWeight:700}}>✓ OK</span>
                    :<span style={{color:C.yellow,fontSize:10,fontWeight:700}}>⚡ Novo</span>}
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button style={btnS} onClick={()=>setStep("map")}>← Voltar</button>
        <button style={{...btnP,opacity:importing?0.7:1}} onClick={doImport} disabled={importing}>
          {importing?"Importando...":"✓ Confirmar Importação"}
        </button>
      </div>
    </div>}

    {/* STEP 4 */}
    {step==="done"&&result&&<div style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:56,marginBottom:14}}>✅</div>
      <div style={{fontSize:21,fontWeight:800,marginBottom:6}}>Importação Concluída!</div>
      <div style={{color:C.gray400,marginBottom:24,fontSize:13}}>{fileName}</div>
      <div style={{display:"flex",gap:16,justifyContent:"center",marginBottom:28}}>
        <div style={{background:C.greenLight,borderRadius:12,padding:"16px 28px"}}>
          <div style={{fontSize:30,fontWeight:800,color:C.green}}>{result.added}</div>
          <div style={{fontSize:12,color:C.green}}>movimentos importados</div>
        </div>
        {result.newProds>0&&<div style={{background:C.yellowLight,borderRadius:12,padding:"16px 28px"}}>
          <div style={{fontSize:30,fontWeight:800,color:C.yellow}}>{result.newProds}</div>
          <div style={{fontSize:12,color:C.yellow}}>produtos auto-cadastrados</div>
        </div>}
      </div>
      <button style={btnS} onClick={()=>{setStep("upload");setPreview([]);setRawRows([]);setFileName("");}}>+ Importar outro arquivo</button>
    </div>}
  </div>;
}

/* ═══════════════════════════════════════════════ */
/*                  APP PRINCIPAL                  */
/* ═══════════════════════════════════════════════ */
export default function App(){
  const[tab,setTab]=useState("Dashboard");
  const[products,setProducts]=useState(initialProducts);
  const[movements,setMovements]=useState(initialMovements);
  const[showAddProd,setShowAddProd]=useState(false);
  const[showAddMov,setShowAddMov]=useState(false);
  const[newProd,setNewProd]=useState({name:"",codeSAP:"",unit:"KG",type:"sólido",supplier:"",leadTime:15,criticality:"Média"});
  const[newMov,setNewMov]=useState({productId:"",date:new Date().toISOString().slice(0,10),type:"saida",qty:"",obs:""});
  const[logs,setLogs]=useState([{id:1,user:"sistema",action:"Histórico SAP Jan–Mai 2026 carregado · 14 produtos · 54 movimentos",date:"01/05/2026 00:00"}]);
  const[filterMov,setFilterMov]=useState("");

  function addLog(action){setLogs(l=>[{id:Date.now(),user:"operador",action,date:new Date().toLocaleString("pt-BR")},...l]);}

  const analytics=useMemo(()=>products.map(p=>{
    const movs=movements.filter(m=>m.productId===p.id).sort((a,b)=>a.date.localeCompare(b.date));
    const currentStock=stockSummary[p.id]?.sapStock??0;
    const today=new Date("2026-05-01");
    const d30=new Date(today);d30.setDate(d30.getDate()-30);
    const saidas30=movs.filter(m=>m.type==="saida"&&new Date(m.date)>=d30).reduce((s,m)=>s+m.qty,0);
    const dailyAvg=saidas30/30;
    const coverageDays=dailyAvg>0?Math.round(currentStock/dailyAvg):999;
    const totalEntradas=movs.filter(m=>m.type==="entrada").reduce((s,m)=>s+m.qty,0);
    const totalSaidas=movs.filter(m=>m.type==="saida").reduce((s,m)=>s+m.qty,0);
    const suggestedPurchase=Math.max(0,(dailyAvg*60)-currentStock+(dailyAvg*p.leadTime));
    const byMonth={};
    movs.filter(m=>m.type==="saida").forEach(m=>{const mes=m.date.slice(0,7);byMonth[mes]=(byMonth[mes]||0)+m.qty;});
    return{...p,currentStock,dailyAvg,saidas30,coverageDays,totalEntradas,totalSaidas,suggestedPurchase,byMonth,movs};
  }),[products,movements]);

  const alerts=useMemo(()=>{
    const a=[];
    analytics.forEach(p=>{
      if(p.coverageDays<60&&p.coverageDays!==999)a.push({type:p.coverageDays<30?"critical":"warning",product:p.name,msg:`Cobertura de apenas ${p.coverageDays} dias`,cod:p.codeSAP});
      if(p.currentStock===0&&p.movs.length>0)a.push({type:"critical",product:p.name,msg:"Estoque SAP zerado",cod:p.codeSAP});
    });
    return a;
  },[analytics]);

  const kpis=useMemo(()=>({
    total:analytics.length,
    critical:analytics.filter(p=>p.coverageDays<30&&p.coverageDays!==999).length,
    attention:analytics.filter(p=>p.coverageDays>=30&&p.coverageDays<60).length,
    zeroed:analytics.filter(p=>p.currentStock===0).length,
  }),[analytics]);

  function handleImport(newMovements,newProds,fileName){
    setMovements(m=>[...m,...newMovements]);
    if(newProds.length>0)setProducts(p=>[...p,...newProds]);
    addLog(`Importou ${newMovements.length} registros de ${fileName}${newProds.length>0?` · ${newProds.length} produtos novos`:""}`);
  }

  function handleAddProd(e){
    e.preventDefault();
    const p={...newProd,id:Date.now(),leadTime:Number(newProd.leadTime)};
    setProducts(pr=>[...pr,p]);addLog(`Cadastrou ${p.codeSAP} – ${p.name}`);
    setNewProd({name:"",codeSAP:"",unit:"KG",type:"sólido",supplier:"",leadTime:15,criticality:"Média"});
    setShowAddProd(false);
  }

  function handleAddMov(e){
    e.preventDefault();
    const m={...newMov,id:Date.now(),productId:Number(newMov.productId),qty:Number(newMov.qty),docMat:"MANUAL",deposito:"BQ3"};
    setMovements(mv=>[...mv,m]);
    const pName=products.find(p=>p.id===m.productId)?.name??"";
    addLog(`${m.type==="entrada"?"Entrada":"Saída"} manual: ${fmtN(m.qty)} KG – ${pName}`);
    setNewMov({productId:"",date:new Date().toISOString().slice(0,10),type:"saida",qty:"",obs:""});
    setShowAddMov(false);
  }

  const filteredMovs=useMemo(()=>{
    const mv=[...movements].sort((a,b)=>b.date.localeCompare(a.date));
    if(!filterMov)return mv;
    const pIds=products.filter(p=>p.name.toLowerCase().includes(filterMov.toLowerCase())||p.codeSAP.includes(filterMov)).map(p=>p.id);
    return mv.filter(m=>pIds.includes(m.productId));
  },[movements,products,filterMov]);

  const maxStock=Math.max(...analytics.map(x=>x.currentStock))||1;
  const maxSaidas=Math.max(...analytics.map(x=>x.totalSaidas))||1;

  return<div style={{minHeight:"100vh",background:C.gray50,fontFamily:"'IBM Plex Sans','Helvetica Neue',Arial,sans-serif",color:C.gray900}}>

    {/* HEADER */}
    <header style={{background:C.red,color:C.white,padding:"0 24px",display:"flex",alignItems:"center",gap:14,height:60,boxShadow:"0 2px 16px rgba(200,16,46,0.2)",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,background:"rgba(255,255,255,0.15)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:900}}>⬡</div>
        <div>
          <div style={{fontWeight:800,fontSize:14,letterSpacing:0.5}}>CHEMTRACK</div>
          <div style={{fontSize:9,opacity:0.75,letterSpacing:1.5,textTransform:"uppercase"}}>Refinaria de Manaus · C201</div>
        </div>
      </div>
      <div style={{flex:1}}/>
      <nav style={{display:"flex",gap:2}}>
        {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"rgba(255,255,255,0.18)":"transparent",color:C.white,border:tab===t?"1.5px solid rgba(255,255,255,0.3)":"1.5px solid transparent",borderRadius:7,padding:"5px 12px",fontWeight:tab===t?700:500,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
          {t==="Importar SAP"?"📊 "+t:t}
        </button>)}
      </nav>
      {alerts.filter(a=>a.type==="critical").length>0&&<div style={{background:"rgba(0,0,0,0.15)",borderRadius:8,padding:"5px 12px",fontSize:11}}>
        <span style={{background:C.white,color:C.red,borderRadius:20,padding:"1px 7px",fontWeight:800,marginRight:5}}>{alerts.filter(a=>a.type==="critical").length}</span>críticos
      </div>}
    </header>

    <main style={{maxWidth:1340,margin:"0 auto",padding:"22px 18px"}}>

      {/* ══ DASHBOARD ══ */}
      {tab==="Dashboard"&&<div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontSize:20,fontWeight:800}}>Dashboard Gerencial</div>
            <div style={{fontSize:11,color:C.gray400,marginTop:2}}>Centro C201 · Refinaria de Manaus S.A. · Posição em 01/05/2026</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setTab("Importar SAP")} style={{...btnP,fontSize:12}}>📊 Importar SAP</button>
            <button onClick={()=>setShowAddMov(true)} style={{...btnS,fontSize:12}}>+ Lançamento Manual</button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          {[
            {label:"Total Produtos",value:kpis.total,sub:`${movements.length} movimentos`,color:C.red,icon:"⬡"},
            {label:"Status Crítico",value:kpis.critical,sub:"cobertura < 30d",color:"#B91C1C",icon:"✕"},
            {label:"Em Atenção",value:kpis.attention,sub:"cobertura 30–59d",color:C.yellow,icon:"◐"},
            {label:"Zerados",value:kpis.zeroed,sub:"sem saldo SAP",color:C.gray500,icon:"○"},
          ].map(k=><div key={k.label} style={{background:C.white,borderRadius:12,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",borderTop:`3px solid ${k.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{fontSize:10,color:C.gray400,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"}}>{k.label}</div>
              <div style={{color:k.color,fontSize:15}}>{k.icon}</div>
            </div>
            <div style={{fontSize:32,fontWeight:800,color:k.color,lineHeight:1,margin:"7px 0 3px"}}>{k.value}</div>
            <div style={{fontSize:10,color:C.gray400}}>{k.sub}</div>
          </div>)}
        </div>

        {/* Tabela de status */}
        <div style={{background:C.white,borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden",marginBottom:16}}>
          <div style={{padding:"13px 20px",borderBottom:`1px solid ${C.gray100}`,display:"flex",justifyContent:"space-between"}}>
            <div style={{fontWeight:700,fontSize:14}}>Status de Estoque — Saldo SAP</div>
            <div style={{fontSize:11,color:C.gray400}}>01/05/2026</div>
          </div>
          <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:C.gray50}}>
              {["Produto","SAP","Estoque (KG)","Cons./dia","Cobertura","Compra Sugerida","Status"].map(h=><th key={h} style={TH}>{h}</th>)}
            </tr></thead>
            <tbody>
              {analytics.map((p,i)=><tr key={p.id} style={{borderBottom:`1px solid ${C.gray100}`,background:i%2===0?C.white:C.gray50}}>
                <td style={{padding:"10px 14px"}}>
                  <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
                  <div style={{fontSize:10,color:C.gray400,marginTop:1}}>{p.type} · <CritBadge level={p.criticality}/></div>
                </td>
                <td style={{padding:"10px 14px",fontSize:11,fontFamily:"monospace",color:C.gray400}}>{p.codeSAP}</td>
                <td style={{padding:"10px 14px",minWidth:140}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{fmtN(p.currentStock)} KG</div>
                  <MiniBar value={p.currentStock} max={maxStock} color={p.coverageDays<30?C.red:p.coverageDays<60?C.yellow:C.green}/>
                </td>
                <td style={{padding:"10px 14px",fontSize:12,fontWeight:600}}>{p.dailyAvg.toFixed(1)} KG/d</td>
                <td style={{padding:"10px 14px"}}>
                  <div style={{fontWeight:700,fontSize:13,color:p.coverageDays<30?C.red:p.coverageDays<60?C.yellow:C.green}}>
                    {p.coverageDays===999?"∞":`${p.coverageDays}d`}
                  </div>
                </td>
                <td style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:p.suggestedPurchase>0?C.red:C.gray300}}>
                  {p.suggestedPurchase>0?`${fmtN(Math.round(p.suggestedPurchase))} KG`:"—"}
                </td>
                <td style={{padding:"10px 14px"}}><StatusBadge days={p.coverageDays}/></td>
              </tr>)}
            </tbody>
          </table>
          </div>
        </div>

        {/* Histórico de consumo mensal */}
        <div style={{background:C.white,borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <div style={{padding:"13px 20px",borderBottom:`1px solid ${C.gray100}`}}>
            <div style={{fontWeight:700,fontSize:14}}>Histórico de Consumo Mensal — Jan a Mai 2026</div>
            <div style={{fontSize:11,color:C.gray400,marginTop:2}}>Saídas SAP · Depósito BQ3 · Centro C201</div>
          </div>
          <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:C.gray50}}>
              <th style={TH}>Produto</th>
              {MESES.map(m=><th key={m} style={{...TH,textAlign:"right"}}>{m.replace("2026-","")}/26</th>)}
              <th style={{...TH,textAlign:"right"}}>TOTAL</th>
            </tr></thead>
            <tbody>
              {analytics.map((p,i)=>{
                const total=Object.values(p.byMonth).reduce((s,v)=>s+v,0);
                return<tr key={p.id} style={{borderBottom:`1px solid ${C.gray100}`,background:i%2===0?C.white:C.gray50}}>
                  <td style={{padding:"9px 14px",fontWeight:600,fontSize:12}}>{p.name}</td>
                  {MESES.map(m=><td key={m} style={{padding:"9px 14px",textAlign:"right",fontSize:12,fontWeight:p.byMonth[m]?600:400,color:p.byMonth[m]?C.gray900:C.gray300}}>
                    {p.byMonth[m]?fmtN(p.byMonth[m]):"—"}
                  </td>)}
                  <td style={{padding:"9px 14px",textAlign:"right",fontWeight:800,fontSize:12,color:total?C.red:C.gray300}}>{total?fmtN(total):"—"}</td>
                </tr>;
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>}

      {/* ══ PRODUTOS ══ */}
      {tab==="Produtos"&&<div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontSize:20,fontWeight:800}}>Cadastro de Produtos</div>
            <div style={{fontSize:11,color:C.gray400,marginTop:2}}>{products.length} produtos cadastrados</div>
          </div>
          <button onClick={()=>setShowAddProd(true)} style={btnP}>+ Novo Produto</button>
        </div>
        {showAddProd&&<Modal title="Novo Produto Químico" onClose={()=>setShowAddProd(false)}>
          <form onSubmit={handleAddProd}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[{label:"Nome do Produto",field:"name",full:true},{label:"Código SAP",field:"codeSAP"},{label:"Fornecedor",field:"supplier"},{label:"Lead Time (dias)",field:"leadTime",type:"number"}].map(f=><div key={f.field} style={{gridColumn:f.full?"1/-1":"auto"}}>
                <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>{f.label}</label>
                <input style={inp} type={f.type||"text"} value={newProd[f.field]} required onChange={e=>setNewProd(p=>({...p,[f.field]:e.target.value}))}/>
              </div>)}
              {[{label:"Unidade",field:"unit",opts:["KG","L","m³","t"]},{label:"Tipo",field:"type",opts:["sólido","líquido","gasoso"]},{label:"Criticidade",field:"criticality",opts:["Alta","Média","Baixa"]}].map(f=><div key={f.field}>
                <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>{f.label}</label>
                <select style={inp} value={newProd[f.field]} onChange={e=>setNewProd(p=>({...p,[f.field]:e.target.value}))}>
                  {f.opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>)}
            </div>
            <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
              <button type="button" style={btnS} onClick={()=>setShowAddProd(false)}>Cancelar</button>
              <button type="submit" style={btnP}>Salvar</button>
            </div>
          </form>
        </Modal>}
        <div style={{background:C.white,borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:C.gray50}}>
              {["Produto","Código SAP","Un.","Tipo","Fornecedor","Lead Time","Estoque SAP","Cobertura","Criticidade"].map(h=><th key={h} style={TH}>{h}</th>)}
            </tr></thead>
            <tbody>
              {analytics.map((p,i)=><tr key={p.id} style={{borderBottom:`1px solid ${C.gray100}`,background:i%2===0?C.white:C.gray50}}>
                <td style={{padding:"11px 14px",fontWeight:600,fontSize:13}}>{p.name}</td>
                <td style={{padding:"11px 14px",fontSize:11,fontFamily:"monospace",color:C.gray400}}>{p.codeSAP}</td>
                <td style={{padding:"11px 14px",fontSize:12}}>{p.unit}</td>
                <td style={{padding:"11px 14px",fontSize:12,textTransform:"capitalize"}}>{p.type}</td>
                <td style={{padding:"11px 14px",fontSize:12,color:C.gray600}}>{p.supplier||"—"}</td>
                <td style={{padding:"11px 14px",fontSize:12}}>{p.leadTime}d</td>
                <td style={{padding:"11px 14px",fontWeight:700,fontSize:12}}>{fmtN(p.currentStock)} KG</td>
                <td style={{padding:"11px 14px"}}><StatusBadge days={p.coverageDays}/></td>
                <td style={{padding:"11px 14px"}}><CritBadge level={p.criticality}/></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>}

      {/* ══ MOVIMENTOS ══ */}
      {tab==="Movimentos"&&<div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontSize:20,fontWeight:800}}>Movimentos de Estoque</div>
            <div style={{fontSize:11,color:C.gray400,marginTop:2}}>{movements.length} registros · SAP + Manuais</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <input style={{...inp,width:230}} placeholder="Filtrar produto ou código..." value={filterMov} onChange={e=>setFilterMov(e.target.value)}/>
            <button onClick={()=>setShowAddMov(true)} style={btnP}>+ Lançamento Manual</button>
          </div>
        </div>
        {showAddMov&&<Modal title="Lançamento Manual" onClose={()=>setShowAddMov(false)} width={460}>
          <form onSubmit={handleAddMov}>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>Produto</label>
                <select style={inp} value={newMov.productId} required onChange={e=>setNewMov(m=>({...m,productId:e.target.value}))}>
                  <option value="">Selecione...</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name} ({p.codeSAP})</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>Tipo</label>
                  <select style={inp} value={newMov.type} onChange={e=>setNewMov(m=>({...m,type:e.target.value}))}>
                    <option value="saida">↓ Saída (consumo)</option>
                    <option value="entrada">↑ Entrada (compra)</option>
                    <option value="saldo">= Saldo SAP</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>Data</label>
                  <input style={inp} type="date" value={newMov.date} required onChange={e=>setNewMov(m=>({...m,date:e.target.value}))}/>
                </div>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>Quantidade (KG)</label>
                <input style={inp} type="number" min="0" step="any" placeholder="0" value={newMov.qty} required onChange={e=>setNewMov(m=>({...m,qty:e.target.value}))}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:C.gray600,display:"block",marginBottom:4}}>Observação / Doc. SAP</label>
                <input style={inp} type="text" placeholder="Nº do documento, NF, motivo..." value={newMov.obs} onChange={e=>setNewMov(m=>({...m,obs:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
              <button type="button" style={btnS} onClick={()=>setShowAddMov(false)}>Cancelar</button>
              <button type="submit" style={btnP}>Salvar</button>
            </div>
          </form>
        </Modal>}
        <div style={{background:C.white,borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:C.gray50}}>
              {["Data","Produto","Código SAP","Tipo","Qtd KG","Dep.","Doc. Material","Obs."].map(h=><th key={h} style={TH}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filteredMovs.slice(0,120).map((m,i)=>{
                const prod=products.find(p=>p.id===m.productId);
                return<tr key={m.id} style={{borderBottom:`1px solid ${C.gray100}`,background:i%2===0?C.white:C.gray50}}>
                  <td style={{padding:"8px 14px",fontSize:12,whiteSpace:"nowrap"}}>{fmtDate(m.date)}</td>
                  <td style={{padding:"8px 14px",fontWeight:600,fontSize:12}}>{prod?.name||"—"}</td>
                  <td style={{padding:"8px 14px",fontSize:10,fontFamily:"monospace",color:C.gray400}}>{prod?.codeSAP||"—"}</td>
                  <td style={{padding:"8px 14px"}}>
                    <span style={{background:m.type==="entrada"?C.greenLight:m.type==="saldo"?C.blueLight:C.redAlertLight,color:m.type==="entrada"?C.green:m.type==="saldo"?C.blue:C.redAlert,padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700}}>
                      {m.type==="entrada"?"↑ ENTRADA":m.type==="saldo"?"= SALDO":"↓ SAÍDA"}
                    </span>
                  </td>
                  <td style={{padding:"8px 14px",fontSize:12,fontWeight:700}}>{fmtN(m.qty)}</td>
                  <td style={{padding:"8px 14px",fontSize:11,color:C.gray400}}>{m.deposito||"—"}</td>
                  <td style={{padding:"8px 14px",fontSize:10,fontFamily:"monospace",color:C.gray400}}>{m.docMat||"—"}</td>
                  <td style={{padding:"8px 14px",fontSize:11,color:C.gray400}}>{m.obs||"—"}</td>
                </tr>;
              })}
            </tbody>
          </table>
          {filteredMovs.length>120&&<div style={{padding:10,textAlign:"center",fontSize:12,color:C.gray400}}>Mostrando 120 de {filteredMovs.length} registros</div>}
        </div>
      </div>}

      {/* ══ IMPORTAR SAP ══ */}
      {tab==="Importar SAP"&&<ImportSAP products={products} onImport={handleImport}/>}

      {/* ══ ALERTAS ══ */}
      {tab==="Alertas"&&<div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800}}>Central de Alertas</div>
          <div style={{fontSize:11,color:C.gray400,marginTop:2}}>{alerts.length} alertas ativos</div>
        </div>
        {alerts.length===0&&<div style={{background:C.greenLight,borderRadius:12,padding:36,textAlign:"center",color:C.green,fontWeight:700,fontSize:14}}>✓ Nenhum alerta. Todos os estoques adequados!</div>}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
          {alerts.map((a,i)=><div key={i} style={{background:C.white,borderRadius:12,padding:"13px 17px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",borderLeft:`4px solid ${a.type==="critical"?C.red:C.yellow}`,display:"flex",alignItems:"center",gap:12}}>
            <div style={{color:a.type==="critical"?C.red:C.yellow,fontSize:18}}>{a.type==="critical"?"✕":"⚠"}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13}}>{a.product}</div>
              <div style={{fontSize:12,color:C.gray600,marginTop:1}}>{a.msg} · <span style={{fontFamily:"monospace",fontSize:11}}>{a.cod}</span></div>
            </div>
            <span style={{background:a.type==="critical"?C.redAlertLight:C.yellowLight,color:a.type==="critical"?C.red:C.yellow,padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:700}}>
              {a.type==="critical"?"CRÍTICO":"ATENÇÃO"}
            </span>
          </div>)}
        </div>
        <div style={{background:C.white,borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <div style={{padding:"13px 20px",borderBottom:`1px solid ${C.gray100}`}}>
            <div style={{fontWeight:700,fontSize:14}}>Log de Auditoria</div>
          </div>
          {logs.map((l,i)=><div key={l.id} style={{padding:"10px 20px",borderBottom:`1px solid ${C.gray100}`,display:"flex",gap:12,alignItems:"center",background:i%2===0?C.white:C.gray50}}>
            <div style={{width:28,height:28,background:C.redLight,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:C.red,fontSize:12,fontWeight:700,flexShrink:0}}>{l.user[0].toUpperCase()}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600}}>{l.action}</div>
              <div style={{fontSize:10,color:C.gray400,marginTop:1}}>por <b>{l.user}</b></div>
            </div>
            <div style={{fontSize:10,color:C.gray400,flexShrink:0}}>{l.date}</div>
          </div>)}
        </div>
      </div>}

      {/* ══ RELATÓRIOS ══ */}
      {tab==="Relatórios"&&<div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800}}>Relatórios e Análises</div>
          <div style={{fontSize:11,color:C.gray400,marginTop:2}}>Jan–Mai 2026 · Centro C201 · Refinaria de Manaus S.A.</div>
        </div>
        <div style={{background:C.white,borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",padding:20,marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Consumo Total por Produto (Jan–Mai 2026)</div>
          {[...analytics].sort((a,b)=>b.totalSaidas-a.totalSaidas).map(p=><div key={p.id} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:12,fontWeight:600}}>{p.name}</span>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <span style={{fontSize:10,color:C.gray400}}>Entradas: {fmtN(p.totalEntradas)} KG</span>
                <span style={{fontSize:12,fontWeight:700,color:C.red}}>Saídas: {fmtN(p.totalSaidas)} KG</span>
              </div>
            </div>
            <MiniBar value={p.totalSaidas} max={maxSaidas} color={C.red}/>
          </div>)}
        </div>
        <div style={{background:C.white,borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"13px 20px",borderBottom:`1px solid ${C.gray100}`}}>
            <div style={{fontWeight:700,fontSize:14}}>Plano de Compras — Cobertura 60 dias</div>
          </div>
          {analytics.filter(p=>p.suggestedPurchase>0).length===0&&<div style={{padding:20,color:C.gray400,textAlign:"center",fontSize:13}}>✓ Todos os produtos com cobertura adequada</div>}
          {analytics.filter(p=>p.suggestedPurchase>0).map(p=><div key={p.id} style={{padding:"11px 20px",borderBottom:`1px solid ${C.gray100}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
              <div style={{fontSize:11,color:C.gray400}}>Lead time: {p.leadTime}d · Saldo: {fmtN(p.currentStock)} KG · Cons.: {p.dailyAvg.toFixed(1)} KG/d</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:800,fontSize:14,color:C.red}}>{fmtN(Math.round(p.suggestedPurchase))} KG</div>
              <StatusBadge days={p.coverageDays}/>
            </div>
          </div>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button style={{...btnP,fontSize:12}} onClick={()=>alert("Para exportar Excel: adicione SheetJS (já incluso na aba Importar) e chame XLSX.writeFile()")}>⬇ Exportar Excel</button>
          <button style={{...btnS,fontSize:12}} onClick={()=>alert("Para exportar PDF: adicione a biblioteca pdfmake via npm")}>⬇ Exportar PDF</button>
        </div>
      </div>}

    </main>

    <footer style={{borderTop:`1px solid ${C.gray200}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",background:C.white,marginTop:24}}>
      <div style={{fontSize:11,color:C.gray400}}>CHEMTRACK · Refinaria de Manaus S.A. · Centro C201</div>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <div style={{fontSize:11,color:C.gray400}}>{products.length} produtos · {movements.length} movimentos</div>
        <div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/>
        <div style={{fontSize:11,color:C.green,fontWeight:600}}>Online</div>
      </div>
    </footer>
  </div>;
}
