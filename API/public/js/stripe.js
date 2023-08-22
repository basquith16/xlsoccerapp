/* eslint-disable */
const stripe = Stripe('pk_test_51NctyzC5wZsDYstknYrSUzbDPsPUcrte2HqMs0qaC0yr9qbQ3xgCWUtnMmmpoh2TLPVoY6IB4a68CxdZr6dkRz0A00HH17y7Es');

export const getInvoices = async () => {
    try {
        console.log('invoice page');
        // const invoices = await stripe.invoices.list({
        //     limit: 3,
        // });

        // console.log(invoices);

    } catch (err) {
        console.log(err);
    }
}

export const bookSession = async sessionId => {
    try {
        const checkout = await axios (`http://127.0.0.1:8000/api/v1/booking/checkout/${sessionId}`);

        await stripe.redirectToCheckout({
            sessionId: checkout.data.checkout.id        });
    } catch (err) {
        console.log(err);
    }
}