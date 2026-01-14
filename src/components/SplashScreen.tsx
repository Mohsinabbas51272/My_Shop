import { motion } from 'framer-motion';
import { Store } from 'lucide-react';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/30 blur-[80px] rounded-full" />

            {/* Logo Animation */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-splash-ping rounded-full" />
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl relative">
                        <Store className="w-20 h-20 text-blue-500" />
                    </div>
                </div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-4xl font-black tracking-tighter text-white flex items-center gap-1"
                >
                    MY<span className="text-blue-500">SHOP</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4"
                >
                    Premium Ecommerce Experience
                </motion.p>
            </motion.div>

            {/* Loading Bar */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="w-full h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="absolute bottom-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest"
            >
                Initializing Secure Protocol
            </motion.div>
        </div>
    );
}
