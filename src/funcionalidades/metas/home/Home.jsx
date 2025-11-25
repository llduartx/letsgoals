import BannerAnuncio from "./Components/BannerAnuncio";
import BgCartao from "./Components/BgCartao";
import BtnFuncionalidade from "./Components/BtnFuncionalidade";
import Header from "../../../components/Layout/Header";
import Footer from "../../../components/Layout/Footer";
import ListaMetas from "./Components/ListaMetas";

import { useAuth } from '../../../context/usuarioContext'
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function Home() {
  const { usuarioLogado, isAuthLoading, logout, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthLoading) {
      if (!usuarioLogado) {
        navigate("/")
      }
    }
  }, [usuarioLogado, isAuthLoading, navigate])
    
  if (isAuthLoading) {
    return <p className="pt-40 text-center">Carregando...</p>
  }

  return (
    <div className="bg-white relative">
      <Header />
      <BannerAnuncio />
      <BgCartao />
      <BtnFuncionalidade />
      <ListaMetas />
      <Footer />
    </div >
  )
}