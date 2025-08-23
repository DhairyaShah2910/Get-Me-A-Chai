"use server"

import Razorpay from "razorpay"
import Payment from "@/models/Payment"
import connectDB from "@/db/connectDb"
import User from "@/models/User"

export const initiate = async (amount, to_username, paymentform) => {
    await connectDB()
    let user = await User.findOne({ username: to_username })

    const secret = user.razorpaysecret

    var instance = new Razorpay({ key_id: user.razorpayid, key_secret: secret })

    let options = {
        amount: Number.parseInt(amount),
        currency: "INR",
    }

    let x = await instance.orders.create(options)

    // create a payment object which shows a pending payment in the database
    await Payment.create({
        oid: x.id,
        amount: amount / 100,
        to_user: to_username, // to_username
        name: paymentform.name,
        message: paymentform.message
    })
    return x
}

export const fetchuser = async (username) => {
    await connectDB()
    let u = await User.findOne({ username: username })
    if (!u) {
        return null // or throw an error
    }
    let user = u.toObject({ flattenObjectIds: true })
    return user
}


export const fetchpayments = async (username, page = 1, limit = 5) => {
    await connectDB();

    const skip = (page - 1) * limit;

    let payments = await Payment.find({ to_user: username, done: true })
        .sort({ amount: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // total payments count
    const totalPayments = await Payment.countDocuments({ to_user: username, done: true });

    // Total raised amount
    const totalAmountAgg = await Payment.aggregate([
        { $match: { to_user: username, done: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalAmount = totalAmountAgg[0]?.total || 0;


    return {
        payments: payments.map(item => ({
            ...item,
            _id: item._id.toString(),
            createdAt: item.createdAt?.toISOString(),
            updatedAt: item.updatedAt?.toISOString()
        })),
        totalPages: Math.ceil(totalPayments / limit),
        currentPage: page,
        totalPayments,
        totalAmount
    };
};


// export const fetchpayments = async (username) => {
//     await connectDB()
//     // find all payments sorted by decreasing order of amount and flatten object
//     let p = await Payment.find({ to_user: username, done: true }).sort({ amount: -1 }).limit(5).lean()

//     return p.map(item => ({
//         ...item,
//         _id: item._id.toString(),
//         createdAt: item.createdAt?.toISOString(),
//         updatedAt: item.updatedAt?.toISOString()
//     }));
// }

export const updateProfile = async (data, oldusername) => {
    await connectDB()
    let ndata = Object.fromEntries(data)

    // If the Username is being updated, check if username is available

    if (oldusername !== ndata.username) {
        let u = await User.findOne({ username: ndata.username })
        if (u) {
            return { error: "Username alredy exists" }
        }
        await User.updateOne({ email: ndata.email }, ndata)
        // Now Update all the username in the payment table
        await Payment.updateMany({ to_user: oldusername }, { to_user: ndata.username })
    }
    else {
        await User.updateOne({ email: ndata.email }, ndata)
    }
}