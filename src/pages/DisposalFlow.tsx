import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, CheckCircle, ArrowRight, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  { id: 'Plástico', name: 'Plástico', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
  { id: 'Metal', name: 'Metal', color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
  { id: 'Vidro', name: 'Vidro', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
  { id: 'Papel', name: 'Papel', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
  { id: 'Eletrônico', name: 'Eletrônico', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
];

export default function DisposalFlow() {
  const navigate = useNavigate();
  const { addMaterial } = useData();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera when component mounts
  useEffect(() => {
    if (step === 1 && !photo) {
      startCamera();
    }
    return () => stopCamera();
  }, [step, photo]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setPhoto(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const handleNextStep = () => {
    if (step === 2) {
      // Get location before moving to step 3
      setIsLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            setIsLocating(false);
            setStep(3);
          },
          (error) => {
            console.error("Error getting location", error);
            alert("Ative a localização para continuar.");
            setIsLocating(false);
          }
        );
      } else {
        setIsLocating(false);
        setStep(3); // Proceed anyway for demo
      }
    } else if (step === 3) {
      // Final step: Save material to context
      if (category && location) {
        addMaterial({
          type: category,
          weight: 'A definir', // Would normally be estimated or inputted
          pos: [location.lat, location.lng],
          generatorId: user?.id
        });
      } else if (category) {
        // Fallback location if GPS failed
        addMaterial({
          type: category,
          weight: 'A definir',
          pos: [-23.5505, -46.6333], // Default SP
          generatorId: user?.id
        });
      }
      setStep(4);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step >= i ? 'bg-reflow-emerald text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}>
            {i}
          </div>
          {i < 4 && (
            <div className={`w-8 h-1 transition-colors ${
              step > i ? 'bg-reflow-emerald' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative transition-colors">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 transition-colors">
        <h1 className="text-xl font-bold text-reflow-anthracite dark:text-white">Novo Descarte</h1>
        <button onClick={() => navigate('/map')} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        {renderStepIndicator()}

        <AnimatePresence mode="wait">
          {/* Step 1: Camera */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-bold text-reflow-anthracite dark:text-white mb-2">Foto do Resíduo</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Tire uma foto clara do material que deseja descartar.</p>
              
              <div className="flex-1 relative bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                {!photo ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-white/20 m-4 rounded-xl pointer-events-none" />
                  </>
                ) : (
                  <img src={photo} alt="Resíduo" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="mt-6 flex justify-center gap-4">
                {!photo ? (
                  <button 
                    onClick={takePhoto}
                    className="w-16 h-16 rounded-full bg-reflow-emerald border-4 border-white dark:border-gray-900 shadow-[0_0_0_2px_rgba(45,106,79,1)] flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={retakePhoto}
                      className="px-6 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Tirar Outra
                    </button>
                    <button 
                      onClick={handleNextStep}
                      className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-reflow-emerald hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      Continuar <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-bold text-reflow-anthracite dark:text-white mb-2">Qual o material?</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Selecione a categoria predominante do seu descarte.</p>

              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      category === cat.id 
                        ? 'border-reflow-emerald bg-emerald-50 dark:bg-emerald-900/20 shadow-md' 
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${cat.color} border`}>
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-reflow-anthracite dark:text-white block">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <button 
                  onClick={handleNextStep}
                  disabled={!category || isLocating}
                  className="w-full py-4 rounded-xl font-bold text-white bg-reflow-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isLocating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Obtendo localização...</>
                  ) : (
                    <>Confirmar Categoria <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Location Confirmation */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-bold text-reflow-anthracite dark:text-white mb-2">Confirmar Local</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">O coletor irá até este endereço.</p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-6 flex items-start gap-4 transition-colors">
                <div className="w-12 h-12 rounded-full bg-reflow-alert/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-bold text-reflow-anthracite dark:text-white">Localização Atual</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {location ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : 'Rua Exemplo, 123 - Centro'}
                  </p>
                  <p className="text-xs text-reflow-emerald dark:text-emerald-400 mt-2 font-medium">Precisão GPS: Alta</p>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                {photo && (
                  <img src={photo} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
                )}
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex flex-col justify-center transition-colors">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Material</span>
                  <span className="font-semibold text-reflow-anthracite dark:text-white text-lg">
                    {CATEGORIES.find(c => c.id === category)?.name}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button 
                  onClick={handleNextStep}
                  className="w-full py-4 rounded-xl font-bold text-white bg-reflow-emerald hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  Solicitar Coleta <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success / Status */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-reflow-emerald dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-reflow-anthracite dark:text-white mb-2">Coleta Solicitada!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xs">
                Um coletor próximo foi notificado e está a caminho do seu endereço.
              </p>

              {/* Uber-style status bar */}
              <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-1/3 h-1 bg-reflow-emerald animate-pulse" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-reflow-emerald text-white flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-reflow-emerald dark:text-emerald-400">Solicitado</span>
                  </div>
                  
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-2" />
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-reflow-alert text-reflow-alert flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-reflow-alert animate-ping" />
                    </div>
                    <span className="text-xs font-bold text-reflow-anthracite dark:text-white">A Caminho</span>
                  </div>
                  
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-2" />
                  
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Realizada</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/map')}
                className="mt-12 w-full py-4 rounded-xl font-bold text-reflow-emerald dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                Voltar ao Mapa
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
