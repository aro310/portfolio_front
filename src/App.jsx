import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { TextToAudioGenerator } from "./components/TextToAudioGenerator";
import { AnimatedCanvas } from "./components/AnimatedCanvas";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { sendContactForm } from "./services/apiService";
import { useState, useEffect, useRef } from "react";
import { Leva } from "leva";
import { X, MessageCircle, ArrowUp, ExternalLink, Zap, Bot, Globe, ChevronDown, Send, CheckCircle, AlertCircle, Menu } from "lucide-react";
import "./App.css";

// ── Translations ───────────────────────────────────────────────────────────────
const T = {
  fr: {
    greeting: "Bonjour, je suis",
    name: "Aro Fortunat",
    roles: ["Développeur Full-Stack", "n8n Automation", "IA & ML", "Freelance Comeup", "Data Analyste Junior"],
    heroDesc: "Étudiant IDEV à l'ESTI · je transforme des idées complexes en solutions logicielles | de l'IA au pipeline d'automatisation.",
    contactBtn: "Me Contacter",
    servicesBtn: "Services Comeup",
    stats: [["1", "An d'expérience"], ["15+", "Projets"], ["10+", "Technos maîtrisées"]],
    about: "À", aboutSpan: "Propos",
    aboutText: "Passionné par l'intersection entre le web et l'intelligence artificielle, je construis des solutions qui ont un vrai impact. Mon parcours à l'ESTI me donne des bases professionnels, mais c'est ma curiosité qui me pousse à explorer.",
    timeline: [
      { year: "2024–maintenant", title: "IDEV — ESTI Antananarivo", desc: "Intégration & Développement logiciel. Focus IA, web full-stack." },
      { year: "2026", title: "Freelance Comeup", desc: "Automatisation n8n, chatbots IA, développement web clients." },
      { year: "2024", title: "Projets IA", desc: "GED avec OCR+Face-ID, Avatar interactif LLM, Simulateur Trafic 2D." },
      { year: "2024", title: "Débuts développement", desc: "Python, Django, bases de données, projets académiques." },
    ],
    servicesTitle: "Mes", servicesSpan: "Services",
    servicesSub: "Disponible sur",
    order: "Commander",
    skillsTitle: "Mes", skillsSpan: "Compétences",
    techStack: "Stack technique",
    skills: [
      { name: "Python / Flask / Django", pct: 88 },
      { name: "React.js / JavaScript", pct: 70 },
      { name: "Machine Learning / IA", pct: 50 },
      { name: "Automatisation n8n", pct: 80 },
      { name: "Docker / Git", pct: 65 },
      { name: "SQL (MySQL / PostgreSQL)", pct: 80 },
    ],
    portfolioTitle: "Projets &", portfolioSpan: "Réalisations",
    projectDescGed: "Plateforme universitaire avec OCR, Face-Id, chatbot vocal et recherche intelligente sur documents.",
    projectDescLocar: "Application de gestion de location de véhicules : réservation, facturation, suivi contrats.",
    projectDescAvatar: "Avatar 3D animé connecté à un LLM + Google Calendar + Gmail via MCP et n8n.",
    contactTitle: "", contactSpan: "Contact",
    contactSub: "Une idée ? Un projet ? Discutons-en.",
    workTogether: "Travaillons ensemble",
    available: "Je suis disponible pour une alternance ou stage, des projets freelance. Réponds généralement sous 24h.",
    formName: "Nom", formNamePh: "Ton nom",
    formEmail: "Email", formEmailPh: "ton@email.com",
    formMsg: "Message", formMsgPh: "Décris ton projet...",
    formSend: "Envoyer le message",
    formSending: "Envoi...",
    formSuccess: "Message envoyé ! Je te réponds sous 24h.",
    formError: "Une erreur est survenue.",
    footerText: "© 2026 Aro Fortunat · Développé avec React & Flask",
    assistantTitle: "Lancer l'Assistant IA",
    navLinks: [
      { id: "home", label: "Accueil" },
      { id: "about", label: "À Propos" },
      { id: "services", label: "Services" },
      { id: "skills", label: "Compétences" },
      { id: "portfolio", label: "Projets" },
      { id: "contact", label: "Contact" },
    ],
    cv: "Mon CV",
  },
  en: {
    greeting: "Hello, I'm",
    name: "Aro Fortunat",
    roles: ["Full-Stack Developer", "n8n Automation", "AI & ML", "Freelance Comeup", "Junior Data Analyst"],
    heroDesc: "IDEV student at ESTI · I turn complex ideas into software solutions | from AI to automation pipelines.",
    contactBtn: "Contact Me",
    servicesBtn: "Comeup Services",
    stats: [["1", "Year of experience"], ["15+", "Projects"], ["10+", "Technologies"]],
    about: "About", aboutSpan: "Me",
    aboutText: "Passionate about the intersection of web and artificial intelligence, I build solutions that make a real impact. My studies at ESTI give me a professional foundation, but it's my curiosity that drives me to explore new territories.",
    timeline: [
      { year: "2024–present", title: "IDEV — ESTI Antananarivo", desc: "Software Integration & Development. Focus on AI, full-stack web." },
      { year: "2026", title: "Freelance Comeup", desc: "n8n automation, AI chatbots, web development for clients." },
      { year: "2024", title: "AI Projects", desc: "GED with OCR+Face-ID, Interactive LLM Avatar, 2D Traffic Simulator." },
      { year: "2024", title: "Development beginnings", desc: "Python, Django, databases, academic projects." },
    ],
    servicesTitle: "My", servicesSpan: "Services",
    servicesSub: "Available on",
    order: "Order",
    skillsTitle: "My", skillsSpan: "Skills",
    techStack: "Tech Stack",
    skills: [
      { name: "Python / Flask / Django", pct: 88 },
      { name: "React.js / JavaScript", pct: 70 },
      { name: "Machine Learning / AI", pct: 50 },
      { name: "n8n Automation", pct: 80 },
      { name: "Docker / Git", pct: 65 },
      { name: "SQL (MySQL / PostgreSQL)", pct: 80 },
    ],
    portfolioTitle: "Projects &", portfolioSpan: "Work",
    projectDescGed: "University platform with OCR, Face-Id, voice chatbot and intelligent document search.",
    projectDescLocar: "Vehicle rental management app: reservations, billing, contract tracking.",
    projectDescAvatar: "Animated 3D avatar connected to an LLM + Google Calendar + Gmail via MCP and n8n.",
    contactTitle: "", contactSpan: "Contact",
    contactSub: "Have an idea? A project? Let's talk.",
    workTogether: "Let's work together",
    available: "I'm available for internships, apprenticeships and freelance projects. Usually reply within 24h.",
    formName: "Name", formNamePh: "Your name",
    formEmail: "Email", formEmailPh: "your@email.com",
    formMsg: "Message", formMsgPh: "Describe your project...",
    formSend: "Send message",
    formSending: "Sending...",
    formSuccess: "Message sent! I'll reply within 24h.",
    formError: "An error occurred.",
    footerText: "© 2026 Aro Fortunat · Built with React & Flask",
    assistantTitle: "Launch AI Assistant",
    navLinks: [
      { id: "home", label: "Home" },
      { id: "about", label: "About" },
      { id: "services", label: "Services" },
      { id: "skills", label: "Skills" },
      { id: "portfolio", label: "Projects" },
      { id: "contact", label: "Contact" },
    ],
    cv: "My CV",
  },
};

// ── Typing Effect ─────────────────────────────────────────────────────────────
function TypingEffect({ words }) {
  const [current, setCurrent] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[current % words.length];
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

// ── Section Wrapper ────────────────────────────────────────────────────────────
function Section({ id, className, children }) {
  const ref = useScrollReveal();
  return (
    <section id={id} className={`reveal ${className || ""}`} ref={ref}>
      {children}
    </section>
  );
}

// ── Contact Form ───────────────────────────────────────────────────────────────
function ContactForm({ t }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
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
          <label>{t.formName}</label>
          <input name="name" type="text" placeholder={t.formNamePh} value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>{t.formEmail}</label>
          <input name="email" type="email" placeholder={t.formEmailPh} value={form.email} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-group">
        <label>{t.formMsg}</label>
        <textarea name="message" rows={5} placeholder={t.formMsgPh} value={form.message} onChange={handleChange} required />
      </div>

      {status === "success" && (
        <div className="form-feedback success">
          <CheckCircle size={18} /> {t.formSuccess}
        </div>
      )}
      {status === "error" && (
        <div className="form-feedback error">
          <AlertCircle size={18} /> {errMsg || t.formError}
        </div>
      )}

      <button type="submit" className="btn-submit" disabled={status === "sending"}>
        {status === "sending" ? t.formSending : <><Send size={16} /> {t.formSend}</>}
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
  const [lang, setLang] = useState("fr");       // "fr" | "en"
  const [menuOpen, setMenuOpen] = useState(false); // mobile hamburger

  const t = T[lang];

  // Apply theme class and lang on <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

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
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAudioGenerated = (data) => { setAudioData(data); setPlayAudio(true); };

  const services = [
    {
      icon: <Zap size={36} />,
      title: lang === "fr" ? "Automatisation n8n" : "n8n Automation",
      desc: lang === "fr"
        ? "Automatisation de tes processus métiers avec n8n : synchronisation de données, emails automatiques, intégration API, notifications. Gain de temps garanti."
        : "Automate your business processes with n8n: data sync, automated emails, API integrations, notifications. Guaranteed time savings.",
      tags: ["n8n","Webhooks","API REST","Google Workspace"],
      comeup: true,
    },
    {
      icon: <Bot size={36} />,
      title: lang === "fr" ? "Chatbot IA Personnalisé" : "Custom AI Chatbot",
      desc: lang === "fr"
        ? "Création d'agents conversationnels intelligents intégrables dans ton site. Connexion à Google Calendar, Gmail, et APIs tierces via MCP."
        : "Build intelligent conversational agents for your site. Connects to Google Calendar, Gmail, and third-party APIs via MCP.",
      tags: ["LLM","MCP","Flask","React"],
      comeup: true,
    },
    {
      icon: <Globe size={36} />,
      title: lang === "fr" ? "Application Web Full-Stack junior" : "Junior Full-Stack Web App",
      desc: lang === "fr"
        ? "Développement de sites et apps web modernes avec React et Flask/Django. Interface responsive, base de données, déploiement inclus."
        : "Modern web sites and apps with React and Flask/Django. Responsive UI, database, deployment included.",
      tags: ["React","Django","Flask","PostgreSQL"],
      comeup: false,
    },
  ];

  const techBadges = [
    "Python","React","Flask","Django","n8n","Docker","TensorFlow",
    "FastAPI","OpenCV","NumPy","Git","PostgreSQL","SQLite","PHP","C",
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

        {/* Desktop nav */}
        <nav className="navbar">
          {t.navLinks.map((l) => (
            <button key={l.id} onClick={() => scrollTo(l.id)} className={activeSection === l.id ? "active" : ""}>
              {l.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          {/* Language toggle */}
          <button
            className="lang-btn"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            title={lang === "fr" ? "Switch to English" : "Passer en Français"}
          >
            {lang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
          </button>

          <a href="/pdf/Aroniaina_IDEV.pdf" target="_blank" rel="noreferrer" className="btn-cv">
            {t.cv}
          </a>

          {/* Hamburger — mobile only */}
          <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <div className="mobile-nav-drawer">
          {t.navLinks.map((l) => (
            <button key={l.id} onClick={() => scrollTo(l.id)} className={activeSection === l.id ? "active" : ""}>
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Hero ── */}
      <section className="home reveal visible" id="home">
        <div className="home-content">
          <p className="hero-greeting"> {t.greeting}</p>
          <h1>{t.name}</h1>
          <h2 className="hero-role">
            <TypingEffect key={lang} words={t.roles} />
          </h2>
          <p className="hero-desc">{t.heroDesc}</p>
          <div className="btn-box">
            <button onClick={() => scrollTo("contact")} className="btn btn-primary">{t.contactBtn}</button>
            <a href="https://comeup.com/fr/@aroratovoharison" target="_blank" rel="noreferrer" className="btn btn-outline">
              {t.servicesBtn}
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
        {t.stats.map(([val, lbl]) => (
          <div className="stat-item" key={lbl}>
            <h2>{val}</h2>
            <p>{lbl}</p>
          </div>
        ))}
      </div>

      {/* ── About ── */}
      <Section id="about" className="about">
        <h2 className="heading">{t.about} <span>{t.aboutSpan}</span></h2>
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
            <p className="about-intro">{t.aboutText}</p>
            <div className="timeline">
              {t.timeline.map((tl, index) => (
                <div className="timeline-item" key={index}>
                  <div className="tl-dot" />
                  <div className="tl-content">
                    <span className="tl-year">{tl.year}</span>
                    <strong>{tl.title}</strong>
                    <p>{tl.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Services ── */}
      <Section id="services" className="services-section">
        <h2 className="heading">{t.servicesTitle} <span>{t.servicesSpan}</span></h2>
        <p className="section-sub">{t.servicesSub} <a href="https://comeup.com/fr/@aroratovoharison" target="_blank" rel="noreferrer" className="link-comeup">Comeup ↗</a></p>
        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card" key={s.title}>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="service-tags">
                {s.tags.map((tag) => <span className="svc-tag" key={tag}>{tag}</span>)}
              </div>
              {s.comeup && (
                <a href="https://comeup.com/fr/@aroratovoharison" target="_blank" rel="noreferrer" className="btn-service">
                  {t.order} <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Skills ── */}
      <Section id="skills" className="skills">
        <h2 className="heading">{t.skillsTitle} <span>{t.skillsSpan}</span></h2>
        <div className="skills-layout">
          <div className="skill-bars">
            {t.skills.map((s) => (
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
            <h3>{t.techStack}</h3>
            <div className="badge-grid">
              {techBadges.map((b) => <span className="tech-badge" key={b}>{b}</span>)}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Projects ── */}
      <Section id="portfolio" className="portfolio">
        <h2 className="heading">{t.portfolioTitle} <span>{t.portfolioSpan}</span></h2>
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
              <h3>GED – {lang === "fr" ? "Gestion Électronique de Documents" : "Electronic Document Management"}</h3>
              <p className="project-desc">{t.projectDescGed}</p>
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
              <h3>LOCAR – {lang === "fr" ? "Location de Véhicules" : "Vehicle Rental"}</h3>
              <p className="project-desc">{t.projectDescLocar}</p>
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
              <h3>AVATARO – {lang === "fr" ? "Assistant IA Interactif" : "Interactive AI Assistant"}</h3>
              <p className="project-desc">{t.projectDescAvatar}</p>
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
        <h2 className="heading"><span>{t.contactSpan}</span></h2>
        <p className="section-sub">{t.contactSub}</p>
        <div className="contact-layout">
          <div className="contact-info-col">
            <h3>{t.workTogether}</h3>
            <p>{t.available}</p>
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
            <ContactForm t={t} />
          </div>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>{t.footerText}</p>
        <p>
          <a href="https://github.com/aro310" target="_blank" rel="noreferrer">GitHub</a> ·{" "}
        </p>
      </footer>

      {showBackTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowUp size={20} />
        </button>
      )}

      {!showAvatar && (
        <button
          className="floating-avatar-btn"
          onClick={() => { setShowAvatar(true); setCanvasReady(false); setTimeout(() => setCanvasReady(true), 120); }}
          title={t.assistantTitle}
        >
          <MessageCircle size={28} />
        </button>
      )}

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
                <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 42 }}>
                  <color attach="background" args={["#161618"]} />
                  <Experience audioData={audioData} playAudio={playAudio} setPlayAudio={setPlayAudio} />
                </Canvas>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#161618", borderRadius: "8px" }}>
                  <div style={{ width: "36px", height: "36px", border: "3px solid #2b2d30", borderTop: "3px solid #aba19c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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