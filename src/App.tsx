import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from './emailjs-config';
import AnimatedBackground from './components/AnimatedBackground';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Download,
  Code,
  Palette,
  Database,
  Globe,
  ChevronDown,
  Menu,
  X,
  Send,
  Sun,
  Moon,
  ChevronUp
} from 'lucide-react';

type Theme = 'light' | 'dark';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [theme, setTheme] = useState<Theme>('dark');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const roles = [
    'Full Stack Developer',
    'SAP Developer'
  ];

  const currentRole = roles[currentRoleIndex];

  useEffect(() => {
    if (isTyping && typedText.length < currentRole.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentRole.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else if (isTyping && typedText.length === currentRole.length) {
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    } else if (!isTyping) {
      if (typedText.length > 0) {
        const timeout = setTimeout(() => {
          setTypedText(typedText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        setIsTyping(true);
      }
    }
  }, [typedText, isTyping, currentRole]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);

      // Show/hide scroll to top button
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Custom cursor effect
  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Update cursor position
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    };

    const handleMouseEnter = () => {
      document.body.classList.add('cursor-hover');
    };

    const handleMouseLeave = () => {
      document.body.classList.remove('cursor-hover');
    };

    // Add cursor tracking
    document.addEventListener('mousemove', updateCursor);
    
    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldownEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = cooldownEndTime - now;
        
        if (remaining <= 0) {
          setCooldownEndTime(null);
          setTimeRemaining('');
        } else {
          const minutes = Math.floor(remaining / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownEndTime]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Preparar los datos para EmailJS
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_name: 'Nahuel Neira', // Tu nombre
    };

    emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    )
    .then((response) => {
      console.log('Email enviado exitosamente:', response.status, response.text);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Set cooldown timer (1 hour = 3600000 milliseconds)
      const cooldownEnd = Date.now() + 3600000;
      setCooldownEndTime(cooldownEnd);
      localStorage.setItem('formCooldownEnd', cooldownEnd.toString());
    })
    .catch((error) => {
      console.error('Error al enviar email:', error);
      setSubmitStatus('error');
    })
    .finally(() => {
      setIsSubmitting(false);
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    });
  };

  // Check for existing cooldown on component mount
  useEffect(() => {
    const savedCooldownEnd = localStorage.getItem('formCooldownEnd');
    if (savedCooldownEnd) {
      const cooldownEnd = parseInt(savedCooldownEnd);
      if (cooldownEnd > Date.now()) {
        setCooldownEndTime(cooldownEnd);
      } else {
        localStorage.removeItem('formCooldownEnd');
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const projects = [
    {
      title: 'Página Web Responsiva',
      description: 'Proyectos prácticos de páginas web responsive, optimizando la experiencia del usuario en diferentes dispositivos',
      image: "/Pagina1.jpg",
      technologies: ["HTML", "CSS", "Responsive Design"],
      github: "https://github.com/DemmMotionless/PaginaWeb.git"
    },
    {
      title: 'Juego en Wollok',
      description: 'Desarrollo de un juego utilizando POO e implementación de eventos en tiempo real',
      image: "/captura1.jpg",
      technologies: ["Wollok", "POO", "Game Development", "Events"],
      github: "https://github.com/DemmMotionless/WollokGame.git"
    }
  ];

  const skills = [
    { name: "HTML/CSS/JavaScript", icon: Code },
    { name: "Python", icon: Database },
    { name: "C# / .NET", icon: Globe },
    { name: "SQL / Bases de Datos", icon: Database }
  ];

  const experience = [
    {
      title: 'Pasante en Desarrollo SAP e IA',
      company: 'ARTECH - Fundación Pescar',
      period: 'Julio 2025 - Diciembre 2025',
      status: 'Julio 2025 - En curso',
      description: 'Programa intensivo de formación para la inserción laboral en IT, con contenidos técnicos y habilidades interpersonales.',
      subjects: ['SQL', 'ABAP', 'SAP Fiori', 'SAP BTP', 'JavaScript', 'Python', 'Power BI', 'Databricks', 'PowerApps']
    },
    {
      title: 'Estudiante',
      company: 'Universidad Nacional de Hurlingham',
      period: '2021 - En curso',
      status: '2021 - En curso',
      description: 'Tecnicatura Universitaria en Programación.',
      subjects: ['Python', 'C#', 'HTML5', 'CSS3', 'SQL']
    },
    {
      title: 'Cursos y Certificaciones',
      company: 'Varios Institutos',
      period: '2022 - 2024',
      status: 'Completado',
      description: 'FK{} Tech (HTML, CSS, JS), Desafío LATAM (SQL), Testing Manual y Automation, Python.',
      subjects: ['HTML5', 'CSS3', 'JavaScript', 'QA Manual', 'QA Automation']
    }
  ];

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-gray-200 via-red-100/40 to-gray-300 dark:from-gray-950 dark:via-black dark:to-gray-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed right-6 bottom-6 z-50 p-3 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
          >
            <ChevronUp size={24} />
          </button>
        )}

        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl shadow-lg border-b border-red-100/20 dark:border-red-900/20 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-wider">
                Nahuel Neira
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {[
                  { id: 'home', label: 'Inicio' },
                  { id: 'about', label: 'Acerca' },
                  { id: 'skills', label: 'Habilidades' },
                  { id: 'projects', label: 'Proyectos' },
                  { id: 'experience', label: 'Experiencia' },
                  { id: 'contact', label: 'Contacto' }
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`font-medium transition-colors duration-200 ${
                      activeSection === section.id
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
                
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/50 dark:hover:to-orange-900/50 transition-all duration-300 border border-red-200/30 dark:border-red-800/30"
                  title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
                >
                  {theme === 'light' ? (
                    <Moon size={18} className="text-red-600 dark:text-red-400" />
                  ) : (
                    <Sun size={18} className="text-red-600 dark:text-red-400" />
                  )}
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/50 dark:hover:to-orange-900/50 transition-all duration-300 border border-red-200/30 dark:border-red-800/30"
              >
                {isMenuOpen ? <X size={24} className="text-red-600 dark:text-red-400" /> : <Menu size={24} className="text-red-600 dark:text-red-400" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-red-100/30 dark:border-red-900/30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
                {[
                  { id: 'home', label: 'Inicio' },
                  { id: 'about', label: 'Acerca' },
                  { id: 'skills', label: 'Habilidades' },
                  { id: 'projects', label: 'Proyectos' },
                  { id: 'experience', label: 'Experiencia' },
                  { id: 'contact', label: 'Contacto' }
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="block w-full text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 rounded-lg mx-2 transition-all duration-200"
                  >
                    {section.label}
                  </button>
                ))}
                
                <div className="flex items-center justify-center px-4 py-2 mt-4 border-t border-red-100/30 dark:border-red-900/30">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/50 dark:hover:to-orange-900/50 transition-all duration-300 border border-red-200/30 dark:border-red-800/30"
                  >
                    {theme === 'light' ? (
                      <Moon size={18} className="text-red-600 dark:text-red-400" />
                    ) : (
                      <Sun size={18} className="text-red-600 dark:text-red-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-6 transition-colors duration-300 tracking-tight">
              Hola, soy <span className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">Nahuel</span>
            </h1>
            
            <div className="text-3xl md:text-4xl font-semibold text-gray-700 dark:text-gray-200 mb-8 h-16 transition-colors duration-300">
              {typedText}<span className="animate-pulse text-red-500">|</span>
            </div>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto transition-colors duration-300 leading-relaxed">
              Soy un desarrollador web full stack con conocimientos en Python, C#, SQL y experiencia en desarrollo backend y frontend. Actualmente en capacitación en desarrollo SAP e IA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => scrollToSection('projects')}
                className="px-10 py-4 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 border border-red-400/20"
              >
                Ver mis proyectos
              </button>
              <button className="px-10 py-4 border-2 border-red-200 dark:border-red-600 text-red-700 dark:text-red-200 bg-white/80 dark:bg-gray-800/80 font-semibold rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/50 hover:border-red-300 dark:hover:border-red-500 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                <Download size={20} />
                <a href="/Nahuel Neira CV.pdf" download="Nahuel_Neira_CV.pdf">
                  Descargar CV
                </a>
              </button>
            </div>
          </div>

          <button 
            onClick={() => scrollToSection('about')}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10"
          >
            <ChevronDown size={32} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-colors" />
          </button>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 transition-colors duration-300 tracking-tight">Acerca de Mí</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 mx-auto rounded-full shadow-lg"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-red-50/30 dark:from-gray-800/90 dark:to-red-950/30 p-8 rounded-3xl shadow-xl border border-red-100/30 dark:border-red-900/30 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Sobre Mí</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed transition-colors duration-300">
                    Soy un desarrollador web full stack con conocimientos en Python, C#, SQL y experiencia en desarrollo backend y frontend. Actualmente en capacitación en desarrollo SAP e IA. Busco mi primera experiencia en el sector IT, destacando por mi capacidad para resolver problemas y trabajar en equipo, siempre con el deseo de aprender y adaptarme a nuevas tecnologías.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-red-50/50 dark:from-orange-950/30 dark:to-red-950/20 p-6 rounded-2xl border border-orange-200/30 dark:border-orange-800/30 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-4 text-center">Intereses</h3>
                  <div className="grid grid-cols-1 gap-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-sm font-medium">🚀 Desarrollo Full Stack</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-sm font-medium">📊 Análisis de Datos</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-sm font-medium">🔧 Desarrollador SAP</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-sm font-medium">🧪 Testing manual y automation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-20 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 transition-colors duration-300 tracking-tight">Habilidades Técnicas</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 mx-auto rounded-full shadow-lg"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <div key={skill.name} className="group relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="relative bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-center border border-red-100/30 dark:border-red-900/30 backdrop-blur-sm transform group-hover:-translate-y-2">
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 rounded-2xl">
                          <Icon className="w-12 h-12 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{skill.name}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 transition-colors duration-300 tracking-tight">Proyectos Destacados</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 mx-auto rounded-full shadow-lg"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {projects.map((project, index) => (
                <div key={index} className="group relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transform group-hover:-translate-y-3 transition-all duration-300 border border-red-100/30 dark:border-red-900/30 backdrop-blur-sm h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-52 object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">{project.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300 leading-relaxed flex-1">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 text-red-700 dark:text-red-300 rounded-full font-medium border border-red-200/50 dark:border-red-800/50"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex space-x-4 mt-auto">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                        >
                          <Github size={18} className="mr-2" />
                          Código
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-20 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 transition-colors duration-300 tracking-tight">Experiencia y Formación</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 mx-auto rounded-full shadow-lg"></div>
            </div>
            
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-white/90 to-red-50/30 dark:from-gray-800/90 dark:to-red-950/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-red-100/30 dark:border-red-900/30 backdrop-blur-sm transform group-hover:-translate-y-1">
                    <div className="flex flex-col mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{exp.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            exp.status.includes('En curso')
                              ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300' 
                              : 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'
                          }`}>
                            {exp.status.includes('En curso') ? exp.status : exp.status}
                          </span>
                        </div>
                        <h4 className="text-lg text-red-700 dark:text-red-300 mb-2 font-semibold">{exp.company}</h4>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{exp.description}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-red-100/50 dark:border-red-900/50 pt-6">
                      <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Materias destacadas:</h5>
                      <div className="flex flex-wrap gap-3">
                        {exp.subjects.map((subject, subjectIndex) => (
                          <span
                            key={subjectIndex}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 text-red-700 dark:text-red-300 rounded-full font-medium border border-red-200/50 dark:border-red-800/50"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {exp.title === 'Cursos y Certificaciones' && (
                      <div className="mt-6 pt-4 border-t border-red-100/50 dark:border-red-900/50">
                        <a
                          href="https://drive.google.com/drive/folders/1IoP2Oz1y2868LvH8kFv8tG_Osa69o1Nh?usp=sharing"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Ver más certificaciones
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 transition-colors duration-300 tracking-tight">Contactemos</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 mx-auto rounded-full shadow-lg"></div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-8 leading-relaxed">
                Siempre estoy abierto a discutir nuevas oportunidades y proyectos interesantes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center group">
                  <div className="p-4 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 rounded-2xl mr-6 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">nahuelekon2207@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center group">
                  <div className="p-4 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 rounded-2xl mr-6 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Teléfono</h3>
                    <p className="text-gray-600 dark:text-gray-300">+54 9 1136953036</p>
                  </div>
                </div>
                
                <div className="flex items-center group">
                  <div className="p-4 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 rounded-2xl mr-6 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Ubicación</h3>
                    <p className="text-gray-600 dark:text-gray-300">Buenos Aires, Argentina</p>
                  </div>
                </div>
                
                <div className="pt-8">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Conecta conmigo</h3>
                  <div className="flex space-x-4">
                    <a href="https://github.com/DemmMotionless" target="_blank" rel="noopener noreferrer" className="group p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/50 dark:hover:to-orange-900/50 transition-all duration-300 border border-red-200/30 dark:border-red-800/30 transform hover:scale-110">
                      <Github size={24} className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                    </a>
                    <a href="http://www.linkedin.com/in/nahuel-neira" target="_blank" rel="noopener noreferrer" className="group p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/50 dark:hover:to-orange-900/50 transition-all duration-300 border border-red-200/30 dark:border-red-800/30 transform hover:scale-110">
                      <Linkedin size={24} className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                    </a>
                    <a href="mailto:nahuelekon2207@gmail.com" target="_blank" rel="noopener noreferrer" className="group p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/50 dark:hover:to-orange-900/50 transition-all duration-300 border border-red-200/30 dark:border-red-800/30 transform hover:scale-110">
                      <Mail size={24} className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-3 space-y-6 relative">
                {/* Cooldown Overlay */}
                {cooldownEndTime && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-red-500/50 text-center max-w-md">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          ¡Mensaje Enviado!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          El mensaje se ha enviado correctamente.
                        </p>
                        <p className="text-gray-700 dark:text-gray-200 font-medium">
                          Por favor, espere{' '}
                          <span className="font-mono text-red-600 dark:text-red-400 text-lg">
                            {timeRemaining}
                          </span>
                          {' '}antes de enviar otro.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form 
                  onSubmit={handleFormSubmit} 
                  className={`transition-all duration-300 ${cooldownEndTime ? 'blur-sm pointer-events-none' : ''}`}
                >
                  <div className="bg-gradient-to-br from-white to-red-50/30 dark:from-gray-800 dark:to-red-950/20 p-8 rounded-3xl shadow-xl border border-red-100/30 dark:border-red-900/30 backdrop-blur-sm space-y-6">
                  
                    {/* Status Messages */}
                    {submitStatus === 'error' && (
                      <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-2xl">
                        <p className="text-red-800 dark:text-red-200 font-medium text-center">
                          Error al enviar el mensaje. Por favor, intenta nuevamente.
                        </p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-6 py-4 border-2 border-red-200/50 dark:border-red-800/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm"
                        placeholder="Tu nombre"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-6 py-4 border-2 border-red-200/50 dark:border-red-800/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm"
                        placeholder="tu@email.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Asunto
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-6 py-4 border-2 border-red-200/50 dark:border-red-800/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm"
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="Oportunidad Laboral">Oportunidad Laboral</option>
                        <option value="Proyecto Freelance">Proyecto Freelance</option>
                        <option value="Colaboración">Colaboración</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full px-6 py-4 border-2 border-red-200/50 dark:border-red-800/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 resize-none bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm"
                        placeholder="Tu mensaje"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full px-10 py-4 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 border ${
                        isSubmitting 
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-1 hover:scale-105 border-red-400/20'
                      } text-white`}
                    >
                      <Send size={20} />
                      {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/90 dark:bg-black/90 text-white py-16 backdrop-blur-sm transition-colors duration-300 relative z-10 border-t border-red-900/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Profile Info */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4">
                    NN
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Nahuel Neira</h3>
                    <p className="text-gray-400">Full Stack Developer</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Desarrollador Full Stack especializado en crear soluciones escalables y eficientes. Siempre enfocado en generar valor real a través de la tecnología.
                </p>
                
                <div className="flex space-x-4">
                  <a href="https://github.com/DemmMotionless" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                    <Github size={20} className="text-gray-300" />
                  </a>
                  <a href="http://www.linkedin.com/in/nahuel-neira" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                    <Linkedin size={20} className="text-gray-300" />
                  </a>
                  <a href="mailto:nahuelekon2207@gmail.com" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                    <Mail size={20} className="text-gray-300" />
                  </a>
                </div>
              </div>
              
              {/* Right Column - Quick Links */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Enlaces Rápidos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <button onClick={() => scrollToSection('home')} className="block text-gray-400 hover:text-red-400 transition-colors">
                      Inicio
                    </button>
                    <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-red-400 transition-colors">
                      Sobre Mí
                    </button>
                    <button onClick={() => scrollToSection('experience')} className="block text-gray-400 hover:text-red-400 transition-colors">
                      Experiencia
                    </button>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => scrollToSection('skills')} className="block text-gray-400 hover:text-red-400 transition-colors">
                      Habilidades
                    </button>
                    <button onClick={() => scrollToSection('projects')} className="block text-gray-400 hover:text-red-400 transition-colors">
                      Proyectos
                    </button>
                    <button onClick={() => scrollToSection('contact')} className="block text-gray-400 hover:text-red-400 transition-colors">
                      Contacto
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 Nahuel Neira Portfolio. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;