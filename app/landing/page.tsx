'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur z-50 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📻</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              RadioBiz
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-purple-400 transition">Características</a>
            <a href="#pricing" className="hover:text-purple-400 transition">Planes</a>
            <a href="#testimonials" className="hover:text-purple-400 transition">Testimonios</a>
            <Link href="/login" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Tu Estación de Radio
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              Digital Lista
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Transmite música, anuncios y jingles automáticamente. Gestiona múltiples clientes desde un solo dashboard. Todo en la nube, en tiempo real.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition transform hover:scale-105">
              Empezar Ahora →
            </Link>
            <button className="px-8 py-4 border border-zinc-700 hover:border-purple-600 rounded-full transition">
              Ver Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20">
            <div>
              <div className="text-4xl font-bold text-purple-400">500+</div>
              <div className="text-zinc-400">Clientes Activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">99.9%</div>
              <div className="text-zinc-400">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">24/7</div>
              <div className="text-zinc-400">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Características Poderosas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 bg-zinc-800/50 rounded-2xl border border-zinc-700 hover:border-purple-600 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Planes Simples y Transparentes</h2>
          <p className="text-center text-zinc-400 mb-16">Elige el plan perfecto para tu negocio</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 border transition ${
                  plan.featured
                    ? 'bg-gradient-to-b from-purple-900/20 to-orange-900/20 border-purple-600 transform md:scale-105'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                }`}
              >
                {plan.featured && (
                  <div className="bg-gradient-to-r from-purple-600 to-orange-600 text-white text-sm font-bold py-1 px-3 rounded-full inline-block mb-4">
                    Más Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-zinc-400 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-zinc-400">/mes</span>
                </div>
                <button className={`w-full py-3 rounded-lg font-bold transition mb-6 ${
                  plan.featured
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'border border-zinc-700 hover:bg-zinc-700'
                }`}>
                  Empezar
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="text-zinc-300 flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Lo Que Dicen Nuestros Clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-8 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-orange-400 rounded-full flex items-center justify-center">
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-zinc-400">{testimonial.business}</div>
                  </div>
                </div>
                <p className="text-zinc-300 mb-4">&quot;{testimonial.quote}&quot;</p>
                <div className="text-yellow-400">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo Para Comenzar?</h2>
          <p className="text-zinc-400 mb-8">Únete a 500+ negocios que ya transmiten con RadioBiz</p>

          <form onSubmit={handleSubscribe} className="flex gap-3 mb-4">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 font-bold rounded-lg transition"
            >
              Registrarse
            </button>
          </form>

          {subscribed && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 p-3 rounded-lg">
              ✓ ¡Gracias! Pronto te enviaremos más información.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📻</span>
                <span className="font-bold">RadioBiz</span>
              </div>
              <p className="text-zinc-400 text-sm">Tu estación de radio digital</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#features" className="hover:text-white">Características</a></li>
                <li><a href="#pricing" className="hover:text-white">Precios</a></li>
                <li><a href="#" className="hover:text-white">Documentación</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white">Acerca de</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-400">
            <p>&copy; 2026 RadioBiz. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Datos ficticios
const features = [
  {
    icon: '🎵',
    title: 'Streaming de Música',
    description: 'Transmite desde Google Drive, URLs de radio o servicios de streaming. Control total del catálogo.'
  },
  {
    icon: '📻',
    title: 'Jingles Automáticos',
    description: 'Programa jingles y anuncios con fade in/out automático. Control de intervalo configurable.'
  },
  {
    icon: '📊',
    title: 'Dashboard Intuitivo',
    description: 'Gestiona múltiples reproductores desde un solo lugar. Estadísticas en tiempo real.'
  },
  {
    icon: '🎮',
    title: 'Control Remoto',
    description: 'Controla reproducción, volumen y anuncios desde cualquier lugar en tiempo real.'
  },
  {
    icon: '🔐',
    title: 'Seguridad Enterprise',
    description: 'Autenticación Firebase, encriptación, bloqueo de clientes y auditoría completa.'
  },
  {
    icon: '⚡',
    title: '99.9% Uptime',
    description: 'Infraestructura en la nube con redundancia y failover automático.'
  }
];

const plans = [
  {
    name: 'Básico',
    price: 299,
    description: 'Para pequeños negocios',
    features: [
      'Hasta 2 reproductores',
      'Google Drive integration',
      'Control básico',
      'Soporte email',
      '10 GB almacenamiento',
      'Estadísticas básicas'
    ],
    featured: false
  },
  {
    name: 'Estándar',
    price: 499,
    description: 'Para negocios en crecimiento',
    features: [
      'Hasta 10 reproductores',
      'Google Drive + Radio URL',
      'Control remoto completo',
      'Soporte prioritario',
      '100 GB almacenamiento',
      'Estadísticas avanzadas',
      'Programación de jingles'
    ],
    featured: true
  },
  {
    name: 'Premium',
    price: 999,
    description: 'Para redes profesionales',
    features: [
      'Reproductores ilimitados',
      'Todas las integraciones',
      'API REST completa',
      'Soporte 24/7 por teléfono',
      'Almacenamiento ilimitado',
      'Analytics personalizado',
      'Consultoría incluida'
    ],
    featured: false
  }
];

const testimonials = [
  {
    name: 'Carlos Mendoza',
    business: 'La Cabaña Restaurant',
    initial: 'CM',
    quote: 'RadioBiz revolucionó cómo reproducimos música en el restaurante. Control total, sin complicaciones.'
  },
  {
    name: 'Ana García',
    business: 'AutoZone México',
    initial: 'AG',
    quote: 'Los jingles automáticos generan conversiones. El ROI fue increíble en los primeros 3 meses.'
  },
  {
    name: 'Marco López',
    business: 'Fitness Plus Gym',
    initial: 'ML',
    quote: 'Gestiono 5 sucursales desde un solo dashboard. No puedo imaginar trabajar sin RadioBiz ahora.'
  },
  {
    name: 'Sofía Ramírez',
    business: 'Carnes La Calzada',
    initial: 'SR',
    quote: 'El control remoto es lo mejor. Cambio jingles incluso desde afuera del local.'
  },
  {
    name: 'Luis Fernández',
    business: 'Radio Digital MX',
    initial: 'LF',
    quote: 'Plataforma confiable, profesional y con excelente soporte. La recomiendo totalmente.'
  },
  {
    name: 'María Sánchez',
    business: 'Comercial Retail',
    initial: 'MS',
    quote: 'Redujo nuestros costos de reproducción en 60%. Excelente inversión para el negocio.'
  }
];
