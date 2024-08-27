import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout.jsx";
import App from "../App.jsx";
import Upload from "../pages/Upload.jsx";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import HEDERA from "../clients/viemHedera";
import { useEffect, useState } from "react";

const clientId =
  "BFBDKROkBydyikVmnzoCq_eiin-Rwj-LUUdYtF1wIChjeHi5zHpyVQvNjMH-3FmQEeapcfOLn3k9WHtcTmdowu0";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x128",
  rpcTarget: "https://testnet.hashio.io/api",
  displayName: "Hedera Testnet",
  blockExplorerUrl: "https://hashscan.io/testnet/",
  ticker: "HBAR",
  tickerName: "HBAR",
  logo: "https://cryptologos.cc/logos/hedera-hbar-logo.png?v=033",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig: chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
});

function RootComponent() {
  const [provider, setProvider] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const getUserInfo = async () => {
      if (loggedIn) {
        const user = await web3auth.getUserInfo();
        setUser(user.name);
      }
    };

    getUserInfo();
  }, [loggedIn]);

  useEffect(() => {
    const getBalance = async () => {
      if (!loggedIn) {
        console.log("Login first");
        return;
      }
      const balance = await HEDERA.getBalance(provider);
      setBalance(parseInt(balance));
    };
    getBalance();
  }, [loggedIn, provider]);

  const login = async () => {
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    console.log("logged out");
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout
          login={login}
          isLoggedIn={loggedIn}
          balance={balance}
          user={user}
          logout={logout}
        />
      ),
      children: [
        { path: "/", element: <App loggedIn={loggedIn} /> },
        { path: "upload", element: <Upload /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default RootComponent;
