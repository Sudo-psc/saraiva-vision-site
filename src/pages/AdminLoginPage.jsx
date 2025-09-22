import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLogin from '../components/auth/AdminLogin';

const AdminLoginPage = () => {
	return (
		<>
			<Helmet>
				<title>Admin Login | Saraiva Vision</title>
				<meta name="description" content="Acesso administrativo ao painel da Saraiva Vision" />
				<meta name="robots" content="noindex, nofollow" />
			</Helmet>
			<AdminLogin />
		</>
	);
};

export default AdminLoginPage;
