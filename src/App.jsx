import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { TextToAudioGenerator } from "./components/TextToAudioGenerator";
import { AnimatedCanvas } from "./components/AnimatedCanvas";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { sendContactForm } from "./services/apiService";
import { useState, useEffect, useRef } from "react";
import { Leva } from "leva";
import { X, MessageCircle, ArrowUp, ExternalLink, Zap, Bot, Globe, ChevronDown, Send, CheckCircle, AlertCircle } from "lucide-react";
import "./App.css";

// ── Typing Effect ─────────────────────────────────────────────────────────────
function TypingEffect({ words }) {
  const [current, setCurrent] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[current];
    let timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setCurrent((c) => (c + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, current, words]);

  return (
    <span className="typing-text">
      {displayed}<span className="cursor-blink">|</span>
    </span>
  );
}

// ── Scroll Progress Bar ────────────────────────────────────────────────────────
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", update);
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

// ── Section Wrapper (scroll reveal) ───────────────────────────────────────────
function Section({ id, className, children }) {
  const ref = useScrollReveal();
  return (
    <section id={id} className={`reveal ${className || ""}`} ref={ref}>
      {children}
    </section>
  );
}

// ── Contact Form ───────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | "sending" | "success" | "error"
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await sendContactForm(form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrMsg(err.message);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Nom</label>
          <input name="name" type="text" placeholder="Ton nom" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" placeholder="ton@email.com" value={form.email} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-group">
        <label>Message</label>
        <textarea name="message" rows={5} placeholder="Décris ton projet..." value={form.message} onChange={handleChange} required />
      </div>

      {status === "success" && (
        <div className="form-feedback success">
          <CheckCircle size={18} /> Message envoyé ! Je te réponds sous 24h.
        </div>
      )}
      {status === "error" && (
        <div className="form-feedback error">
          <AlertCircle size={18} /> {errMsg || "Une erreur est survenue."}
        </div>
      )}

      <button type="submit" className="btn-submit" disabled={status === "sending"}>
        {status === "sending" ? "Envoi..." : <><Send size={16} /> Envoyer le message</>}
      </button>
    </form>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const [audioData, setAudioData] = useState(null);
  const [playAudio, setPlayAudio] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isSticky, setIsSticky] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
      setShowBackTop(window.scrollY > 400);
      const sections = ["home", "about", "services", "skills", "portfolio", "contact"];
      let current = "home";
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el && window.scrollY >= el.offsetTop - 180) current = s;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id, e) => {
    e?.preventDefault();
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAudioGenerated = (data) => { setAudioData(data); setPlayAudio(true); };

  const navLinks = [
    { id: "home",      label: "Accueil" },
    { id: "about",     label: "À Propos" },
    { id: "services",  label: "Services" },
    { id: "skills",    label: "Compétences" },
    { id: "portfolio", label: "Projets" },
    { id: "contact",   label: "Contact" },
  ];

  const skills = [
    { name: "Python / Flask / Django", pct: 88 },
    { name: "React.js / JavaScript", pct: 70 },
    { name: "Machine Learning / IA", pct: 50 },
    { name: "Automatisation n8n", pct: 80 },
    { name: "Docker / Git ", pct: 65 },
    { name: "SQL (MySQL / PostgreSQL)", pct: 80 },
  ];

  const techBadges = [
    "Python","React","Flask","Django","n8n","Docker","TensorFlow",
    "FastAPI","OpenCV","NumPy","Git","PostgreSQL","SQLite","PHP","C",
  ];

  const services = [
    {
      icon: <Zap size={36} />,
      title: "Automatisation n8n",
      desc: "Automatisation de tes processus métiers avec n8n : synchronisation de données, emails automatiques, intégration API, notifications. Gain de temps garanti.",
      tags: ["n8n","Webhooks","API REST","Google Workspace"],
      comeup: true,
    },
    {
      icon: <Bot size={36} />,
      title: "Chatbot IA Personnalisé",
      desc: "Création d'agents conversationnels intelligents intégrables dans ton site. Connexion à Google Calendar, Gmail, et APIs tierces via MCP.",
      tags: ["LLM","MCP","Flask","React"],
      comeup: true,
    },
    {
      icon: <Globe size={36} />,
      title: "Application Web Full-Stack junior",
      desc: "Développement de sites et apps web modernes avec React et Flask/Django. Interface responsive, base de données, déploiement inclus.",
      tags: ["React","Django","Flask","PostgreSQL"],
      comeup: false,
    },
  ];

  return (
    <div className="main-layout">
      <ScrollProgress />
      <AnimatedCanvas />

      {/* ── Header ── */}
      <header className={`header ${isSticky ? "sticky" : ""}`}>
        <a href="#home" onClick={(e) => scrollTo("home", e)} className="logo">
          Aro<span>.</span>
        </a>
        <nav className="navbar">
          {navLinks.map((l) => (
            <button key={l.id} onClick={() => scrollTo(l.id)} className={activeSection === l.id ? "active" : ""}>
              {l.label}
            </button>
          ))}
        </nav>
        <a href="/pdf/Aroniaina_IDEV.pdf" target="_blank" rel="noreferrer" className="btn-cv">
          Mon CV
        </a>
      </header>

      {/* ── Hero ── */}
      <section className="home reveal visible" id="home">
        <div className="home-content">
          <p className="hero-greeting"> Bonjour, je suis</p>
          <h1>Aro Fortunat</h1>
          <h2 className="hero-role">
            <TypingEffect words={["Développeur Full-Stack", " n8n Automation", "Intéret en IA & ML", "Freelance Comeup", "Data Analyste Junior"]} />
          </h2>
          <p className="hero-desc">
            Étudiant IDEV à l'ESTI · je transforme des idées complexes en solutions logicielles élégantes — du chatbot IA au pipeline d'automatisation n8n.
          </p>
          <div className="btn-box">
            <button onClick={() => scrollTo("contact")} className="btn btn-primary">Me Contacter</button>
            <a href="https://comeup.com/fr/@aroratovoharison" target="_blank" rel="noreferrer" className="btn btn-outline">
              Services Comeup 
            </a>
            <a href="https://github.com/aro310" target="_blank" rel="noreferrer" className="btn btn-ghost">
            <i className="bx bxl-github" /> GitHub
          </a>
          </div>
          <div className="home-sci">
            <a href="https://github.com/aro310" target="_blank" rel="noreferrer" title="GitHub"><i className="bx bxl-github"></i></a>
            <a href="https://linkedin.com/in/aro-fortunat-ratovoharison-b63308366" target="_blank" rel="noreferrer" title="LinkedIn"><i className="bx bxl-linkedin"></i></a>
            <a href="mailto:aroratovoharison@gmail.com" title="Email"><i className="bx bx-envelope"></i></a>
            <a href="tel:+261345412584" title="Téléphone"><i className="bx bx-phone"></i></a>
          </div>
        </div>
        <div className="home-imgHover">
          <img src="/images/aro_cv.png" alt="Aro Fortunat" />
          <div className="cloud-cover" />
        </div>
        <a className="scroll-down-hint" onClick={() => scrollTo("about")}>
          <ChevronDown size={28} />
        </a>
      </section>

      {/* ── Stats ── */}
      <div className="stats-section">
        {[["1", "An d'expérience"], ["15+", "Projets"], ["10+", "Technos maîtrisées"]].map(([val, lbl]) => (
          <div className="stat-item" key={lbl}>
            <h2>{val}</h2>
            <p>{lbl}</p>
          </div>
        ))}
      </div>

      {/* ── About ── */}
      <Section id="about" className="about">
        <h2 className="heading">À <span>Propos</span></h2>
        <div className="about-grid">
          <div className="about-photo-col">
            <div className="about-photo-ring">
              <img src="/images/aro_cv.png" alt="Aro Fortunat" />
            </div>
            <div className="about-badges">
              <span className="badge">🇲🇬 Madagascar</span>
              <span className="badge">📍 Antananarivo</span>
              <span className="badge">🎓 ESTI IDEV</span>
            </div>
          </div>
          <div className="about-text-col">
            <p className="about-intro">
              Passionné par l'intersection entre le <strong>web</strong> et l'<strong>intelligence artificielle</strong>, je construis des solutions qui ont un vrai impact. Mon parcours à l'ESTI me donne des bases professionnels, mais c'est ma curiosité qui me pousse à explorer de nouveaux territoires.
            </p>
            <div className="timeline">
              {[
                { year: "2024–maintenant", title: "IDEV — ESTI Antananarivo", desc: "Intégration & Développement logiciel. Focus IA, web full-stack." },
                { year: "2026", title: "Freelance Comeup", desc: "Automatisation n8n, chatbots IA, développement web clients." },
                { year: "2024", title: "Projets IA", desc: "GED avec OCR+Face-ID, Avatar interactif LLM, Simulateur Trafic 2D." },
                { year: "2024", title: "Débuts développement", desc: "Python, Django, bases de données, projets académiques." },
              ].map((t) => (
                <div className="timeline-item" key={t.year}>
                  <div className="tl-dot" />
                  <div className="tl-content">
                    <span className="tl-year">{t.year}</span>
                    <strong>{t.title}</strong>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Services ── */}
      <Section id="services" className="services-section">
        <h2 className="heading">Mes <span>Services</span></h2>
        <p className="section-sub">Disponible sur <a href="https://comeup.com/fr/@aroratovoharison" target="_blank" rel="noreferrer" className="link-comeup">Comeup ↗</a></p>
        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card" key={s.title}>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="service-tags">
                {s.tags.map((t) => <span className="svc-tag" key={t}>{t}</span>)}
              </div>
              {s.comeup && (
                <a href="https://comeup.com/fr/@aroratovoharison" target="_blank" rel="noreferrer" className="btn-service">
                  Commander <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Skills ── */}
      <Section id="skills" className="skills">
        <h2 className="heading">Mes <span>Compétences</span></h2>
        <div className="skills-layout">
          <div className="skill-bars">
            {skills.map((s) => (
              <div className="skill-bar-item" key={s.name}>
                <div className="skill-bar-header">
                  <span>{s.name}</span>
                  <span>{s.pct}%</span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ "--target-width": `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="tech-badges">
            <h3>Stack technique</h3>
            <div className="badge-grid">
              {techBadges.map((b) => <span className="tech-badge" key={b}>{b}</span>)}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Projects ── */}
      <Section id="portfolio" className="portfolio">
        <h2 className="heading">Projets & <span>Réalisations</span></h2>
        <div className="project-grid">
          {/* GED */}
          <div className="project-card">
            <div className="card-image-slider">
              <div className="image-track">
                {["ged1","ged2","ged3","ged5","ged6"].map((img) => (
                  <img key={img} src={`/images/${img}.PNG`} alt="GED" />
                ))}
              </div>
            </div>
            <div className="project-content">
              <div className="project-tags-row">
                <span className="proj-tag">Django</span><span className="proj-tag">OCR</span><span className="proj-tag">Face-ID</span>
              </div>
              <h3>GED – Gestion Électronique de Documents</h3>
              <p className="project-desc">
                Plateforme universitaire avec <span className="highlight">OCR, Face-Id, chatbot vocal</span> et recherche intelligente sur documents.
              </p>
              <div className="project-btns">
                <a href="https://github.com/aro310/GED" target="_blank" rel="noreferrer" className="btn-proj">
                  <i className="bx bxl-github" style={{fontSize:'15px'}} /> GitHub
                </a>
              </div>
            </div>
          </div>

          {/* LOCAR */}
          <div className="project-card">
            <div className="card-image-slider">
              <div className="image-track" style={{ animationDirection: "reverse" }}>
                {["rental","rental5","rental3","rental2"].map((img) => (
                  <img key={img} src={`/images/${img}.png`} alt="Locar" />
                ))}
              </div>
            </div>
            <div className="project-content">
              <div className="project-tags-row">
                <span className="proj-tag">Flask</span><span className="proj-tag">Python</span><span className="proj-tag">MySQL</span>
              </div>
              <h3>LOCAR – Location de Véhicules</h3>
              <p className="project-desc">
                Application de gestion de <span className="highlight">location de véhicules</span> : réservation, facturation, suivi contrats.
              </p>
              <div className="project-btns">
                <a href="https://github.com/aro310/locar" target="_blank" rel="noreferrer" className="btn-proj">
                  <i className="bx bxl-github" style={{fontSize:'15px'}} /> GitHub
                </a>
              </div>
            </div>
          </div>

          {/* AVATAR */}
          <div className="project-card">
            <div className="card-image-slider">
              <div className="image-track" style={{ animationDuration: "20s" }}>
                {["avatar1","avatar2","avatar1","avatar2"].map((img, i) => (
                  <img key={i} src={`/images/${img}.png`} alt="Avatar" />
                ))}
              </div>
            </div>
            <div className="project-content">
              <div className="project-tags-row">
                <span className="proj-tag">React</span><span className="proj-tag">Three.js</span><span className="proj-tag">n8n</span><span className="proj-tag">LLM</span>
              </div>
              <h3>AVATARO – Assistant IA Interactif</h3>
              <p className="project-desc">
                Avatar 3D animé connecté à un <span className="highlight">LLM + Google Calendar + Gmail</span> via MCP et n8n.
              </p>
              <div className="project-btns">
                <a href="https://github.com/aro310/avatar" target="_blank" rel="noreferrer" className="btn-proj">
                  <i className="bx bxl-github" style={{fontSize:'15px'}} /> GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Contact ── */}
      <Section id="contact" className="contact">
        <h2 className="heading"><span>Contact</span></h2>
        <p className="section-sub">Une idée ? Un projet ? Discutons-en.</p>
        <div className="contact-layout">
          <div className="contact-info-col">
            <h3>Travaillons ensemble</h3>
            <p>Je suis disponible pour une alternance ou stage, des projets freelance. Réponds généralement sous 24h.</p>
            <ul className="contact-details">
              <li><i className="bx bx-envelope" /> <a href="mailto:aroratovoharison@gmail.com">aroratovoharison@gmail.com</a></li>
              <li><i className="bx bx-phone" /> +261 34 54 125 84</li>
              <li><i className="bx bx-map" /> Antananarivo, Madagascar</li>
            </ul>
            <div className="contact-socials">
              <a href="https://github.com/aro310" target="_blank" rel="noreferrer"><i className="bx bxl-github" /></a>
              <a href="https://linkedin.com/in/aro-fortunat-ratovoharison-b63308366" target="_blank" rel="noreferrer"><i className="bx bxl-linkedin" /></a>
              <a href="https://comeup.com" target="_blank" rel="noreferrer"><i className="bx bx-store" /></a>
            </div>
          </div>
          <div className="contact-form-col">
            <ContactForm />
          </div>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>© 2026 <strong>Aro Fortunat</strong> · Développé avec React & Flask</p>
        <p>
          <a href="https://github.com/aro310" target="_blank" rel="noreferrer">GitHub</a> ·{" "}
          <a href="https://comeup.com" target="_blank" rel="noreferrer">Comeup</a>
        </p>
      </footer>

      {/* ── Back to Top ── */}
      {showBackTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowUp size={20} />
        </button>
      )}

      {/* ── Floating Avatar Button ── */}
      {!showAvatar && (
        <button
          className="floating-avatar-btn"
          onClick={() => { setShowAvatar(true); setCanvasReady(false); setTimeout(() => setCanvasReady(true), 120); }}
          title="Lancer l'Assistant IA"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* ── Avatar Widget ── */}
      {showAvatar && (
        <div className="avatar-widget">
          <div className="avatar-header">
            <h3>Aro Assistant</h3>
            <button className="close-btn" onClick={() => setShowAvatar(false)}><X size={20} /></button>
          </div>
          <div className="avatar-body">
            <Leva hidden />
            <div className="widget-canvas-container" style={{ height: "220px", position: "relative" }}>
              {canvasReady ? (
                <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
                  <color attach="background" args={["#0d1b2a"]} />
                  <Experience audioData={audioData} playAudio={playAudio} setPlayAudio={setPlayAudio} />
                </Canvas>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1b2a", borderRadius: "8px" }}>
                  <div style={{ width: "36px", height: "36px", border: "3px solid #1e3a5f", borderTop: "3px solid #00abf0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
              )}
            </div>
            <div className="widget-ui-container">
              <TextToAudioGenerator onAudioGenerated={handleAudioGenerated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;