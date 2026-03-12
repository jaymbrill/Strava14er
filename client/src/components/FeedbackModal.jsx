export default function FeedbackModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-co-peak border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-co-blue/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-co-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Send Feedback</h2>
        </div>
        <p className="text-sm text-white/50 mb-6 ml-12">
          Ideas, bugs, or just a note — we'd love to hear from you.
        </p>

        <div className="text-center py-2">
          <a
            href="mailto:jay.m.brill@gmail.com"
            className="btn-primary inline-flex items-center gap-2 px-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            jay.m.brill@gmail.com
          </a>
          <p className="text-white/40 text-xs mt-4">Opens your email client</p>
        </div>
      </div>
    </div>
  );
}
