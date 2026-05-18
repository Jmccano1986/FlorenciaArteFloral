import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Outlet } from 'react-router-dom';
import logo from './assets/logo.svg';
import heroVideo from './assets/hero_homepage.mp4';
import whatsappIcon from './assets/wzap.svg';
import AdminApp from './admin/AdminApp';
import { db } from './firebase';
import { doc, onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';

// Assets para animación de redes sociales
import florInsta from './assets/flor_instagram.webp';
import florTiktok from './assets/flor_tiktok.webp';
import florFb from './assets/flor_facebook.webp';

// Fondos para sección social y nosotros
import bgsocial169 from './assets/bgsocial169.webp';
import bgsocial916 from './assets/bgsocial916.webp';
import bghistory169 from './assets/bghistory169.webp';
import bghistory916 from './assets/bghistory916.webp';
import rutaImg from './assets/ruta.webp';

const NotificationBar = () => {
  const [text, setText] = useState('Envíos en Pereira y Dosquebradas • Diseños florales exclusivos');
  const [themeColor, setThemeColor] = useState('dark');

  useEffect(() => {
    // Listen for real-time updates to the notification config
    const unsub = onSnapshot(doc(db, 'config', 'notification'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setText(data.text);
        setThemeColor(data.themeColor || 'dark');
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className={`w-full ${themeColor === 'old' ? 'bg-florencia-old' : 'bg-florencia-dark'} text-white py-2 text-center text-[12px] md:text-sm tracking-[0.2em] font-normal relative z-[60]`}>
      <p>{text}</p>
    </div>
  );
};

const CategoryModal = ({ category, onClose, hidePrices }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!category) return;

    const q = query(
      collection(db, 'products'),
      where('categoryId', '==', category.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const prods = [];
      querySnapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
      setLoadingProducts(false);
    });

    return () => unsubscribe();
  }, [category]);

  useEffect(() => {
    // Bloquear scroll del body al abrir el modal
    document.body.style.overflow = 'hidden';
    return () => {
      // Restaurar scroll al cerrar
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!category) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-florencia-cream w-full h-full overflow-y-auto relative"
        >
          <button
            onClick={onClose}
            className="fixed top-6 right-6 z-[110] p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 group"
            title="Cerrar"
          >
            <svg className="w-6 h-6 text-florencia-dark group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif italic mb-4">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
              )}
            </div>

            {loadingProducts ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-2 border-florencia-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.reference}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-serif text-xl mb-2">{product.reference}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                      <div className="mt-auto pt-4 border-t border-gray-50">
                        {!hidePrices && (
                          <p className="text-florencia-gold font-medium text-lg mb-4">${product.price?.toLocaleString()}</p>
                        )}

                        <a
                          href={`https://wa.me/573113004312?text=${encodeURIComponent(`¡Hola! Me encantó este diseño floral de la categoría *${category.name}*. Se llama *${product.reference}*. ¿Me podrías dar más información? 🌸`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 bg-florencia-dark text-white px-6 py-3 rounded-sm hover:bg-florencia-gold transition-all duration-300 text-xs uppercase tracking-widest font-medium group/btn"
                        >
                          Comprar
                          <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 italic">
                Aún no hay productos en esta categoría.
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const BlogPostModal = ({ post, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-florencia-cream w-full max-w-4xl max-h-[90vh] overflow-y-auto relative rounded-lg shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[120] p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 group"
          >
            <svg className="w-5 h-5 text-florencia-dark group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row h-full">
            <div className="md:w-1/2 aspect-square md:aspect-auto">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-serif italic mb-6 text-florencia-dark">{post.title}</h2>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {post.description}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Smooth scroll con offset fijo
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (!element) return;

  const headerOffset = 0;
  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: elementTop - headerOffset, behavior: 'smooth' });
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isScrollingToSection = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingToSection.current) return;

      const currentScrollY = window.scrollY;

      // Control de escala
      setScrolled(currentScrollY > 50);

      // El header solo aparece si la posición de scroll es cero (o muy cerca)
      if (currentScrollY <= 10) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (sectionId) => {
    setVisible(false);
    isScrollingToSection.current = true;
    scrollToSection(sectionId);

    // Liberar el bloqueo después de que termine la animación
    setTimeout(() => {
      isScrollingToSection.current = false;
      setLastScrollY(window.scrollY);
    }, 1000);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: visible ? 0 : -120,
        opacity: visible ? 1 : 0
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed top-20 left-0 w-full z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className={`floating-header pointer-events-auto flex items-center justify-between px-4 md:px-6 w-[95%] md:w-[50%] xl:w-[28%] max-w-4xl transition-all duration-300 ${scrolled ? 'scale-95' : 'scale-100'}`}>
        <nav className="flex-1 flex justify-start">
          <button
            onClick={() => handleNavClick('nosotros')}
            className="text-white uppercase tracking-[0.1em] text-sm font-bold font-narrow hover:opacity-70 transition-opacity bg-transparent border-0 cursor-pointer"
          >
            Nosotros
          </button>
        </nav>

        <div className="logo-container">
          <img src={logo} alt="Florencia Logo" className="h-24 w-24 md:h-32 md:w-32 object-contain" />
        </div>

        <nav className="flex-1 flex justify-end">
          <button
            onClick={() => handleNavClick('catalogo')}
            className="text-white uppercase tracking-[0.1em] text-sm font-bold font-narrow hover:opacity-70 transition-opacity bg-transparent border-0 cursor-pointer"
          >
            Catálogo
          </button>
        </nav>
      </div>
    </motion.header>
  );
};

const Footer = ({ themeColor }) => {
  return (
    <footer id="contacto" className={`${themeColor === 'old' ? 'bg-florencia-old' : 'bg-florencia-dark'} text-white pt-20 pb-10 px-8`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        {/* Contacto y Ubicación */}
        <div className="flex flex-col items-center text-center space-y-4">
          <h4 className="font-serif text-2xl bold mb-6">Contacto</h4>
          <div className="flex flex-col items-center space-y-3 text-sm opacity-90 font-light tracking-wide">
            <p className="flex flex-col items-center gap-1">
              <span className="font-medium">Dirección:</span>
              <span>Cra 6 #30-74, Pereira, Risaralda</span>
            </p>
            <a
              href="https://maps.app.goo.gl/3DCqFHa1ErHoBatA8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 text-white hover:text-florencia-gold transition-opacity w-fit"
            >
              <span>📍</span>
              <span className="font-medium underline underline-offset-4">Cómo llegar</span>
              <span>📍</span>
            </a>
            <p className="flex flex-col items-center gap-1 mt-4">
              <span className="font-medium">Teléfono:</span>
              <a href="tel:3113004312" className="hover:text-florencia-gold transition-colors">(+57) 311 3004312</a>
            </p>
            <a
              href="http://wa.me/573113004312"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 text-white hover:text-florencia-gold transition-opacity w-fit"
            >
              <span>🟢</span>
              <span className="font-medium underline underline-offset-4">Whatsapp</span>
              <span>🟢</span>
            </a>
            <p className="mt-4">
              <span className="font-medium">Horario:</span>
            </p>
            <p>
              <span>Lunes a Viernes de 8 am a 6 pm</span>
            </p>
            <p>
              <span>Sábados de 8 am a 12 pm</span>
            </p>
          </div>
        </div>

        {/* Enlaces */}
        <div className="flex flex-col items-center text-center">
          <div>
            <h4 className="font-serif text-2xl bold mb-6">Enlaces</h4>
            <nav className="flex flex-col items-center space-y-3 text-sm opacity-90 font-light tracking-wide">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-florencia-gold transition-colors">Inicio</button>
              <button onClick={() => scrollToSection('nosotros')} className="hover:text-florencia-gold transition-colors">Nosotros</button>
              <button onClick={() => scrollToSection('social-section')} className="hover:text-florencia-gold transition-colors">Social</button>
              <button onClick={() => scrollToSection('catalogo')} className="hover:text-florencia-gold transition-colors">Catálogo</button>
              <button onClick={() => scrollToSection('contacto')} className="hover:text-florencia-gold transition-colors">Contacto</button>
            </nav>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="flex flex-col items-center text-center">
          <h4 className="font-serif text-2xl bold mb-6">Síguenos</h4>
          <div className="flex gap-6">
            <a href="https://www.instagram.com/florencia_artefloral" target="_blank" rel="noopener noreferrer" className="hover:text-florencia-gold transition-colors" title="Instagram">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@florencia_artefloral" target="_blank" rel="noopener noreferrer" className="hover:text-florencia-gold transition-colors" title="TikTok">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.036 2.612.012 3.914.03.03 1.56.233 3.127 1.014 4.5 1.044 1.726 2.745 2.915 4.532 3.73V12.1c-1.208-.083-2.45-.42-3.414-1.205-1.026-.804-1.777-1.92-2.255-3.122-.017 2.103.02 4.208-.014 6.315-.03 2.39-.55 4.96-2.26 6.724-1.33 1.44-3.324 2.22-5.33 2.19-2.482-.012-4.756-1.425-5.74-3.69-.9-2.117-.652-4.763.703-6.61 1.143-1.587 3.022-2.437 4.963-2.356V11.2c-1.108-.052-2.3.433-2.816 1.44-.43.832-.32 1.846.12 2.612.63 1.036 1.872 1.554 3.035 1.34 1.1-.203 1.878-1.203 1.968-2.31.066-2.224.032-4.448.046-6.673.014-2.525.02-5.05.02-7.575z" />
              </svg>
            </a>
            <a href="https://www.facebook.com/miafloristeriapereira" target="_blank" rel="noopener noreferrer" className="hover:text-florencia-gold transition-colors" title="Facebook">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-50 font-light tracking-widest uppercase">
        <p>&copy; {new Date().getFullYear()} Florencia Arte Floral. Todos los derechos reservados.</p>
        <p>Desarrollado por <a href="https://cofitx.web.app/" target="_blank" rel="noopener noreferrer" className="hover:text-florencia-gold transition-colors">Cofitx</a></p>
      </div>
    </footer>
  );
};

const HeroSection = () => {
  return (
    <section className="hero-video-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        className="hero-video"
        onCanPlay={(e) => {
          e.target.muted = true;
        }}
      >
        <source src={heroVideo} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
      <div className="hero-overlay" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-5xl md:text-7xl font-serif mb-6 italic"
        >
          Arte que florece
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="text-lg md:text-xl tracking-[0.3em] uppercase font-light font-narrow"
        >
          • Piezas Únicas •
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-[1px] h-20 bg-white/30 relative overflow-hidden">
          <motion.div
            animate={{ y: [0, 80] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
};

const WhatsAppButton = () => {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      className="fixed bottom-4 right-4 z-[100] flex items-center pointer-events-none"
    >
      <motion.div
        variants={{
          initial: { opacity: 0, x: 20, scale: 0.8 },
          hover: { opacity: 1, x: 0, scale: 1 }
        }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white px-5 py-2 rounded-xl shadow-2xl mr-4 border border-gray-50 flex items-center justify-center"
      >
        <p className="text-[12px] font-medium text-gray-800 whitespace-nowrap leading-none">
          ¿Te ayudamos?
        </p>
      </motion.div>

      <motion.a
        href="http://wa.me/573113004312"
        target="_blank"
        rel="noopener noreferrer"
        variants={{
          initial: { scale: 1 },
          hover: { scale: 1.1 }
        }}
        className="bg-[#2ec260] w-14 h-14 rounded-full shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] transition-shadow duration-300 flex items-center justify-center pointer-events-auto active:scale-95"
      >
        <img src={whatsappIcon} alt="WhatsApp" className="w-14 h-14" />
      </motion.a>
    </motion.div>
  );
};

const FloatingSocialTab = ({ themeColor }) => {
  const scrollToSocial = () => {
    const section = document.getElementById('social-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.button
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      whileHover={{ x: 0 }}
      onClick={scrollToSocial}
      className={`fixed left-0 bottom-0 z-[80] ${themeColor === 'old' ? 'bg-florencia-old' : 'bg-florencia-dark'} text-white px-2 py-6 rounded-r-xl shadow-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 group overflow-hidden`}
    >
      <span
        className="text-[10px] md:text-xs font-medium tracking-[0.3em] [writing-mode:vertical-rl] rotate-180"
      >
        Nuestras Redes
      </span>
      <div className="w-[1px] h-2 bg-white/20 mt-1" />
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mt-1"
      >
        <svg
          className="w-4 h-4 text-florencia-gold"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
        </svg>
      </motion.div>
    </motion.button>
  );
};

const SocialFlowersSection = () => {
  const socialLinks = [
    { id: 'insta', img: florInsta, url: 'https://www.instagram.com/florencia_artefloral', delay: 0.4 },
    { id: 'tiktok', img: florTiktok, url: 'https://www.tiktok.com/@florencia_artefloral', delay: 0.6 },
    { id: 'fb', img: florFb, url: 'https://www.facebook.com/miafloristeriapereira', delay: 0.8 },
  ];

  return (
    <section id="social-section" className="py-24 bg-white overflow-hidden relative flex flex-col items-center justify-center border-y border-gray-100 min-h-[600px] md:min-h-screen">
      {/* Fondo Responsivo */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgsocial169}
          alt=""
          className="hidden md:block w-full h-full object-cover"
        />
        <img
          src={bgsocial916}
          alt=""
          className="block md:hidden w-full h-full object-cover"
        />
        {/* Capa de suavizado para que las flores resalten */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 z-10"
      >
        <h2 className="text-white text-4xl md:text-5xl">Nuestras Redes</h2>
      </motion.div>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        className="w-full max-w-6xl relative h-auto md:h-[300px]"
      >
        {/* Las Flores / Redes Sociales */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-12 w-full h-full relative z-10">
          {socialLinks.map((social) => (
            <motion.a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={{
                initial: { x: '80vw', opacity: 0 },
                animate: {
                  x: 0,
                  opacity: 1,
                  rotate: [0, -5, 5, -2, 2, 0]
                }
              }}
              transition={{
                x: { type: "spring", stiffness: 40, damping: 12, delay: social.delay },
                opacity: { duration: 0.5, delay: social.delay },
                rotate: { duration: 0.8, delay: social.delay + 1.5 }
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="block group"
            >
              <motion.img
                src={social.img}
                alt={social.id}
                className="h-[130px] md:h-[200px] w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                animate={{
                  y: [0, -12, 0, -6, 0],
                }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                    delay: social.delay + 2.5
                  }
                }}
              />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-widest text-white font-medium whitespace-nowrap text-center">
                Seguir en <br /> {social.id === 'fb' ? 'Facebook' : social.id === 'insta' ? 'Instagram' : 'TikTok'}
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const BlogSection = ({ posts, onPostClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [posts]);

  return (
    <section className="py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-stretch">
          {/* Cómo llegar */}
          <div className="lg:w-1/2 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-serif italic mb-10 text-center">Cómo llegar</h2>
            <a
              href="https://maps.app.goo.gl/3DCqFHa1ErHoBatA8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-2xl overflow-hidden border border-gray-100 group relative w-full block aspect-square md:aspect-auto min-h-[400px]"
            >
              <img
                src={rutaImg}
                alt="Nuestra ubicación"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white/90 text-florencia-dark px-6 py-3 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg">
                  Ver en Google Maps
                </span>
              </div>
            </a>
          </div>

          {/* Blog Banner */}
          <div className="lg:w-1/2 flex flex-col items-center relative overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-serif italic mb-10 text-center">Blog</h2>
            <div className="flex-1 relative bg-florencia-cream rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-full aspect-square md:aspect-auto min-h-[500px]">
              {posts.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={posts[currentIndex].id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col cursor-pointer"
                    onClick={() => onPostClick(posts[currentIndex])}
                  >
                    <div className="h-2/3 overflow-hidden">
                      <img
                        src={posts[currentIndex].imageUrl}
                        alt={posts[currentIndex].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="h-1/3 p-8 flex flex-col justify-center bg-white">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-florencia-gold mb-2">Entrada de Blog</p>
                      <h3 className="text-2xl md:text-3xl font-serif italic text-florencia-dark group-hover:text-florencia-gold transition-colors line-clamp-2">
                        {posts[currentIndex].title}
                      </h3>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  Próximamente nuevas entradas...
                </div>
              )}

              {/* Progress indicator dots */}
              {posts.length > 1 && (
                <div className="absolute bottom-6 right-8 flex gap-2 z-10">
                  {posts.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-florencia-gold' : 'w-2 bg-gray-200'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const reviews = [
    {
      name: "Luz Duque",
      text: "Encantada con el arreglo que mande a hacer. Productos lindos y frescos. Excelente servicio",
      stars: 5,
      date: "Reciente"
    },
    {
      name: "Martha Isabel Bedoya",
      text: "Es un excelente lugar para regalar algo unico, especial y con buen gusto, la atención también es muy buena!",
      stars: 5,
      date: "Reciente"
    },
    {
      name: "Paula Andrea Osorio",
      text: "La atención de Paula súper rápida y oportuna! Sus productos son hermosos y se acomodan a tu presupuesto! Muy recomendados!",
      stars: 5,
      date: "Reciente"
    },
    {
      name: "Tulio Alarcón García",
      text: "Excelente servicio y hermosos arreglos. Recomendado 100%.",
      stars: 5,
      date: "Reciente"
    }
  ];

  return (
    <section className="py-24 bg-florencia-cream/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex justify-center items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Google Reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-florencia-dark">Lo que dicen nuestros clientes</h2>
          <div className="flex justify-center gap-1 mt-6">
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} className="w-6 h-6 text-florencia-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 font-medium text-florencia-dark">5.0</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(review.stars)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-florencia-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic text-sm leading-relaxed mb-6">"{review.text}"</p>
              </div>
              <div>
                <p className="font-serif font-bold text-florencia-dark">{review.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Google User</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <a
            href="https://search.google.com/local/writereview?placeid=ChIJvXVo6CF9OI4RD3GYdCZS6Eg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-florencia-dark text-white rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <span>Danos tu opinión en Google</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const PromoPopup = () => {
  const [config, setConfig] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if it was already closed in this session
    const isClosed = sessionStorage.getItem('promo_popup_closed');
    if (isClosed) return;

    const unsub = onSnapshot(doc(db, 'config', 'popup'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setConfig(data);
        if (data.isActive && data.imageUrl) {
          // Delay a bit for better UX
          setTimeout(() => setIsVisible(true), 1500);
        } else {
          setIsVisible(false);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('promo_popup_closed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && config && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-[500px] aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {config.redirectUrl ? (
              <a href={config.redirectUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                <img
                  src={config.imageUrl}
                  alt="Promoción"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </a>
            ) : (
              <img
                src={config.imageUrl}
                alt="Promoción"
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Storefront = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [hidePrices, setHidePrices] = useState(false);
  const [themeColor, setThemeColor] = useState('dark');
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    // Listen for general config
    const unsubConfig = onSnapshot(doc(db, 'config', 'notification'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setHidePrices(data.hidePrices || false);
        setThemeColor(data.themeColor || 'dark');
      }
    });

    const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cats = [];
      querySnapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      setCategories(cats);
      setLoading(false);
    });

    const qBlog = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsubscribeBlog = onSnapshot(qBlog, (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      setBlogPosts(posts);
    });

    return () => {
      unsubConfig();
      unsubscribe();
      unsubscribeBlog();
    };
  }, []);

  return (
    <>
      <main className="relative">
        <NotificationBar />
        <Header />
        <HeroSection />

        {/* Placeholder sections for scrolling demo */}
        <section id="nosotros" className="relative min-h-screen flex flex-col items-center justify-start pt-[10%] lg:pt-[3%] px-8 overflow-hidden">
          {/* Fondo Responsivo */}
          <div className="absolute inset-0 z-0">
            <img
              src={bghistory169}
              alt=""
              className="hidden md:block w-full h-full object-cover"
            />
            <img
              src={bghistory916}
              alt=""
              className="block md:hidden w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-serif italic drop-shadow-lg"
            >
              Nuestra Historia
            </motion.h2>
          </div>
        </section>

        <SocialFlowersSection />

        <section id="catalogo" className="py-16 px-8 bg-florencia-cream min-h-[50vh] flex items-center justify-center border-t border-gray-100">
          <div className="max-w-6xl w-full text-center">
            <h2 className="text-4xl md:text-5xl mb-12">Catálogo</h2>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-2 border-florencia-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="aspect-[3/4] bg-florencia-cream rounded-sm overflow-hidden relative group cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.mainImageUrl ? (
                      <img
                        src={cat.mainImageUrl}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                    <div className="absolute bottom-8 left-8 text-left text-white z-10">
                      <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-80">Categoría</p>
                      <h3 className="font-serif text-2xl italic leading-tight">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2 font-light">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-gray-400 italic">
                Estamos preparando nuevas colecciones para ti.
              </div>
            )}
          </div>
        </section>

        <BlogSection posts={blogPosts} onPostClick={setSelectedPost} />
        <TestimonialsSection />
      </main>

      <Footer themeColor={themeColor} />

      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          hidePrices={hidePrices}
        />
      )}

      {selectedPost && (
        <BlogPostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      <WhatsAppButton />
      <FloatingSocialTab themeColor={themeColor} />
      <PromoPopup />
    </>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}

export default App;

