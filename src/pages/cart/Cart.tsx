import { ChangeEvent, FC, useContext, useEffect, useState } from "react"
import Context, { GlobalStateContext} from "../../global/Context"
import axios from "axios"
import { BASE_URL } from "../../constants/url"
import Header from "../../components/Header"
import { AiFillHome } from 'react-icons/ai'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdEdit } from 'react-icons/md'
import { Order } from "../../types/types"
import { useNavigate } from "react-router-dom"
import { Container } from "./styled"
import Payment_methods from "../../components/payment/Payment_methods"



const Cart:FC = ()=>{
    const navigate = useNavigate()
    const [payment, setPayment] = useState<string>('money')
    const [selectedValue, setSelectedValue] = useState<string>('')
    const { 
        cart, setCart, user, getProfile, getAllOrders, setUpdateAddress
    } = useContext(Context) as GlobalStateContext
    //const [cartData, setCartData] = useState<Order[]>(cart)
    const [total, setTotal] = useState<number>(cart.reduce((acc, item) => acc + item.total, 0))

    
    
    useEffect(()=>{
        const token = localStorage.getItem('token')
        
        if(!token){
            navigate('/ifuture_react')
        }

        getProfile()
        setTotal(cart.reduce((acc, item) => acc + item.total, 0))
        getAllOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart])


    const handleSelect = (e:ChangeEvent<HTMLSelectElement>)=>{
        setPayment(e.target.value)
    }

    const handleNumber = (e:ChangeEvent<HTMLInputElement>, id:string)=>{
        const newQuantity = Number(e.target.value)
        const updatedCart = cart.map(item=>{
            if(item.id === id){
                const newTotal = item.price * newQuantity
                return { ...item, quantity: newQuantity, total: newTotal }
            }
            return item
        })
        const headers = {
            headers: { Authorization: localStorage.getItem('token')}
        }

        setCart(updatedCart)
        
        axios.patch(`${BASE_URL}/order/${id}`, {
            quantity: newQuantity
        }, headers).then(()=>{
            getAllOrders()
        }).catch(e => alert(e.response.data) )

        setTotal(updatedCart.reduce((acc, cart) => acc + cart.total, 0))
    }


    const handleRadioButton = (e:ChangeEvent<HTMLInputElement>)=>{
        if(cart.length === 0){
            return alert('Você ainda não fez nenhum pedido')
        }

        setSelectedValue(e.target.value)
    }

    const removeItem = (cartItem:Order)=>{
        const headers = {
            headers: { Authorization: localStorage.getItem('token') }
        }

        axios.delete(`${BASE_URL}/order/${cartItem.id}`, headers).then(
            () => getAllOrders()
        ).catch(e=>{
            alert(e.response.data)
        })
    }
    
   
    const endRequests = (id:string)=>{
        const headers = {
            headers: { Authorization: localStorage.getItem('token')}
        }

        if(selectedValue === ''){
            return alert('Selecione um método de pagamento')
        }

        axios.patch(`${BASE_URL}/finished_orders/${id}`, headers).then(res=>{
            alert(res.data)
            getAllOrders()
        }).catch(e => alert(e.response.data))
    }
    
        


    return(
        <>
        <Header
            leftIcon={
                <AiFillHome 
                    className="header-icon"
                    onClick={()=> navigate('/ifuture_react/feed')} />
            }
            rightIcon={
                <BsFillPersonFill 
                    className="header-icon"
                    onClick={()=> navigate('/ifuture_react/profile')} />
            }/>
        <Container>
            <h1>Meu Carrinho</h1>
            <hr style={{width:'100%', marginBottom:'15px', background:'lightgray'}} />
            <div className="address-section">
                <div>Endereço para entrega: <br />
                    {user.street} {user.number}, {user.neighbourhood}<br/>
                    {user.city} - {user.state}
                </div>
                <MdEdit className="icon" onClick={()=> {
                    setUpdateAddress(true)
                    navigate('/ifuture_react/address')
                }} />
            </div>
            <div className="addressAndName">
                <div className="rest-name">Seus produtos</div>
            </div>
            <hr style={{width:'100%', marginBottom:'15px', background:'lightgray'}} />
            {cart.length > 0 ? cart.map(item=>(
                <div key={item.id} className="card">
                    <span>
                        <img src={item.photoUrl}  alt="Imagem do produto" />
                    </span>
                    <span>
                        <div className="product-name">{item.product}</div>
                        <div>
                            {/* <b>Descrição: </b>{item.description} <br /> */}
                            <b>Quantidade: </b>{item.quantity} <br />
                            <b>Preço: </b>R$ {item.price.toFixed(2)} <br />
                            <b>Total: </b>{((item.price) * (item.quantity)).toFixed(2)} <br />
                        </div>
                    </span>
                    <div className="btn-container">
                        <input 
                            type="number"
                            min={1} 
                            value={item.quantity}
                            onChange={(e) => handleNumber(e, item.id)}
                            name="" 
                            id="" />                 
                        <button className="btn-remove" onClick={()=> removeItem(item)} >Remover</button> 
                    </div>
                </div>
            )) : <div style={{margin:10}}>Você ainda não fez nenhum pedido</div> }
            <hr style={{width:'100%', marginBottom:'15px', background:'lightgray'}} />
            <Payment_methods 
                paymentMethod={payment}
                handleRadioButton={handleRadioButton}
                selectedValue={selectedValue}/>
            <div className="select-container">
                <select className="select" value={payment} onChange={handleSelect}>
                    <option value="money" defaultChecked>Dinheiro</option>
                    <option value="creditcard">Cartão de crédito</option>
                </select>
                <div className="total-price">Total da compra: {total.toFixed(2)}</div>
            </div>
            <button  className="requestOrder-btn" onClick={() => endRequests(user.id)}>
                Finalizar Compra
            </button>
        </Container>
        </>
    )
}

export default Cart