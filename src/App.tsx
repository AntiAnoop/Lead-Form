/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from './supabase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, Cloud, EyeOff, CloudOff } from 'lucide-react';

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
        <div className="w-full h-[120px] sm:h-[180px] bg-[#a52714] rounded-lg overflow-hidden mb-2 relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-red-900/20 shadow-xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#bc002d] rounded-full"></div>
            </div>
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-red-900/20 shadow-xl relative">
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 bg-[#ff9933]"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-[#138808]"></div>
              </div>
              <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-[#000080] rounded-full relative z-10"></div>
            </div>
          </div>
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

            {/* Account Info Section */}
            <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">anoopnatraj703@gmail.com</span>
                  <button type="button" className="text-blue-600 hover:underline">Switch accounts</button>
                </div>
                <Cloud className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <EyeOff className="w-3 h-3" />
                <span>Not shared</span>
              </div>
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
        <div className="google-card !mb-12">
          <label className="block text-base font-normal mb-4 uppercase text-[10px] sm:text-xs font-bold text-gray-500 tracking-wider text-center">75+ Candidates Already Placed in Japan</label>
          <div className="grid grid-cols-2 gap-2 sm:gap-6">
            <div className="aspect-[9/16] w-full bg-black rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/i5ZEc1NbBa8"
                title="Zenro Japan Program Insight 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="aspect-[9/16] w-full bg-black rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/QL4coeotzLY"
                title="Zenro Japan Program Insight 2"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <p className="mt-4 text-[10px] sm:text-xs text-gray-500 italic">
            Watch these brief insights into our training and placement process in Japan.
          </p>
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
