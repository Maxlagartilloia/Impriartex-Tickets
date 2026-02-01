import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Puede ser email o código (CLI-001)
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // LÓGICA DE CÓDIGO A EMAIL: 
    // Si no tiene '@', asumimos que es un código y le pegamos el dominio de Impriartex
    const finalEmail = identifier.includes('@') 
      ? identifier 
      : `${identifier.toLowerCase().trim()}@impriartex.com`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      });

      if (error) throw error;

      toast({
        title: "¡ACCESO CONCEDIDO!",
        description: "Bienvenido al ecosistema tecnológico de Impriartex.",
        variant: "success",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "ERROR DE AUTENTICACIÓN",
        description: "Credenciales inválidas. Verifica tu código o contraseña.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0056b3]/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#facc15]/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.2rem] bg-[#0056b3] mb-6 shadow-2xl shadow-blue-500/40 rotate-3">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-800 leading-none">
            IMPRIARTEX <br/>
            <span className="text-[#0056b3] text-2xl tracking-[0.25em] italic">SOPORTE</span>
          </h1>
          <p className="text-slate-400 mt-4 font-black text-[10px] uppercase tracking-[0.3em]">Sistema de Gestión Operativa</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,86,179,0.1)] border border-slate-50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Usuario o Código</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0056b3] transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 pl-14 pr-4 text-slate-700 font-black focus:bg-white focus:border-[#0056b3] outline-none transition-all placeholder:text-slate-300 text-sm uppercase"
                  placeholder="EJ: CLI-001 O EMAIL"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0056b3] transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 pl-14 pr-4 text-slate-700 font-black focus:bg-white focus:border-[#0056b3] outline-none transition-all placeholder:text-slate-300 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0056b3] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-500/30 hover:bg-[#004494] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Acceder al Panel"
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="w-12 h-1 bg-[#facc15] rounded-full"></div>
          <p className="text-[9px] uppercase tracking-[0.6em] text-slate-300 font-black">
            CL TECH SOLUTIONS • ECUADOR
          </p>
        </div>
      </div>
    </div>
  );
}
