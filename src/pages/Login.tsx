import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "¡BIENVENIDO!",
        description: "Acceso concedido al sistema Impriartex.",
        variant: "success", // Usamos el color de éxito
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "ERROR DE ACCESO",
        description: "Revisa tus credenciales e intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Decoración de fondo corporativa */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0056b3]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#facc15]/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-[#0056b3]/10 mb-6 border-2 border-[#0056b3]/20 shadow-xl shadow-blue-500/10">
            <ShieldCheck className="w-10 h-10 text-[#0056b3]" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-800 leading-none">
            IMPRIARTEX <br/>
            <span className="text-[#0056b3] text-2xl tracking-[0.2em]">SOPORTE</span>
          </h1>
          <p className="text-slate-400 mt-4 font-bold text-xs uppercase tracking-widest">Gestión de Servicios Técnicos</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056b3]" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:bg-white focus:border-[#0056b3] outline-none transition-all placeholder:text-slate-300"
                  placeholder="usuario@impriartex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña de Acceso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056b3]" />
                <input
                  type="password"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:bg-white focus:border-[#0056b3] outline-none transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0056b3] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "INGRESAR AL SISTEMA"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-12 text-[10px] uppercase tracking-[0.5em] text-slate-300 font-black">
          © 2026 CL TECH SOLUTIONS
        </p>
      </div>
    </div>
  );
}
