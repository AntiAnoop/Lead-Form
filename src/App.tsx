/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from './supabase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, Cloud, EyeOff, CloudOff, Youtube, Instagram, Linkedin, Facebook, Play } from 'lucide-react';

// --- Error Handling ---

interface SupabaseErrorInfo {
  error: string;
  operationType: string;
  path: string | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error) errorMessage = `Database Error: ${parsed.error}`;
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main Application ---

// --- Video Card Component for Performance ---
const VideoCard = ({ id, index }: { id: string, index: number }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="flex-none w-[160px] sm:w-[220px] snap-center"
    >
      <div 
        className="aspect-[9/16] w-full bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 relative group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(165,39,20,0.15)]"
        onClick={() => !isPlaying && setIsPlaying(true)}
      >
        {!isPlaying ? (
          <div className="w-full h-full relative">
            <img 
              src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} 
              alt={`Candidate Success Story ${index + 1}`}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 group-hover:from-black/10 transition-all duration-500" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#a52714] rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 scale-150" />
                <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#a52714] shadow-2xl group-hover:bg-[#a52714] group-hover:text-white transition-all duration-500 transform group-hover:scale-110 z-10">
                  <Play size={22} fill="currentColor" className="ml-1" />
                </div>
              </div>
            </div>

            {/* Candidate Label */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-[#a52714] rounded-full" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">Success Story</span>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1`}
            title={`Zenro Candidate Placement ${index + 1}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        )}
      </div>
    </motion.div>
  );
};

const JapanProgramForm = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
      setConfigError("Supabase configuration is missing or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (configError) {
      alert(configError);
      return;
    }
    setLoading(true);
    
    try {
      // Prepare data for Supabase
      const submissionData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        education: formData.education === 'Other' ? `Other: ${formData.education_other || ''}` : formData.education,
        job_role: formData.job_role,
        willing_to_train: formData.willing_to_train,
        investment_comfort: formData.investment_comfort,
        achievement: formData.achievement,
        reason_for_japan: formData.reason_for_japan,
        state: formData.state,
        city: formData.city,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('japan_program_leads')
        .insert([submissionData]);

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw error;
      }
      
      setSubmitted(true);
    } catch (error: any) {
      console.error('Detailed Submission Error:', error);
      const msg = error.message || error.details || 'Unknown database error';
      throw new Error(JSON.stringify({ error: msg }));
    } finally {
      setLoading(false);
    }
  };

  if (configError) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-red-50 border border-red-200 rounded-xl text-center mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700">Configuration Required</h2>
        <p className="mt-2 text-red-600">{configError}</p>
        <p className="mt-4 text-sm text-gray-600">
          Go to <b>Settings</b> &gt; <b>Secrets</b> to add your Supabase keys.
        </p>
      </div>
    );
  }

  if (submitted) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[640px] mx-auto mt-12 px-4"
    >
      <div className="google-card border-t-[10px] border-indigo-700">
        <h2 className="text-3xl font-normal mb-4">Application Received!</h2>
        <p className="text-sm text-gray-700 mb-6">
          Your response has been recorded. Thank you for your interest in the Zenro Training and Placement Program for Japan.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-indigo-700 text-sm font-medium hover:underline"
        >
          Submit another response
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen py-3 sm:py-4 px-2 sm:px-4">
      <motion.form 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit} 
        className="max-w-[640px] mx-auto space-y-2 sm:space-y-3"
      >
        {/* Banner Image */}
        <div className="w-full overflow-hidden mb-2">
          <img 
            src="https://raw.githubusercontent.com/AntiAnoop/Lead-Form/main/Join%20Our%20Team%20(1).png" 
            alt="Zenro Training Program" 
            className="w-full h-auto block -my-[41%] mix-blend-multiply"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Header Card */}
        <div className="google-card border-t-[10px] border-[#a52714] !p-0 overflow-hidden">
          <div className="p-4 sm:p-8">
            <h1 className="text-[24px] sm:text-[32px] font-normal leading-tight mb-4">Thank you for your interest in our Training and Placement Program for Japan</h1>
            
            <div className="space-y-4 text-sm text-gray-800 leading-relaxed mb-6">
              <p>This is a highly selective pathway for candidates who are serious about building a career in Japan. Before moving forward, we request you to share some basic details.</p>
              
              <div className="space-y-1">
                <p className="font-bold underline">Please note</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Only candidates who clear Zenro’s 3-stage evaluation process will be enrolled.</li>
                  <li>Your information will help us understand your readiness before our team connects with you for counseling.</li>
                </ul>
              </div>

              <p>If you are committed and ready for this journey, please proceed with the form.</p>

              <p className="italic">
                <span className="font-bold not-italic">Note:</span> If you are bilingual (i.e already know Japanese language) - please fill the form anyway, you will be contacted by our team regarding placement opportunities shortly.
              </p>
            </div>

          </div>
          <div className="px-4 sm:px-8 py-3 border-t border-gray-200">
            <div className="text-sm text-red-600 font-medium">* Indicates required question</div>
          </div>
        </div>

        {/* Mandatory Training */}
        <div className="google-card">
          <label className="block text-base font-normal mb-4">
            Six months of dedicated Japanese language training is mandatory. Please confirm your willingness: <span className="text-red-600">*</span>
          </label>
          <div className="space-y-3">
            {['Yes, I am willing to undergo six months of training', 'No, I am not willing', 'I am already bilingual'].map(opt => (
              <label key={opt} className="flex items-center cursor-pointer group">
                <input 
                  type="radio" 
                  name="willing_to_train" 
                  value={opt} 
                  onChange={handleChange} 
                  required 
                  className="w-5 h-5 accent-[#a52714]" 
                />
                <span className="ml-3 text-sm text-gray-800">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="google-card">
          <label className="block text-base font-normal mb-4">Highest education qualification <span className="text-red-600">*</span></label>
          <div className="space-y-3">
            {['10th pass', '12th pass', 'ITI/Diploma', 'Undergraduate', 'Postgraduate'].map(opt => (
              <label key={opt} className="flex items-center cursor-pointer group">
                <input 
                  type="radio" 
                  name="education" 
                  value={opt} 
                  onChange={handleChange} 
                  required 
                  className="w-5 h-5 accent-[#a52714]" 
                />
                <span className="ml-3 text-sm text-gray-800">{opt}</span>
              </label>
            ))}
            <div className="flex items-center gap-2">
              <input type="radio" name="education" value="Other" onChange={handleChange} className="w-5 h-5 accent-[#a52714]" />
              <span className="text-sm text-gray-800">Other:</span>
              <input 
                type="text" 
                name="education_other" 
                placeholder="" 
                onChange={handleChange} 
                className="flex-1 border-b border-gray-300 focus:border-[#a52714] outline-none text-sm py-1" 
              />
            </div>
          </div>
        </div>

        {/* Job Roles */}
        <div className="google-card">
          <label className="block text-base font-normal mb-4">Which job role interests you most? <span className="text-red-600">*</span></label>
          <div className="space-y-3">
            {['Hospitality', 'Automobile Repair', 'Warehouse Management', 'Driving', 'Automobile Transportation', 'IT/Software'].map(opt => (
              <label key={opt} className="flex items-center cursor-pointer group">
                <input 
                  type="radio" 
                  name="job_role" 
                  value={opt} 
                  onChange={handleChange} 
                  required 
                  className="w-5 h-5 accent-[#a52714]" 
                />
                <span className="ml-3 text-sm text-gray-800">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Investment */}
        <div className="google-card">
          <label className="block text-base font-normal mb-4">
            The estimated investment is ₹2 lakhs, payable in stages. Are you comfortable with this? <span className="text-red-600">*</span>
          </label>
          <div className="space-y-3">
            {['Yes, I can arrange it', 'No, I may not be able to afford it right now'].map(opt => (
              <label key={opt} className="flex items-center cursor-pointer group">
                <input type="radio" name="investment_comfort" value={opt === 'Yes, I can arrange it' ? 'Yes' : 'No'} onChange={handleChange} required className="w-5 h-5 accent-[#a52714]" />
                <span className="ml-3 text-sm text-gray-800">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Long Text Areas */}
        <div className="google-card">
          <label className="block text-base font-normal mb-4">Describe the biggest achievement you consider so far. <span className="text-red-600">*</span></label>
          <textarea 
            name="achievement" 
            onChange={handleChange} 
            required 
            placeholder="Your answer"
            className="google-input min-h-[40px] resize-none overflow-hidden"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          ></textarea>
        </div>

        <div className="google-card">
          <label className="block text-base font-normal mb-4">Why do you want to go to Japan? <span className="text-red-600">*</span></label>
          <textarea 
            name="reason_for_japan" 
            onChange={handleChange} 
            required 
            placeholder="Your answer"
            className="google-input min-h-[40px] resize-none overflow-hidden"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          ></textarea>
        </div>

        {/* Contact Info */}
        <div className="google-card">
          <label className="block text-base font-normal mb-4">Full Name <span className="text-red-600">*</span></label>
          <input type="text" name="full_name" placeholder="Your answer" onChange={handleChange} required className="google-input" />
        </div>

        <div className="google-card">
          <label className="block text-base font-normal mb-4">Email Address <span className="text-red-600">*</span></label>
          <input type="email" name="email" placeholder="Your answer" onChange={handleChange} required className="google-input" />
        </div>

        <div className="google-card">
          <label className="block text-base font-normal mb-4">Phone Number <span className="text-red-600">*</span></label>
          <input type="tel" name="phone" placeholder="Your answer" onChange={handleChange} required className="google-input" />
        </div>

        <div className="google-card">
          <label className="block text-base font-normal mb-4">State <span className="text-red-600">*</span></label>
          <input type="text" name="state" placeholder="Your answer" onChange={handleChange} required className="google-input" />
        </div>

        <div className="google-card">
          <label className="block text-base font-normal mb-4">City <span className="text-red-600">*</span></label>
          <input type="text" name="city" placeholder="Your answer" onChange={handleChange} required className="google-input" />
        </div>

        <div className="flex items-center justify-between pt-2 pb-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#a52714] text-white px-6 py-2 rounded font-medium text-sm hover:bg-red-900 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* YouTube Shorts Section */}
        <div className="google-card !mb-12 overflow-hidden bg-gradient-to-b from-white to-[#fcfcfc] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col items-center mb-8">
            <span className="bg-[#a52714]/5 text-[#a52714] px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-3 border border-[#a52714]/10">
              Impact & Results
            </span>
            <h2 className="text-xl sm:text-2xl font-medium text-gray-900 text-center">
              75+ Candidates Already Placed in Japan
            </h2>
            <div className="h-1 w-12 bg-[#a52714] rounded-full mt-4 opacity-20" />
          </div>
          
          <div className="relative -mx-4 sm:-mx-6">
            <div 
              className="flex overflow-x-auto gap-5 px-4 sm:px-6 pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth" 
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {[
                'i5ZEc1NbBa8',
                'QL4coeotzLY',
                'klNVypEQwkQ',
                'X89-x5UR28Q',
                'lHcm8RunV4M',
                'X6WLEnSzxW8',
                'qqwMK89a94Q'
              ].map((id, index) => (
                <VideoCard key={id} id={id} index={index} />
              ))}
              {/* Spacer for end of scroll */}
              <div className="flex-none w-4" />
            </div>
            
            {/* Visual Fade indicators */}
            <div className="absolute left-0 top-0 bottom-8 w-12 bg-gradient-to-r from-white via-white/40 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-white via-white/40 to-transparent pointer-events-none z-10" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] sm:text-xs text-gray-400 font-bold tracking-[0.25em] uppercase flex items-center gap-3">
              <span className="w-6 h-[1px] bg-gray-100"></span>
              Swipe to Explore
              <span className="w-6 h-[1px] bg-gray-100"></span>
            </p>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-1 rounded-full bg-[#a52714] transition-all duration-500 ${i === 0 ? 'w-4' : 'w-1 opacity-20'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="google-card flex flex-col items-center py-6">
          <h3 className="text-[10px] sm:text-xs font-bold text-gray-500 mb-4 tracking-widest uppercase">Follow Zenro on Socials</h3>
          <div className="flex gap-6">
            <motion.a 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              href="https://www.youtube.com/@zenrojapan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
              title="YouTube"
            >
              <Youtube size={20} />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              href="https://www.instagram.com/zenro.japan/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors shadow-sm"
              title="Instagram"
            >
              <Instagram size={20} />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              href="https://www.linkedin.com/company/japan-zenro/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
              title="LinkedIn"
            >
              <Linkedin size={20} />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              href="https://www.facebook.com/profile.php?id=61563344973816&mibextid=kFxxJD" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm"
              title="Facebook"
            >
              <Facebook size={20} />
            </motion.a>
          </div>
        </div>

        {/* Office Contact Image */}
        <div className="w-full overflow-hidden mb-8">
          <img 
            src="https://raw.githubusercontent.com/AntiAnoop/Lead-Form/main/Join%20Our%20Team%20(2).png" 
            alt="Zenro Office Contacts" 
            className="w-full h-auto block -my-[27%] mix-blend-multiply"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.form>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <JapanProgramForm />
    </ErrorBoundary>
  );
}
