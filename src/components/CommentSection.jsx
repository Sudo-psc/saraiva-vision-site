import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CommentSection = ({ postSlug }) => {
  const { t } = useTranslation();
  const storageKey = `comments-${postSlug}`;
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setComments(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, [storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const newComments = [
      ...comments,
      { id: Date.now(), name: name.trim(), message: message.trim() }
    ];
    setComments(newComments);
    localStorage.setItem(storageKey, JSON.stringify(newComments));
    setName('');
    setMessage('');
  };

  return (
    <section className="mt-12" aria-labelledby="comments-title">
      <h2 id="comments-title" className="text-2xl font-bold mb-4">
        {t('comments.title')}
      </h2>
      {comments.length === 0 ? (
        <p className="text-gray-500 mb-4">{t('comments.no_comments')}</p>
      ) : (
        <ul className="space-y-4 mb-8">
          {comments.map((c) => (
            <li key={c.id} className="border p-4 rounded">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-2">{c.message}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="comment-name"
            className="block text-sm font-medium text-gray-700"
          >
            {t('comments.name_label')}
          </label>
          <input
            id="comment-name"
            type="text"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="comment-message"
            className="block text-sm font-medium text-gray-700"
          >
            {t('comments.message_label')}
          </label>
          <textarea
            id="comment-message"
            className="mt-1 block w-full border rounded px-3 py-2"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {t('comments.submit')}
        </button>
      </form>
    </section>
  );
};

export default CommentSection;
