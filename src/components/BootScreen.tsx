import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGS = [
  "[system] Initializing Docker containers...",
  "[docker] Starting reflow-db (PostgreSQL 15 + PostGIS)...",
  "[docker] Starting reflow-backend (Spring Boot 3.2)...",
  "[docker] Starting reflow-frontend (Vite + React)...",
  "[spring] Booting Spring Boot application...",
  "[spring] Connecting to database (jdbc:postgresql://reflow-db:5432/reflow)...",
  "[spring] Hibernate Spatial dialect initialized.",
  "[spring] Establishing WebSocket connections (STOMP)...",
  "[spring] Started ReFlowApplication in 2.45 seconds (process running for 3.12)",
  "[system] All services ready. Port 8080 (API) and 3000 (UI) active."
];

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < LOGS.length) {
        setVisibleLogs(prev => [...prev, LOGS[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(onComplete, 500); // Wait for fade out
        }, 800);
      }
    }, 300); // Speed of logs appearing

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99999] bg-black flex flex-col p-6 font-mono text-sm sm:text-base overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-6 text-gray-500">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2">reflow-terminal ~ bash</span>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col justify-end">
            {visibleLogs.map((log, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-1"
              >
                <span className="text-emerald-500">root@reflow-server</span>
                <span className="text-gray-400">:</span>
                <span className="text-blue-400">~/app</span>
                <span className="text-gray-400">$ </span>
                <span className={log.includes('[spring]') ? 'text-yellow-300' : log.includes('[docker]') ? 'text-blue-300' : 'text-gray-300'}>
                  {log}
                </span>
              </motion.div>
            ))}
            <motion.div 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-gray-300 mt-1"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
