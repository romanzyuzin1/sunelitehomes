import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Lock } from 'lucide-react';
import { useState } from 'react';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    name: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    name: false,
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      email: '',
      name: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, ingrese un correo electrónico válido';
    }

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.name) {
      // Handle form submission
      console.log('Form submitted:', formData);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
      setTouched({
        email: false,
        name: false,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    if (touched[name as keyof typeof touched]) {
      if (name === 'email') {
        if (!value.trim()) {
          setErrors(prev => ({ ...prev, email: 'El correo electrónico es requerido' }));
        } else if (!validateEmail(value)) {
          setErrors(prev => ({ ...prev, email: 'Por favor, ingrese un correo electrónico válido' }));
        } else {
          setErrors(prev => ({ ...prev, email: '' }));
        }
      }

      if (name === 'name') {
        if (!value.trim()) {
          setErrors(prev => ({ ...prev, name: 'El nombre es requerido' }));
        } else {
          setErrors(prev => ({ ...prev, name: '' }));
        }
      }
    }
  };

  const handleBlur = (field: 'email' | 'name') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      if (!formData.email.trim()) {
        setErrors(prev => ({ ...prev, email: 'El correo electrónico es requerido' }));
      } else if (!validateEmail(formData.email)) {
        setErrors(prev => ({ ...prev, email: 'Por favor, ingrese un correo electrónico válido' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }

    if (field === 'name') {
      if (!formData.name.trim()) {
        setErrors(prev => ({ ...prev, name: 'El nombre es requerido' }));
      } else {
        setErrors(prev => ({ ...prev, name: '' }));
      }
    }
  };

  return (
    <section className="py-32 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="mb-8">Información de Contacto</h3>
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start gap-4 group cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 bg-black group-hover:bg-[var(--gold)] transition-colors duration-300 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Email</p>
                    <p>info@sunelitehomes.com</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-4 group cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 bg-black group-hover:bg-[var(--gold)] transition-colors duration-300 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Teléfono</p>
                    <p>+34 650 717 943</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-4 group cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 bg-black group-hover:bg-[var(--gold)] transition-colors duration-300 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Oficina</p>
                    <p>Avenida Riera de Cassoles 43-45, Barcelona</p>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="bg-black text-white p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--gold)] opacity-10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700" />
              <Lock className="w-10 h-10 mb-4 text-[var(--gold)] relative z-10" />
              <h4 className="mb-3 relative z-10">Confidencialidad Garantizada</h4>
              <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                Su información está protegida con los más altos estándares de seguridad y privacidad. 
                Sus datos serán tratados con máxima discreción.
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="bg-white p-10 shadow-lg">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block mb-3 text-sm tracking-wide">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-4 py-3 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } focus:border-[var(--gold)] focus:outline-none transition-colors bg-zinc-50`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-2">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block mb-3 text-sm tracking-wide">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className={`w-full px-4 py-3 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:border-[var(--gold)] focus:outline-none transition-colors bg-zinc-50`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-2">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="phone" className="block mb-3 text-sm tracking-wide">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--gold)] focus:outline-none transition-colors bg-zinc-50"
                  />
                </div>
                <div>
                  <label htmlFor="service" className="block mb-3 text-sm tracking-wide">
                    Servicio de Interés *
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--gold)] focus:outline-none transition-colors bg-zinc-50"
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="adquisicion">Adquisición</option>
                    <option value="desinversion">Desinversión</option>
                    <option value="valoracion">Valoración Patrimonial</option>
                    <option value="renovacion">Proyecto de Renovación</option>
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="message" className="block mb-3 text-sm tracking-wide">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-[var(--gold)] focus:outline-none transition-colors resize-none bg-zinc-50"
                  placeholder="Comparta los detalles de su consulta..."
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full bg-black text-white px-10 py-4 overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <span className="relative z-10">Enviar Consulta Confidencial</span>
                <motion.div 
                  className="absolute inset-0 bg-[var(--gold)]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  Enviar Consulta Confidencial
                </span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}