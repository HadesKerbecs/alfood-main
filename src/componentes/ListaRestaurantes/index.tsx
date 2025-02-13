import { useEffect, useState } from 'react';
import { Button, TextField } from "@mui/material";
import IRestaurante from '../../interfaces/IRestaurante';
import style from './ListaRestaurantes.module.scss';
import Restaurante from './Restaurante';
import axios, { AxiosRequestConfig } from 'axios';
import { IPaginacao } from '../../interfaces/IPaginacao';


interface IParametrosBusca {
  ordering?: string
  search?: string
}

const ListaRestaurantes = () => {
  const [restaurantes, setRestaurantes] = useState<IRestaurante[]>([])
  const [proximaPagina, setProximaPagina] = useState('')
  const [/*paginaAnterior*/, setPaginaAnterior] = useState('')
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState('')

  const carregarDados = (url: string, opcoes: AxiosRequestConfig = {}) => {

    axios.get<IPaginacao<IRestaurante>>(url, opcoes)
      .then(resposta => {
        setRestaurantes(resposta.data.results)
        setProximaPagina(resposta.data.next)
        setPaginaAnterior(resposta.data.previous)
      })
      .catch(erro => {
        console.log(erro)
      })
  }

  const buscar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const opcoes = {
      params: {

      } as IParametrosBusca
    }
    if (busca) {
      opcoes.params.search = busca
    }
    if (ordenacao) {
      opcoes.params.ordering = ordenacao
    }
    carregarDados('http://localhost:8000/api/v1/restaurantes/', opcoes)
  }

  useEffect(() => {
    carregarDados('http://localhost:8000/api/v1/restaurantes/')
  }, [])

  useEffect(() => {
    axios.get<IPaginacao<IRestaurante>>('http://localhost:8000/api/v1/restaurantes/')
      .then(resposta => {
        setRestaurantes(resposta.data.results)
        setProximaPagina(resposta.data.next)
      })
      .catch(erro => {
        console.log(erro)
      })
  }, [])

  const verMais = () => {
    axios.get<IPaginacao<IRestaurante>>(proximaPagina)
      .then(resposta => {
        setRestaurantes([...restaurantes, ...resposta.data.results])
        setProximaPagina(resposta.data.next)
      })
      .catch(erro => {
        console.log(erro)
      })
  }
  return (<section className={style.ListaRestaurantes}>
    <h1>Os restaurantes mais <em>bacanas</em>!</h1>
    <form onSubmit={buscar}>
      <div>
        <TextField id="outlined-basic" label="Outlined" variant="outlined" type="text" value={busca} onChange={evento => setBusca(evento.target.value)} />
      </div>
      <div>
        <label htmlFor="select-ordenacao">Ordenação</label>
        <select
          name="select-ordenacao"
          id="select-ordencao"
          value={ordenacao}
          onChange={evento => setOrdenacao(evento.target.value)}
        >
          <option value="">Padrão</option>
          <option value="id">Por ID</option>
          <option value="nome">Por Nome</option>
        </select>
      </div>
      <div>
      <Button type='submit' variant="contained">Buscar</Button>
      </div>
    </form>
    {restaurantes?.map(item => <Restaurante restaurante={item} key={item.id} />)}
    {proximaPagina && <Button variant="contained" onClick={verMais}>
      Ver mais
    </Button>}
  </section>)
}

export default ListaRestaurantes