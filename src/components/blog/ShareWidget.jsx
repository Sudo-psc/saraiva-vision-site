import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';

const ShareWidget = ({ title, url }) => {
  const [copied, setCopied] = React.useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-50 hover:text-cyan-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: 'hover:bg-sky-50 hover:text-sky-600'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-50 hover:text-cyan-700'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="sticky top-[600px] bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg">
          <Share2 className="w-4 h-4 text-cyan-600" />
        </div>
        <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-700 to-blue-500 bg-clip-text text-transparent">
          Compartilhar
        </h3>
      </div>

      <div className="space-y-2">
        {shareLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-lg border border-slate-100 transition-all ${link.color}`}
              aria-label={`Compartilhar no ${link.name}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{link.name}</span>
            </a>
          );
        })}

        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-blue-50 hover:text-cyan-600 transition-all"
          aria-label="Copiar link do artigo"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Link copiado!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Copiar link</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ShareWidget;
