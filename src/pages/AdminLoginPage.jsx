import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const AdminLoginPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [credentials, setCredentials] = useState({
		username: '',
		password: ''
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setCredentials(prev => ({
			...prev,
			[name]: value
		}));
		// Clear error when user starts typing
		if (error) setError(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);


		try {
			// Redirect to WordPress admin panel (configurable)
			const wordpressAdminUrl = import.meta.env.VITE_WORDPRESS_ADMIN_URL || `${window.location.origin}/wp-admin`;

			// Open WordPress admin in new tab securely
			window.open(wordpressAdminUrl, '_blank', 'noopener,noreferrer');

			// Show success message and redirect to blog
			setTimeout(() => {
				navigate('/blog');
			}, 1000);

		} catch (err) {
			setError(t('admin.loginError'));
		} finally {
			setLoading(false);
		}
	};

	const redirectToWordPressAdmin = () => {
		const wordpressAdminUrl = import.meta.env.VITE_WORDPRESS_ADMIN_URL || `${window.location.origin}/wp-admin`;
		window.open(wordpressAdminUrl, '_blank', 'noopener,noreferrer');
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Helmet>
				<title>{t('admin.pageTitle')} | Saraiva Vision</title>
				<meta name="description" content={t('admin.pageDescription')} />
				<meta name="robots" content="noindex, nofollow" />
			</Helmet>

			<Navbar />

			<main className="pt-20 pb-16 mx-[4%] md:mx-[6%] lg:mx-[8%]">
				<div className="container mx-auto px-4">
					<div className="max-w-md mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="bg-white rounded-lg shadow-lg p-8"
						>
							{/* Header */}
							<div className="text-center mb-8">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
									<Lock className="w-8 h-8 text-blue-600" />
								</div>
								<h1 className="text-2xl font-bold text-gray-900 mb-2">
									{t('admin.title')}
								</h1>
								<p className="text-gray-600">
									{t('admin.subtitle')}
								</p>
							</div>

							{/* Environment Info & Direct Access */}
							<div className="mb-6 space-y-4">
								{/* Development Environment Notice */}
								{import.meta.env.DEV && (
									<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
										<h3 className="text-sm font-semibold text-yellow-800 mb-2">
											🔧 Ambiente de Desenvolvimento
										</h3>
										<p className="text-yellow-700 text-sm mb-2">
											Você está usando o servidor mock do WordPress. Este ambiente é apenas para desenvolvimento e testes.
										</p>
										<div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded mt-2">
											<p><strong>Mock Server:</strong> http://localhost:8081</p>
											<p><strong>Status:</strong> {import.meta.env.VITE_WORDPRESS_API_URL ? '✅ Configurado' : '❌ Não configurado'}</p>
										</div>
									</div>
								)}

								{/* Direct Access to WordPress */}
								<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<h3 className="text-sm font-semibold text-blue-800 mb-2">
										{import.meta.env.DEV ? '🚀 Ferramentas de Desenvolvimento' : '🚀 Acesso ao WordPress'}
									</h3>
									<p className="text-blue-700 text-sm mb-3">
										{import.meta.env.DEV 
											? 'Acesse diretamente os recursos de desenvolvimento do blog médico:'
											: 'Clique no botão abaixo para acessar o painel administrativo do WordPress:'
										}
									</p>
									
									{import.meta.env.DEV ? (
										<div className="space-y-2">
											<Button
												onClick={redirectToWordPressAdmin}
												className="w-full bg-blue-600 hover:bg-blue-700"
											>
												<LogIn className="w-4 h-4 mr-2" />
												Acessar WordPress Admin (Mock)
											</Button>
											<Button
												onClick={() => {
													const apiUrl = import.meta.env.VITE_WORDPRESS_API_URL || 'http://localhost:8081/wp-json/wp/v2';
													window.open(`${apiUrl}/posts`, '_blank');
												}}
												variant="outline"
												className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
											>
												<ExternalLink className="w-4 h-4 mr-2" />
												Ver API de Posts (JSON)
											</Button>
											<Button
												onClick={() => navigate('/blog')}
												variant="outline"
												className="w-full border-green-300 text-green-700 hover:bg-green-50"
											>
												<Eye className="w-4 h-4 mr-2" />
												Visualizar Blog Público
											</Button>
										</div>
									) : (
										<Button
											onClick={redirectToWordPressAdmin}
											className="w-full bg-blue-600 hover:bg-blue-700"
										>
											<LogIn className="w-4 h-4 mr-2" />
											Acessar WordPress Admin
										</Button>
									)}</div>
							</div>

							{/* Login Form */}
							<form onSubmit={handleSubmit} className="space-y-6">
								{error && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
									>
										<AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
										<span className="text-sm">{error}</span>
									</motion.div>
								)}

								{/* Username Field */}
								<div>
									<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
										{t('admin.username')}
									</label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
										<input
											type="text"
											id="username"
											name="username"
											value={credentials.username}
											onChange={handleInputChange}
											className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder={t('admin.usernamePlaceholder')}
											required
										/>
									</div>
								</div>

								{/* Password Field */}
								<div>
									<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
										{t('admin.password')}
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
										<input
											type={showPassword ? 'text' : 'password'}
											id="password"
											name="password"
											value={credentials.password}
											onChange={handleInputChange}
											className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder={t('admin.passwordPlaceholder')}
											required
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
										>
											{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
								</div>

								{/* Submit Button */}
								<Button
									type="submit"
									disabled={loading}
									className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
								>
									{loading ? (
										<>
											<motion.div
												animate={{ rotate: 360 }}
												transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
												className="w-4 h-4 mr-2"
											>
												<LogIn className="w-4 h-4" />
											</motion.div>
											{t('admin.loggingIn')}
										</>
									) : (
										<>
											<LogIn className="w-4 h-4 mr-2" />
											{t('admin.login')}
										</>
									)}
								</Button>
							</form>

							{/* Info Section */}
							<div className="mt-8 pt-6 border-t border-gray-200">
								<div className="text-center text-sm text-gray-600">
									{import.meta.env.DEV ? (
										<>
											<p className="mb-2">
												🔧 <strong>Informações de Desenvolvimento:</strong>
											</p>
											<div className="bg-gray-50 p-3 rounded text-left space-y-2">
												<p><strong>Mock Server:</strong> {import.meta.env.VITE_WORDPRESS_ADMIN_URL || 'http://localhost:8081/wp-admin'}</p>
												<p><strong>API Endpoint:</strong> {import.meta.env.VITE_WORDPRESS_API_URL || 'http://localhost:8081/wp-json/wp/v2'}</p>
												<p><strong>Posts Disponíveis:</strong> 3 artigos médicos</p>
												<p><strong>Ambiente:</strong> Desenvolvimento local</p>
											</div>
											<div className="mt-3 text-xs text-gray-500">
												<p>💡 Este é um ambiente de teste. Em produção, será usado o WordPress real.</p>
											</div>
										</>
									) : (
										<>
											<p className="mb-2">
												Credenciais padrão de produção:
											</p>
											<div className="bg-gray-50 p-3 rounded text-left">
												<p><strong>URL:</strong> {import.meta.env.VITE_WORDPRESS_ADMIN_URL || `${window.location.origin}/wp-admin`}</p>
												<p><strong>Usuário:</strong> admin</p>
												<p><strong>Senha:</strong> Definida durante configuração</p>
											</div>
										</>
									)}
								</div>
							</div>

							{/* Back to Blog */}
							<div className="mt-6 text-center">
								<Button
									variant="ghost"
									onClick={() => navigate('/blog')}
									className="text-gray-600 hover:text-gray-800"
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									{t('admin.backToBlog')}
								</Button>
							</div>
						</motion.div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default AdminLoginPage;
