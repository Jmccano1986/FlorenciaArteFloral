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

// Fondos para sección social
import bgsocial169 from './assets/bgsocial169.webp';
import bgsocial916 from './assets/bgsocial916.webp';

const NotificationBar = () => {
  const [text, setText] = useState('Envios a todo el país • Diseños florales exclusivos');

  useEffect(() => {
    // Listen for real-time updates to the notification config
    const unsub = onSnapshot(doc(db, 'config', 'notification'), (doc) => {
      if (doc.exists()) {
        setText(doc.data().text);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="w-full bg-florencia-dark text-white py-2 text-center text-[10px] md:text-xs tracking-[0.2em] font-normal relative z-[60]">
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

  if (!category) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-florencia-cream w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-florencia-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className={`floating-header pointer-events-auto flex items-center justify-between px-4 md:px-6 w-[95%] lg:w-[35%] max-w-4xl transition-all duration-300 ${scrolled ? 'scale-95' : 'scale-100'}`}>
        <nav className="flex-1 flex justify-start">
          <button
            onClick={() => handleNavClick('nosotros')}
            className="text-white uppercase tracking-[0.2em] text-sm font-medium hover:opacity-70 transition-opacity bg-transparent border-0 cursor-pointer"
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
            className="text-white uppercase tracking-[0.2em] text-sm font-medium hover:opacity-70 transition-opacity bg-transparent border-0 cursor-pointer"
          >
            Catálogo
          </button>
        </nav>
      </div>
    </motion.header>
  );
};

const Footer = () => {
  return (
    <footer id="contacto" className="bg-florencia-dark text-white pt-20 pb-10 px-8">
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
              className="flex items-center gap-2 mt-2 text-florencia-gold hover:opacity-80 transition-opacity w-fit"
            >
              <span>📍</span>
              <span className="font-medium underline underline-offset-4">Cómo llegar</span>
            </a>
            <p className="flex flex-col items-center gap-1 mt-4">
              <span className="font-medium">Teléfono:</span>
              <a href="tel:3113004312" className="hover:text-florencia-gold transition-colors">(+57) 311 3004312</a>
            </p>
            <a
              href="http://wa.me/573113004312"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 text-florencia-gold hover:opacity-80 transition-opacity w-fit"
            >
              <span>🟢</span>
              <span className="font-medium underline underline-offset-4">Whatsapp</span>
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
          className="text-lg md:text-xl tracking-[0.3em] uppercase font-light"
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
      className="fixed bottom-3 right-3 z-[100] flex items-center pointer-events-none"
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
        className="bg-[#2ec260] w-12 h-12 rounded-full shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] transition-shadow duration-300 flex items-center justify-center pointer-events-auto active:scale-95"
      >
        <img src={whatsappIcon} alt="WhatsApp" className="w-12 h-12" />
      </motion.a>
    </motion.div>
  );
};

const FloatingSocialTab = () => {
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
      className="fixed left-0 bottom-0 z-[80] bg-florencia-dark text-white px-2 py-6 rounded-r-xl shadow-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 group overflow-hidden"
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
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-widest text-florencia-dark font-medium whitespace-nowrap text-center">
                Seguir en <br /> {social.id === 'fb' ? 'Facebook' : social.id === 'insta' ? 'Instagram' : 'TikTok'}
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const Storefront = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hidePrices, setHidePrices] = useState(false);

  useEffect(() => {
    // Listen for general config
    const unsubConfig = onSnapshot(doc(db, 'config', 'notification'), (doc) => {
      if (doc.exists()) {
        setHidePrices(doc.data().hidePrices || false);
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

    return () => {
      unsubConfig();
      unsubscribe();
    };
  }, []);

  return (
    <>
      <main className="relative">
        <NotificationBar />
        <Header />
        <HeroSection />

        {/* Placeholder sections for scrolling demo */}
        <section id="nosotros" className="md:py-24 px-8 bg-[#f4f4f6] min-h-screen flex items-center justify-center">
          <div className="max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl mb-8">Nuestra Historia</h2>
            <div className="text-base md:text-[17px] text-gray-600 leading-relaxed space-y-6">
              <p>Florencia es una marca pereirana que inició en el año 2016 bajo el nombre MÍA Floristería, con el propósito de transformar la manera de regalar flores en el mercado local.<br />
                Nuestra floración constante se basa en construiruna experiencia sensorial, olfativa y visual a través de piezas únicas, creadas con atención, sensibilidad y amor por los detalles.<br />
                Hoy, nuestro sello es Florencia Arte Floral, y nuestro propósito sigue siendo guiar a nuestros clientes a comprender que cada uno de nuestros diseños llega a ellos con un objetivo:</p>
              <p className="italic font-serif text-xl text-florencia-gold md:pt-4">vivir el momento presente con atención, detenerse, observarlos, cuidarlos y disfrutarlos.</p>
            </div>
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
      </main>

      <Footer />

      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          hidePrices={hidePrices}
        />
      )}

      <WhatsAppButton />
      <FloatingSocialTab />
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
