import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import Contract from "./abi/Contract.json";

const { REACT_APP_CONTRACT_ADDRESS } = process.env;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsUrls, setPostsUrls] = useState([]);
  const [dappContract, setDappContract] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isWeb3DevMember, setIsWeb3DevMember] = useState(false);
  const [postUrl, setPostUrl] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      setIsError(false);
      const { ethereum } = window;

      if (!ethereum) {
        return;
      } else {
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          setCurrentAccount(account);
        }
      }
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getPosts = async () => {
    try {
      const getPosts = await dappContract.getPosts();

      setPostsUrls([...getPosts]);
    } catch (error) {
      console.warn("Error: ", error);
    }
  };

  const addPost = async () => {
    try {
      const addPost = await dappContract.addPost(postUrl);
      await addPost.wait();
    } catch (error) {
      console.warn("Error: ", error);
    }
  };

  const fetchPosts = async () => {
    try {
      fetch(postsUrls[0])
        .then((res) => res.json())
        .then((data) => {
          setPosts((prevPosts) => [...prevPosts, data]);
        });
    } catch (error) {
      console.warn("Error: ", error);
    }
  };

  const renderPosts = () => {
    if (!posts) {
      return <span>No posts to render</span>;
    }

    return posts.map((post, index) => (
      <div key={index}>
        <h6>{post.title}</h6>
        <p>{post.content}</p>
      </div>
    ));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const dappContract = new ethers.Contract(
      REACT_APP_CONTRACT_ADDRESS,
      Contract.abi,
      signer
    );
    setDappContract(dappContract);

    const checkIsMember = async () => {
      try {
        const checkMember = await dappContract.isNFTHolder();
        if (checkMember === true) {
          setIsWeb3DevMember(true);
        } else {
          setIsWeb3DevMember(false);
        }
      } catch (error) {
        console.warn("Error: ", error);
      }
    };

    checkIsMember();
  }, [currentAccount]);

  return (
    <div>
      {!currentAccount ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <span>{`Signed in ${currentAccount.slice(
          0,
          4
        )}...${currentAccount.slice(38, 42)}`}</span>
      )}
      <div style={{ display: "flex" }}>
        <button onClick={getPosts}>Get Posts</button>
        <input
          onChange={(event) => setPostUrl(event.target.value)}
          value={postUrl}
        />
        <button onClick={addPost}>Add Post</button>
        <button onClick={fetchPosts}>Fetch Posts</button>
      </div>
      {renderPosts()}
    </div>
  );
};

export default App;
