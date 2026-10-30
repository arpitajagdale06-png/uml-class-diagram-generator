import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Trash2, Download, Code2, Boxes, GitBranch, Sparkles, X, Copy, Check, RotateCcw, ChevronDown } from 'lucide-react';
import './style.css';

const initialClasses = [
  { id: 1, name: 'Student', x: 110, y: 110, attributes: [{ id: 11, visibility: '-', name: 'rollNo', type: 'int' }, { id: 12, visibility: '-', name: 'name', type: 'String' }, { id: 13, visibility: '-', name: 'cgpa', type: 'double' }], methods: [{ id: 14, visibility: '+', name: 'getDetails', returnType: 'String', params: '' }, { id: 15, visibility: '+', name: 'calculateGrade', returnType: 'char', params: '' }] },
  { id: 2, name: 'Result', x: 470, y: 110, attributes: [{ id: 21, visibility: '-', name: 'subject', type: 'String' }, { id: 22, visibility: '-', name: 'marks', type: 'double' }], methods: [{ id: 23, visibility: '+', name: 'getGrade', returnType: 'char', params: '' }] }
];
const uid = () => Date.now() + Math.floor(Math.random() * 10000);
const javaType = t => ({ String: 'String', int: 'int', double: 'double', float: 'float', boolean: 'boolean', char: 'char', void: 'void' }[t] || t || 'String');
const visibilityJava = v => ({ '+': 'public', '-': 'private', '#': 'protected', '~': '' }[v] ?? 'private');
function App() {
  const [classes, setClasses] = useState(initialClasses);
  const [relations, setRelations] = useState([{ id: 3, from: 1, to: 2, type: 'association', label: 'has result' }]);
  const [selected, setSelected] = useState(1);
  const [activeTab, setActiveTab] = useState('design');
  const [showRelation, setShowRelation] = useState(false);
  const [relationDraft, setRelationDraft] = useState({ from: 1, to: 2, type: 'association', label: '' });
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState(null);
  const current = classes.find(c => c.id === selected) || classes[0];

  const updateClass = (id, patch) => setClasses(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const addClass = () => {
    const id = uid();
    setClasses(prev => [...prev, { id, name: `NewClass${prev.length + 1}`, x: 150 + (prev.length % 3) * 270, y: 330 + Math.floor(prev.length / 3) * 170, attributes: [], methods: [] }]);
    setSelected(id); setActiveTab('design');
  };
  const deleteClass = id => {
    setClasses(prev => prev.filter(c => c.id !== id));
    setRelations(prev => prev.filter(r => r.from !== id && r.to !== id));
    if (selected === id) setSelected(classes.find(c => c.id !== id)?.id || null);
  };
  const addMember = kind => {
    if (!current) return;
    const key = kind === 'attributes' ? 'attributes' : 'methods';
    const item = kind === 'attributes'
      ? { id: uid(), visibility: '-', name: 'newAttribute', type: 'String' }
      : { id: uid(), visibility: '+', name: 'newMethod', returnType: 'void', params: '' };
    updateClass(current.id, { [key]: [...current[key], item] });
  };
  const updateMember = (kind, id, patch) => updateClass(current.id, { [kind]: current[kind].map(m => m.id === id ? { ...m, ...patch } : m) });
  const removeMember = (kind, id) => updateClass(current.id, { [kind]: current[kind].filter(m => m.id !== id) });

  const javaCode = useMemo(() => classes.map(c => {
    const fields = c.attributes.map(a => `    ${visibilityJava(a.visibility)} ${javaType(a.type)} ${a.name};`).join('\n');
    const methods = c.methods.map(m => `    ${visibilityJava(m.visibility)} ${javaType(m.returnType)} ${m.name}(${m.params || ''}) {\n        // TODO: implement\n${m.returnType === 'void' ? '' : `        return ${({ int: '0', double: '0.0', float: '0.0f', boolean: 'false', char: "'\\\\0'", String: 'null' }[javaType(m.returnType)] || 'null')};\n`}    }`).join('\n\n');
    return `public class ${c.name} {\n${fields}${fields && methods ? '\n\n' : ''}${methods}\n}`;
  }).join('\n\n') || '// Add a class to generate Java source code.', [classes]);

  const exportJava = () => {
    const blob = new Blob([javaCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'GeneratedClasses.java'; a.click(); URL.revokeObjectURL(url);
  };
  const exportDiagram = () => {
    const svg = document.getElementById('uml-canvas-svg');
    if (!svg) return;
    const copy = svg.cloneNode(true); copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'uml-class-diagram.svg'; a.click(); URL.revokeObjectURL(url);
  };
  const saveRelation = () => {
    if (relationDraft.from === relationDraft.to) return;
    setRelations(prev => [...prev, { ...relationDraft, id: uid() }]); setShowRelation(false);
  };
  const onPointerDown = (e, c) => {
    if (e.target.closest('button')) return;
    setDrag({ id: c.id, dx: e.clientX - c.x, dy: e.clientY - c.y });
  };
  const onPointerMove = e => { if (drag) updateClass(drag.id, { x: Math.max(10, e.clientX - drag.dx), y: Math.max(10, e.clientY - drag.dy) }); };
  const onPointerUp = () => setDrag(null);

  return <div className="app" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
    <header className="topbar">
      <div className="brand"><div className="brand-icon"><Boxes size={20}/></div><div><strong>ClassForge</strong><span>UML STUDIO</span></div></div>
      <div className="top-actions"><div className="status"><i/> All changes saved locally</div><button className="btn secondary" onClick={exportDiagram}><Download size={16}/> Export SVG</button><button className="btn primary" onClick={exportJava}><Code2 size={16}/> Generate Java</button></div>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <div className="side-heading"><span>PROJECT</span><button className="icon-btn" title="Add class" onClick={addClass}><Plus size={17}/></button></div>
        <div className="project-name"><div className="project-symbol">V</div><div><b>Student Result System</b><small>UML Class Diagram</small></div></div>
        <div className="side-heading class-heading"><span>CLASSES <em>{classes.length}</em></span><button className="add-link" onClick={addClass}><Plus size={14}/> Add</button></div>
        <div className="class-list">
          {classes.map(c => <button key={c.id} className={`class-item ${selected === c.id ? 'active' : ''}`} onClick={() => {setSelected(c.id);setActiveTab('design')}}><span className="class-mini">C</span><span>{c.name}</span><span className="member-count">{c.attributes.length + c.methods.length}</span></button>)}
          {!classes.length && <p className="empty-small">No classes yet. Add your first class.</p>}
        </div>
        <div className="sidebar-bottom"><div className="tip-icon"><Sparkles size={16}/></div><div><b>Quick tip</b><p>Drag classes on the canvas to arrange your architecture.</p></div></div>
      </aside>
      <main className="main">
        <div className="page-heading"><div><div className="eyebrow">WORKSPACE <span>/</span> CLASS DIAGRAM</div><h1>Design your architecture</h1><p>Model your classes, define relationships, and turn your design into Java code.</p></div><div className="heading-actions"><button className="btn secondary" onClick={() => {setRelationDraft({from: classes[0]?.id || 1,to: classes[1]?.id || classes[0]?.id || 1,type:'association',label:''});setShowRelation(true)}} disabled={classes.length < 2}><GitBranch size={16}/> Relationship</button><button className="btn primary" onClick={addClass}><Plus size={16}/> New class</button></div></div>
        <div className="tabs"><button className={activeTab === 'design' ? 'tab active' : 'tab'} onClick={() => setActiveTab('design')}><Boxes size={16}/> Diagram editor</button><button className={activeTab === 'code' ? 'tab active' : 'tab'} onClick={() => setActiveTab('code')}><Code2 size={16}/> Java preview <span className="tab-count">{classes.length}</span></button><div className="tab-spacer"/><span className="canvas-hint"><span className="keycap">↖</span> Select a class to edit</span></div>
        {activeTab === 'design' ? <div className="design-layout">
          <section className="canvas-panel">
            <div className="canvas-toolbar"><div><b>Class diagram</b><span> {classes.length} classes · {relations.length} relationships</span></div><div className="canvas-legend"><span><i className="legend-line"/> Association</span><span><i className="legend-diamond"/> Composition</span></div></div>
            <div className="canvas-wrap" id="canvas-wrap">
              <svg id="uml-canvas-svg" className="connections" width="100%" height="100%">
                <defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="#8995aa" strokeWidth="1.2"/></marker></defs>
                {relations.map(r => {
                  const a = classes.find(c => c.id === r.from), b = classes.find(c => c.id === r.to); if (!a || !b) return null;
                  const x1 = a.x + 115, y1 = a.y + 70, x2 = b.x + 115, y2 = b.y + 35;
                  return <g key={r.id}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8995aa" strokeWidth="1.5" markerEnd={r.type === 'inheritance' ? 'url(#arrow)' : undefined} strokeDasharray={r.type === 'dependency' ? '5 4' : undefined}/><text x={(x1+x2)/2} y={(y1+y2)/2-8} fill="#69778e" fontSize="11" textAnchor="middle">{r.label || r.type}</text></g>;
                })}
              </svg>
              {classes.map(c => <div key={c.id} className={`uml-card ${selected === c.id ? 'chosen' : ''}`} style={{left:c.x,top:c.y}} onPointerDown={e => onPointerDown(e,c)} onClick={() => setSelected(c.id)}>
                <div className="uml-title"><span>«class»</span><b>{c.name}</b></div>
                <div className="uml-section">{c.attributes.map(a => <div key={a.id} className="uml-member"><span>{a.visibility}</span> {a.name}: {a.type}</div>)}{!c.attributes.length && <div className="uml-empty">No attributes</div>}</div>
                <div className="uml-section">{c.methods.map(m => <div key={m.id} className="uml-member"><span>{m.visibility}</span> {m.name}(): {m.returnType}</div>)}{!c.methods.length && <div className="uml-empty">No methods</div>}</div>
              </div>)}
              {!classes.length && <div className="canvas-empty"><Boxes size={34}/><b>Your canvas is empty</b><span>Add a class to start designing your UML diagram.</span><button className="btn primary" onClick={addClass}><Plus size={15}/> Add first class</button></div>}
            </div>
            <div className="canvas-footer"><span><i className="dot green"/> Ready to generate</span><span>Tip: Select a class to edit its details</span></div>
          </section>
          <aside className="properties">
            <div className="properties-head"><div><span className="eyebrow">PROPERTIES</span><h3>Class details</h3></div>{current && <button className="icon-btn danger" title="Delete class" onClick={() => deleteClass(current.id)}><Trash2 size={16}/></button>}</div>
            {current ? <div className="property-content">
              <label className="field-label">CLASS NAME</label><input className="text-input class-name-input" value={current.name} onChange={e => updateClass(current.id,{name:e.target.value.replace(/\s+/g,'')})} placeholder="ClassName"/>
              <div className="section-title"><span>Attributes</span><button className="add-link" onClick={() => addMember('attributes')}><Plus size={14}/> Add</button></div>
              {current.attributes.map(a => <div className="member-editor" key={a.id}><select value={a.visibility} onChange={e => updateMember('attributes',a.id,{visibility:e.target.value})}><option>+</option><option>-</option><option>#</option><option>~</option></select><input value={a.name} onChange={e => updateMember('attributes',a.id,{name:e.target.value})} placeholder="attribute"/><select className="type-select" value={a.type} onChange={e => updateMember('attributes',a.id,{type:e.target.value})}>{['String','int','double','float','boolean','char'].map(t=><option key={t}>{t}</option>)}</select><button className="tiny-delete" onClick={() => removeMember('attributes',a.id)}><X size={14}/></button></div>)}
              <div className="section-title methods-title"><span>Methods</span><button className="add-link" onClick={() => addMember('methods')}><Plus size={14}/> Add</button></div>
              {current.methods.map(m => <div className="method-editor" key={m.id}><div className="member-editor"><select value={m.visibility} onChange={e => updateMember('methods',m.id,{visibility:e.target.value})}><option>+</option><option>-</option><option>#</option><option>~</option></select><input value={m.name} onChange={e => updateMember('methods',m.id,{name:e.target.value})} placeholder="method"/><button className="tiny-delete" onClick={() => removeMember('methods',m.id)}><X size={14}/></button></div><div className="method-extra"><input value={m.params} onChange={e => updateMember('methods',m.id,{params:e.target.value})} placeholder="Parameters e.g. int id"/><select value={m.returnType} onChange={e => updateMember('methods',m.id,{returnType:e.target.value})}>{['void','String','int','double','float','boolean','char'].map(t=><option key={t}>{t}</option>)}</select></div></div>)}
              <div className="visibility-note"><b>Visibility</b><span>+ public</span><span>− private</span><span># protected</span><span>~ package</span></div>
            </div> : <div className="no-selection">Select or create a class to edit its properties.</div>}
          </aside>
        </div> : <section className="code-panel"><div className="code-header"><div><span className="code-file"><Code2 size={15}/> GeneratedClasses.java</span><small>Java source · {classes.length} classes</small></div><div className="code-actions"><button className="btn secondary small" onClick={() => {navigator.clipboard?.writeText(javaCode);setCopied(true);setTimeout(()=>setCopied(false),1600)}}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy code'}</button><button className="btn primary small" onClick={exportJava}><Download size={14}/> Download .java</button></div></div><pre className="code-block"><code>{javaCode}</code></pre><div className="code-note"><Sparkles size={16}/> Generated code is a starting point. Add constructors, getters, setters, and method implementations as needed.</div></section>}
      </main>
    </div>
    {showRelation && <div className="modal-backdrop" onClick={() => setShowRelation(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">DIAGRAM STRUCTURE</span><h3>Add relationship</h3></div><button className="icon-btn" onClick={() => setShowRelation(false)}><X size={18}/></button></div><label className="field-label">SOURCE CLASS</label><select className="text-input" value={relationDraft.from} onChange={e => setRelationDraft({...relationDraft,from:Number(e.target.value)})}>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><label className="field-label">TARGET CLASS</label><select className="text-input" value={relationDraft.to} onChange={e => setRelationDraft({...relationDraft,to:Number(e.target.value)})}>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><label className="field-label">RELATIONSHIP TYPE</label><select className="text-input" value={relationDraft.type} onChange={e => setRelationDraft({...relationDraft,type:e.target.value})}><option value="association">Association</option><option value="inheritance">Inheritance</option><option value="composition">Composition</option><option value="dependency">Dependency</option></select><label className="field-label">LABEL (OPTIONAL)</label><input className="text-input" value={relationDraft.label} onChange={e => setRelationDraft({...relationDraft,label:e.target.value})} placeholder="e.g. contains, extends"/><div className="modal-actions"><button className="btn secondary" onClick={() => setShowRelation(false)}>Cancel</button><button className="btn primary" onClick={saveRelation}>Add relationship</button></div></div></div>}
    <footer className="footer"><span>ClassForge <b>·</b> UML Class Diagram Generator</span><span>Designed for learning & rapid prototyping</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);