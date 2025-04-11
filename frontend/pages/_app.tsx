import { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Fabric Print on Demand</title>
        <meta name="description" content="Custom fabric printing service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
        <ToastContainer position="bottom-center" />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
