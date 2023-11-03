/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { categorias as categoriasDB } from '../data/categorias'
import clienteAxios from '../config/axios'

const QuioscoContext = createContext();

const QuioscoProvider = ({children}) => {

    const [categorias, setCategorias] = useState([])
    const [categoriaActual, setCategoriaActual] = useState({})
    const [modal, setModal] = useState(false)
    const [producto, setProducto] = useState({})
    const [pedido, setPedido] = useState([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const nuevototal = pedido.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0)
        setTotal(nuevototal)
    }, [pedido])

    const obtenerCategorias = async () => {
        try {
            const { data } = await clienteAxios.get('/api/categorias')
            setCategorias(data.data)
            setCategoriaActual(data.data[0])
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        obtenerCategorias();
    }, [])
        
    const handleClickCategoria = (id) => {
        const categoria = categorias.filter(categoria => categoria.id === id)[0]
        setCategoriaActual(categoria)
    }

    const handleClickModal = () => {
        setModal(!modal)
    }

    const handleSetProducto = producto => {
        setProducto(producto)
    }

    const handleAgregarPedido = ({categoria_id, ...producto}) => {
        
        if(pedido.some(pedidoState => pedidoState.id === producto.id)){
            const pedidoActualizado = pedido.map( pedidoState => pedidoState.id === producto.id ? producto : pedidoState)
            setPedido(pedidoActualizado)
            toast.success('Guardado Correctamente')
        } else {
            setPedido([...pedido, producto])
            toast.success('Agregado al Pedido')
        }
    }

    const handleEditarCantidad = id => {
        const productoActualizar = pedido.filter( producto => producto.id === id)[0]
        setProducto(productoActualizar)
        setModal(true)
    }

    const handleEliminarProductoPedido = id => {
        const pedidoActualizado = pedido.filter( producto => producto.id !== id)
        setPedido(pedidoActualizado)
        toast.error('Eliminado del Pedido')
    }

    const handleSubmitNuevaOrden = async(logout) => {
        const token = localStorage.getItem('AUTH TOKEN')
        try {
           const {data} = await clienteAxios.post('/api/pedidos', 
            {
                total,
                productos: pedido.map( producto => {
                    return {
                          id: producto.id,
                          cantidad: producto.cantidad
                    }
                })
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            
            toast.success(data.message)
            setTimeout(() => {
                setPedido([])
            }, 1000);

            // Cerrar la sesión del usuario
            setTimeout(() => {
                localStorage.removeItem('AUTH TOKEN')
                logout()
            }, 3000);

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <QuioscoContext.Provider value={{
            categorias,
            categoriaActual,
            modal,
            producto,
            pedido,
            total,
            handleClickCategoria,
            handleClickModal,
            handleSetProducto,
            handleAgregarPedido,
            handleEditarCantidad,
            handleEliminarProductoPedido,
            handleSubmitNuevaOrden
        }}>
            {children}
        </QuioscoContext.Provider>
    )
}

export { 
    QuioscoProvider 
}
export default QuioscoContext;