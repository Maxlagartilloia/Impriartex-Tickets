import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  LogIn, Mail, Lock, Eye, EyeOff, 
  ShieldCheck, Loader2, Globe 
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el "ojito"
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Limpiamos el email para que siempre sea minúsculas al enviar
    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      toast({
        title: 'Error de Acceso',
        description: 'Credenciales inválidas o cuenta no autorizada.',
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Bienvenido a Impriartex',
        description: 'Acceso verificado correctamente.',
        variant: 'success',
      });
      // El sistema redirigirá automáticamente vía AuthProvider
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo Decorativo Enterprise */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <Globe size={800} className="absolute -top-40 -left-40 text-[#0056b3]" />
      </div>

      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#0056b3] rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/30">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
            Impriartex <span className="text-[#0056b3]">SaaS</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
            Enterprise Asset Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Input Email - Forzado a minúsculas */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Correo Institucional
            </label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0056b3] transition-colors" size={20} />
              <input
                type="email"
                required
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#0056b3] focus:bg-white outline-none font-bold text-xs transition-all lowercase"
                placeholder="ejemplo@impriartex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())} // Fuerza minúsculas mientras escribes
              />
            </div>
          </div>

          {/* Input Password - Con "Ojito" */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Contraseña de Acceso
            </label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0056b3] transition-colors" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-14 pr-14 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#0056b3] focus:bg-white outline-none font-bold text-xs transition-all"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0056b3] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0056b3] text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-500/40 hover:bg-[#004494] hover:-translate-y-1 active:scale-95 transition-all mt-4 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} /> Autenticar Acceso
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            Conexión Segura vía SSL/TLS v1.3
          </p>
        </div>
      </div>
    </div>
  );
}
