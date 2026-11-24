import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Building2, 
  MapPin, 
  AlertCircle, 
  ArrowRight,
  UserCheck,
  Award,
  Zap
} from 'lucide-react';
import { internshipsAPI } from '../services/api';
import OfficialApplicationModal from './OfficialApplicationModal';

export default function PortfolioAnalyzerWidget({ onAnalysisComplete }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [extractedProfile, setExtractedProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setError('');
    setAnalyzing(true);
    setAnalysisStep('Scanning document & extracting candidate credentials...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setTimeout(() => setAnalysisStep('Evaluating 6-dimension PM Scheme compatibility matrix...'), 600);
      setTimeout(() => setAnalysisStep('Matching against 30 national enterprise vacancies...'), 1200);

      const res = await internshipsAPI.analyzePortfolio(formData);
      
      setExtractedProfile(res.data.extracted_profile);
      setMatches(res.data.matches || []);
      if (onAnalysisComplete) {
        onAnalysisComplete(res.data);
      }
    } catch (err) {
      console.error("Portfolio analysis failed:", err);
      setError(err.response?.data?.detail || "Could not analyze the uploaded portfolio file.");
    } finally {
      setAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleLoadSample = async () => {
    setError('');
    setAnalyzing(true);
    setAnalysisStep('Loading Vanshil Gupta Sample Portfolio PDF...');

    try {
      const response = await fetch('/Sample_Student_Portfolio_Vanshil_Gupta.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'Sample_Student_Portfolio_Vanshil_Gupta.pdf', { type: 'application/pdf' });
      await handleFileUpload(file);
    } catch (err) {
      console.error("Failed to load sample portfolio:", err);
      setError("Failed to load sample portfolio PDF.");
      setAnalyzing(false);
    }
  };

  const handleOpenApplyModal = (internship) => {
    setSelectedInternship(internship);
    setIsModalOpen(true);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden border border-white/20">
      
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#6366F1]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#00D4FF]/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-0.5 rounded-full border border-[#00D4FF]/25 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-[#00D4FF]" />
              <span>AI Portfolio Matching Engine</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              Instant Portal Redirection
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
            Analyze Portfolio & Match Real PM Internships.
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-2xl">
            Upload your resume/portfolio PDF. The system parses your verified technical competencies, computes multi-criteria clearinghouse match scores, and provides direct links to apply on official portals.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          disabled={analyzing}
          className="btn-glass-secondary px-4 py-2.5 rounded-full text-xs font-bold shrink-0 flex items-center space-x-2 border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10"
        >
          <Zap className="w-4 h-4 text-[#00D4FF]" />
          <span>Test with Vanshil Gupta Portfolio</span>
        </button>
      </div>

      {/* Upload Box */}
      <div className="relative z-10">
        <div className="border-2 border-dashed border-white/20 hover:border-[#00D4FF]/50 transition-colors rounded-2xl p-6 sm:p-8 text-center bg-black/30 backdrop-blur-sm">
          <input
            type="file"
            id="portfolio-upload"
            accept=".pdf,.docx,.doc"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            disabled={analyzing}
            className="hidden"
          />
          <label
            htmlFor="portfolio-upload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366F1]/20 to-[#00D4FF]/20 border border-white/20 flex items-center justify-center text-[#00D4FF]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#F8FAFC]">
                Click to upload portfolio PDF
              </span>
              <span className="text-xs text-[#94A3B8] block mt-0.5">
                Supports PDF or Word format (up to 10MB)
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analyzing Progress */}
      {analyzing && (
        <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center space-y-3 animate-in fade-in">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00D4FF] animate-spin mx-auto"></div>
          <div className="text-xs font-semibold text-[#00D4FF]">{analysisStep}</div>
          <div className="w-48 bg-white/10 rounded-full h-1.5 mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-[#6366F1] to-[#00D4FF] h-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {extractedProfile && !analyzing && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-300">
          
          {/* Extracted Profile Summary Card */}
          <div className="p-5 rounded-2xl bg-black/50 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-[#00D4FF]" />
                <span className="text-sm font-black text-[#F8FAFC]">
                  {extractedProfile.candidate_name || "Vanshil Gupta"}
                </span>
                <span className="text-[10px] text-[#94A3B8] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {extractedProfile.registration_number || "PMIS-2026-8842"}
                </span>
              </div>
              <div className="text-xs text-[#94A3B8] flex flex-wrap gap-x-4 gap-y-1">
                <span>Degree: <strong className="text-[#F8FAFC]">{extractedProfile.degree}</strong></span>
                <span>CGPA: <strong className="text-emerald-400">{extractedProfile.cgpa_percentage} / 10.0</strong></span>
                <span>Experience: <strong className="text-[#F8FAFC]">{extractedProfile.experience_months} Months</strong></span>
                <span>Projects: <strong className="text-[#F8FAFC]">{extractedProfile.projects_count} Verified</strong></span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Matched PM Vacancies</div>
              <div className="text-2xl font-black text-[#00D4FF]">
                {matches.filter(m => m.eligible).length} <span className="text-xs text-[#94A3B8] font-normal">Found</span>
              </div>
            </div>
          </div>

          {/* Extracted Skills Chips */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Extracted Technical Competencies ({extractedProfile.skills?.length || 0})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {extractedProfile.skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#6366F1]/15 text-[#C084FC] border border-[#6366F1]/30"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Top Matched Opportunities List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Recommended Real PM Internships (Ranked by Compatibility)</span>
              </h3>
              <span className="text-xs text-[#94A3B8]">
                Click "Apply on Portal" to open official application link
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {matches.slice(0, 6).map((item, idx) => (
                <div
                  key={item.internship_id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#00D4FF]/40 transition-all space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#00D4FF]">#{idx + 1}</span>
                        <h4 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#00D4FF] transition-colors">
                          {item.internship_title}
                        </h4>
                      </div>
                      <div className="text-xs text-[#94A3B8] flex items-center space-x-2">
                        <span className="font-semibold text-slate-300">{item.company_name}</span>
                        <span>•</span>
                        <span>{item.sector}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.is_remote ? 'Remote' : item.location}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                        ₹{item.stipend_amount?.toLocaleString('en-IN')}/mo
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-[#00D4FF]" />
                        <span>{Math.round(item.total_score)}% Match</span>
                      </span>
                    </div>
                  </div>

                  {/* Explainable Match Reason */}
                  <p className="text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 leading-relaxed">
                    💡 <strong className="text-[#00D4FF]">Why You Match:</strong> {item.match_reason}
                  </p>

                  {/* Matched Skills & Direct CTAs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-[#94A3B8] uppercase font-semibold mr-1">Matched:</span>
                      {item.skills_matched?.map((s, sIdx) => (
                        <span key={sIdx} className="text-[10px] font-medium bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                          {s}
                        </span>
                      ))}
                      {item.skills_missing?.length > 0 && (
                        <span className="text-[10px] text-amber-400/90 ml-1">
                          (Gap: {item.skills_missing.slice(0, 2).join(', ')})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleOpenApplyModal(item)}
                        className="btn-glass-secondary px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300"
                      >
                        Details & Assistant
                      </button>

                      <a
                        href={item.apply_url || "https://pminternship.mca.gov.in/"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary-gradient px-4 py-1.5 rounded-full text-xs font-bold text-white flex items-center space-x-1.5 shadow-md shadow-[#6366F1]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <span>Apply on Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official Application Modal */}
      <OfficialApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        internship={selectedInternship}
        onAppliedSuccess={(id) => {
          console.log("Internship applied:", id);
        }}
      />
    </div>
  );
}
