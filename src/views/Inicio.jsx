import useSWR from 'swr'
import Producto from '../components/Producto'
import useQuiosco from '../hooks/useQuiosco'
import clienteAxios from '../config/axios'

export default function Inicio() {

  const { categoriaActual } = useQuiosco()

  // Consulta SWR
  const token = localStorage.getItem('AUTH TOKEN')
  const fetcher = () => clienteAxios.get('/api/productos', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(data => data.data)
  const { data, isLoading } = useSWR('/api/productos', fetcher, {
    refreshInterval: 1000
  })

  if(isLoading) return <p>Cargando...</p>
  const productos = data.data.filter(producto => producto.categoria_id === categoriaActual.id)

  return (
    <>
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
        {
          productos.map(producto => (
            <Producto 
              key={producto.id}
              producto={producto}
              botonAgregar={true}
            />
          ))
        }
      </div>
    </>
  )
}
