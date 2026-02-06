import { motion } from 'framer-motion';


export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
            {/* Full Background Logo Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/logo_3d.png"
                    alt=""
                    className="w-full h-full object-cover opacity-20 blur-sm scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950" />
            </div>

            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary)]/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/30 blur-[80px] rounded-full" />

            {/* Logo Animation */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 animate-splash-ping rounded-full" />
                    <div className="relative p-2 bg-gradient-to-b from-yellow-500/20 to-transparent rounded-full border border-yellow-500/30 shadow-2xl">
                        <img src="/logo_3d.png" alt="Alamgir Jewellers" className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 object-contain rounded-full shadow-[0_0_50px_rgba(234,179,8,0.3)]" />
                    </div>
                </div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white uppercase text-center px-4"
                >
                    ALAMGIR<span className="text-[var(--primary)]"> JEWELLERS</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[8px] sm:text-[10px] mt-4 text-center"
                >
                    Where Timeless Beauty Shines
                </motion.p>
            </motion.div>

            {/* Loading Bar */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
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
