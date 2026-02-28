import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Truck, MapPin, Phone, CheckCircle2, FileText, Briefcase } from 'lucide-react';
import { useAuth, Role } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function ProfileSetup() {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [details, setDetails] = useState({
    phone: '',
    address: '',
    vehicleType: 'carroca',
    licensePlate: '',
    cnh: '',
    cooperative: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role) {
      navigate('/map');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    completeProfile(selectedRole, details);
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-reflow-ice dark:bg-gray-900 flex flex-col items-center justify-center p-6 transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-8 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-reflow-anthracite dark:text-white mb-2">
            Complete seu perfil
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Olá, <strong>{user.name}</strong> ({user.cpf}). Precisamos de mais algumas informações para continuar.
          </p>
        </div>

        <form onSubmit={handleComplete} className="p-8 space-y-8">
          {/* Role Selection */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              1. Como você vai usar o ReFlow?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('user')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  selectedRole === 'user' 
                    ? 'border-reflow-emerald bg-emerald-50 dark:bg-emerald-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === 'user' 
                    ? 'bg-reflow-emerald text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  <UserIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-reflow-anthracite dark:text-white mb-1">Cidadão / Empresa</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Quero descartar meus resíduos corretamente e acompanhar meu impacto.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('collector')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  selectedRole === 'collector' 
                    ? 'border-reflow-emerald bg-emerald-50 dark:bg-emerald-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  selectedRole === 'collector' 
                    ? 'bg-reflow-emerald text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-reflow-anthracite dark:text-white mb-1">Coletor / Cooperativa</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Faço a coleta de materiais e quero encontrar oportunidades próximas.
                </p>
              </button>
            </div>
          </div>

          {/* Dynamic Fields based on Role */}
          {selectedRole && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                2. Informações Adicionais
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Phone className="w-4 h-4 inline mr-2 text-gray-400" />
                    Telefone / WhatsApp
                  </label>
                  <input 
                    type="tel" 
                    required
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-reflow-emerald"
                  />
                </div>

                {selectedRole === 'user' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <MapPin className="w-4 h-4 inline mr-2 text-gray-400" />
                      Endereço Principal
                    </label>
                    <input 
                      type="text" 
                      required
                      value={details.address}
                      onChange={(e) => setDetails({ ...details, address: e.target.value })}
                      placeholder="Rua, Número, Bairro, Cidade"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-reflow-emerald"
                    />
                  </div>
                )}

                {selectedRole === 'collector' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Truck className="w-4 h-4 inline mr-2 text-gray-400" />
                        Tipo de Veículo
                      </label>
                      <select 
                        value={details.vehicleType}
                        onChange={(e) => setDetails({ ...details, vehicleType: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-reflow-emerald"
                      >
                        <option value="carroca">Carroça / Manual</option>
                        <option value="fiorino">Fiorino / Van</option>
                        <option value="caminhao">Caminhão Leve</option>
                      </select>
                    </div>

                    {details.vehicleType !== 'carroca' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <FileText className="w-4 h-4 inline mr-2 text-gray-400" />
                            Placa
                          </label>
                          <input 
                            type="text" 
                            required
                            value={details.licensePlate}
                            onChange={(e) => setDetails({ ...details, licensePlate: e.target.value })}
                            placeholder="ABC-1234"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-reflow-emerald uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <FileText className="w-4 h-4 inline mr-2 text-gray-400" />
                            CNH
                          </label>
                          <input 
                            type="text" 
                            required
                            value={details.cnh}
                            onChange={(e) => setDetails({ ...details, cnh: e.target.value })}
                            placeholder="Número da CNH"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-reflow-emerald"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Briefcase className="w-4 h-4 inline mr-2 text-gray-400" />
                        Cooperativa (Opcional)
                      </label>
                      <input 
                        type="text" 
                        value={details.cooperative}
                        onChange={(e) => setDetails({ ...details, cooperative: e.target.value })}
                        placeholder="Nome da cooperativa associada"
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-reflow-emerald"
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!selectedRole}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-colors ${
              selectedRole 
                ? 'bg-reflow-emerald hover:bg-emerald-700 text-white shadow-lg' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            Concluir Cadastro
          </button>
        </form>
      </motion.div>
    </div>
  );
}
