import React, { useEffect, useState } from "react";
import "./style.css";
import axios from "axios";
export default function StripeComponent() {

    //const { Stripe } = useScript('https://js.stripe.com/v3/', 'Stripe', 'test')
    const [data, setdata] = useState({ name: "", email: "", amount: "", currency: "usd" });
    const [stripe, setStripe] = useState("");
    const [stripeElement, setStripeElement] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const API  =  "https://api.exchangerate-api.com/v4/latest/USD" ;
    const [showAmount, setShowAmount] = useState({amount:0 ,symbol:"USD"})


    const getSymbol = {
        'USD' : '$', 
        'EUR' : '€', 
        'GBP' : '£', 
        'JPY' : '¥',
        'BDT': 'tk'
    }

    useEffect(() => {
        const stripeKey = window.Stripe('pk_test_51NGbtWL6EDqw6EU4OxgKxZLfiULcOpePVkQ5Zg2giMNCTMzKTAA2jNQKa6HMcRKHwsGxMFvVgudR5YQElTp1o7m400zHjaVAMP')
        const elements = stripeKey.elements({
            locale: 'en'
        })
        setStripe(stripeKey);
        const cardElement = elements.create('card');
        cardElement.mount('.cardElement');
        setStripeElement(cardElement);
    }, [])

    useEffect(()=>{
        const currencyCode = window.geoplugin_currencyCode();
        
        const option = document.createElement('option');
        option.innerText = currencyCode.toUpperCase();
        option.value = currencyCode.toLowerCase();
        document.getElementById("opt").appendChild(option);

        
    },[])

    useEffect(()=>{
        const fetchData = async ()=>{
            try{
                const response = await axios.get(API);
                const base = data.currency.toUpperCase()
                const rate = response.data.rates[base];
                const convert = data.amount*rate;
                setShowAmount((prev)=>({...prev,amount:Math.round(convert*100)/100, symbol:base}));
                console.log(convert);
            }catch(error)
            {
                setError(error.message);
            }
        }
        fetchData();
    },[data.amount, data.currency])


    useEffect(()=>{},[error]);

    async function comfirmPaymentIntent(response) {
        await axios.post('https://api.stripe.com/v1/payment_intents/' + response.data.id + '/confirm', {}, {
            headers: {
                "Authorization": "Bearer " + 'sk_test_51NGbtWL6EDqw6EU4m8BgCYZhlpcUKh5UAX3z1IXsmXpOSKpWKHq8pLIC7vienCdL7wOZNQcE3UtKvSKtOUL2LRjA00Plcu9GXl',
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
            .then(function (response) {
                console.log(response);
                alert("payment successful");

            })
            .catch(function (error) {
                console.log(error);
                setError(error);
            })
    }

    async function createPaymentIntent(paymentMethod) {
        await axios.post('https://api.stripe.com/v1/payment_intents', {
            amount: data.amount,
            currency: data.currency,
            payment_method: paymentMethod.id,
            confirmation_method: 'automatic'
        }, {
            headers: {
                "Authorization": "Bearer " + 'sk_test_51NGbtWL6EDqw6EU4m8BgCYZhlpcUKh5UAX3z1IXsmXpOSKpWKHq8pLIC7vienCdL7wOZNQcE3UtKvSKtOUL2LRjA00Plcu9GXl',
                "Content-Type": "application/x-www-form-urlencoded"
            }

        })
            .then(function (response) {
                console.log(response);
                comfirmPaymentIntent(response);

            })
            .catch(function (error) {
                console.log(error);
                setError(error);
            });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const { paymentMethod, error } = await stripe.createPaymentMethod(
                'card', stripeElement, {
                billing_details: {
                    "name": data.name,
                    "email": data.email
                }
            }
            );

            if (error) {
                setError(error.message);
            } else {
                await createPaymentIntent(paymentMethod)
            }
        }
        catch (error) {
            setError(error.message);
        }
        finally {
            setIsLoading(false);
        }

    }


    return (
        <>
            <div className="main">
                <div className="register">
                    <div className="header">
                        <h2>Stripe Payment</h2>
                    </div>

                    <form id="register" method="post" onSubmit={handleSubmit}>
                        <label htmlFor="">Name: </label>
                        <br />
                        <input
                            onChange={(e) => { setdata((prev) => ({ ...prev, name: e.target.value })) }}
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter Your Name"
                        />
                        <br />
                        <br />
                        <label htmlFor="">Email: </label>
                        <br />
                        <input
                            onChange={(e) => { setdata((prev) => ({ ...prev, email: e.target.value })) }}
                            type="email"
                            name="email"
                            id="name"
                            placeholder="Enter Your Valid Email"
                        />
                        <br />
                        <br />
                        <label htmlFor="value" className="pay">
                            Amount you want to pay:
                        </label>
                        <br />
                        <input
                            onChange={(e) => { setdata((prev) => ({ ...prev, amount: e.target.value })) }}
                            type="number"
                            min={5}
                            step="0.01"
                            name="value"
                            required=""
                            id="name"
                            className="form-control"
                        />
                        <br />
                        <small className="form-text text-danger">
                            Up to two decimal positions, using a dot "."
                        </small>
                        <br />
                        <br />
                        <label htmlFor="currency" className="currency">
                            Select Currency
                        </label>
                        <select name="currency" id="opt" className="custom-select" onChange={(e) => { setdata((prev) => ({ ...prev, currency: e.target.value })) }}>
                            <option value="usd">USD</option>
                            <option value="eur">EUR</option>
                            <option value="gbp">GBP</option>
                            <option value="jpy">JPY</option>

                        </select>
                        <br />
                        <br />
                        <label className="mt-3" htmlFor="card-element">
                            Card details:
                        </label>
                        <br /><br />
                        <div className="cardElement" />

                        {isLoading ? (
                            <>
                                <button type="submit" id="payButton" className="btn btn-primary btn-lg">
                                    Loading...
                                </button>
                            </>
                        ) : (<>
                            {error && <div className="error">{error}</div>}
                            <button  type="submit" id="payButton" className="btn btn-primary btn-lg">
                                Pay {showAmount.amount} {getSymbol[showAmount.symbol] ? getSymbol[showAmount.symbol] :''}
                            </button>
                        </>)}
                    </form>
                </div>
            </div>

        </>
    );
}