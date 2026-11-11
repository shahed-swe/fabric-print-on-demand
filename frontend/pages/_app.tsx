import { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import { getRate, loadExchangeRate } from '../utils/currency';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppProps) {
  // Load the USD -> BDT display rate; re-render all prices when it changes.
  const [, setRate] = useState(getRate());
  useEffect(() => {
    loadExchangeRate(setRate);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Head>
          <title>Fabric Print on Demand</title>
          <meta name="description" content="Custom fabric printing service" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Layout>
          <Component {...pageProps} />
          <ToastContainer
            position="bottom-center"
            autoClose={2000}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover={false}
            theme="light"
          />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

export default MyApp;
