import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, ShieldCheck, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Login() {
  const { user, loginWithGovBr } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (!user.role) {
        navigate('/setup');
      } else {
        navigate('/map');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-reflow-ice dark:bg-gray-900 flex flex-col items-center justify-center p-6 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-8 text-center bg-gradient-to-br from-reflow-emerald to-emerald-800 text-white relative overflow-hidden">
          <Leaf className="absolute -right-10 -bottom-10 w-48 h-48 text-white opacity-10 pointer-events-none" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
            <Recycle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 relative z-10">ReFlow</h1>
          <p className="text-emerald-100 text-sm relative z-10">Conectando quem descarta com quem coleta.</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-reflow-anthracite dark:text-white mb-6 text-center">
            Acesse sua conta
          </h2>

          <button
            onClick={loginWithGovBr}
            className="w-full flex items-center justify-center gap-3 bg-[#1351B4] hover:bg-[#0C326F] text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md"
          >
            <img 
              src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png" 
              alt="gov.br" 
              className="h-6 object-contain brightness-0 invert"
            />
            Entrar com gov.br
          </button>

          <div className="mt-6 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-300">
              O login via <strong>gov.br</strong> garante a segurança e a veracidade das informações para todos os usuários da plataforma ReFlow.
            </p>
          </div>
        </div>
      </motion.div>

      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} ReFlow. Todos os direitos reservados.
      </p>
    </div>
  );
}
