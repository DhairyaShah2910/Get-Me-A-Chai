import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import Payment from "@/models/Payment";
import Razorpay from "razorpay";
import connectDB from "@/db/connectDb";
import User from "@/models/User";
// import Username from "@/app/[username]/page";

export const POST = async (req) =>{
    await connectDB()
    let body = await req.formData()
    body = Object.fromEntries(body)

    // check if razorpayOrderId  is present on the server 
    let p = await Payment.findOne({oid: body.razorpay_order_id})
    if (!p){
        // return NextResponse.error("Order Id not found")
        return NextResponse.json({success: false, message:"Order Id not found"})

    }

    // fetch the secret of the user who is getting the payment 
    let user = await User.findOne({username: p.to_user})
    const secret = user.razorpaysecret

    // Verify the payment
    let xx = validatePaymentVerification({"order_id": body.razorpay_order_id, "payment_id": body.razorpay_payment_id}, body.razorpay_signature, secret)

    if(xx) {
        // Update the Payment status
        const updatePayment = await Payment.findOneAndUpdate({oid: body.razorpay_order_id}, {done:"true"}, {new:"true"})
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/${updatePayment.to_user}?paymentdone=true`)
    }
    else{
        return NextResponse.json({success: false, message:"Payment Verification Failed"})
    }
}