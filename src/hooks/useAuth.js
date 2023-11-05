/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import clienteAxios from '../config/axios'
import useSWR from 'swr'

export const useAuth = ({middleware, url}) => {
  
    const token = localStorage.getItem('AUTH TOKEN')
    const navigate = useNavigate()
    
    const { data: user, error, mutate } = useSWR('/api/user', () => 
        clienteAxios('/api/user',{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.data)
        .catch(error => {
            throw Error(error?.response?.data?.errors)
        })
    )

    const login = async(datos, setErrores) => {
        try {
            const {data} = await clienteAxios.post('/api/login', datos)
            localStorage.setItem('AUTH TOKEN', data.token)
            setErrores([])
            await mutate() //revalidar useSWR
        } catch (error) {
            setErrores(Object.values(error.response.data.errors))
        }
    }

    const registro = async(datos, setErrores) => {
        try {
            const {data} = await clienteAxios.post('/api/registro', datos)
            localStorage.setItem('AUTH TOKEN', data.token)
            setErrores([])
            await mutate() //revalidar useSWR
        } catch (error) {
            setErrores(Object.values(error.response.data.errors))
        }
    }

    const logout = async() => {
        try {
            await clienteAxios.post('/api/logout', null,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            localStorage.removeItem('AUTH TOKEN')
            await mutate(undefined)
        } catch (error) {
            throw Error(error?.response?.data?.errors)
        }
    }

    useEffect(() => {
        if(middleware === 'guest' && url && user){
            navigate(url)
        }

        if(middleware === 'guest' && user && user.admin ){
            navigate('/admin')
        }

        if(middleware === 'admin' && user && !user.admin){
            navigate('/')
        }

        if(middleware === 'auth' && error){
            navigate('/auth/login')
        }
    }, [user, error])

    return {
        login,
        registro,
        logout,
        user,
        error
    }

}

