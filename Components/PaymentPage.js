"use client";
import React, { useEffect, useState } from "react";
import Script from "next/script";
import { fetchpayments, fetchuser, initiate } from "@/actions/useractions";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation"

const PaymentPage = ({ username }) => {
  // const {data: session} = useSession()
  const [paymentform, setPaymentform] = useState({
    name: "",
    message: "",
    amount: "",
  });
  const [currentUser, setCurrentUser] = useState({})
  const [payments, setPayments] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const searchParams = useSearchParams()
  const router = useRouter()


  useEffect(() => {
    getData(page)
  }, [page])

  useEffect(() => {
    if (searchParams.get("paymentdone") == "true") {
      toast('Thanks For Your Donation', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
    router.push(`/${username}`)
  }, [])

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "amount") {
      // Non-digits hata do
      value = value.replace(/\D/g, "");
    }
    setPaymentform({ ...paymentform, [name]: value });

  };

  const getData = async (page = 1) => {
    let u = await fetchuser(username)
    setCurrentUser(u)

    let dbpayments = await fetchpayments(username, page)
    // setPayments(dbpayments)
    setPayments(dbpayments.payments);
    setTotalPages(dbpayments.totalPages);
    setTotalPayments(dbpayments.totalPayments);
    setTotalAmount(dbpayments.totalAmount);
    console.log(u, dbpayments)
  }

  const pay = async (amount) => {
    // get the order Id
    let a = await initiate(amount, username, paymentform);
    let orderId = a.id;
    // console.log("Razorpay Id: ",  process.env.NEXT_PUBLIC_KEY_ID)
    var options = {
      // key: process.env.NEXT_PUBLIC_KEY_ID, // Enter the Key ID generated from the Dashboard
      key: currentUser.razorpayid, // Enter the Key ID generated from the Dashboard
      amount: amount, // Amount is in currency subunits.
      currency: "INR",
      name: "Get Me A Chai", //your business name
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: orderId, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      callback_url: `${process.env.NEXT_PUBLIC_URL}/api/razorpay/`,
      prefill: {
        //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
        name: "Gaurav Kumar", //your customer's name
        email: "gaurav.kumar@example.com",
        contact: "+919876543210", //Provide the customer's phone number for better conversion rates
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
  };

  return (
    <>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>

      <div className="cover w-full relative bg-red-50">
        <img
          className="object-cover w-full h-48 md:h-[350]"
          // src="/background.png"
          src={currentUser.coverpic}
          alt="Cover Photo"
        />
        <div className="absolute -bottom-16 right-[38%] md:right-[46%] border-white border-2 rounded-full size-32 overflow-hidden">
          <img
            className="rounded-full size-32"
            width={128}
            height={128}
            // src="/profile.jpg"
            src={currentUser.profilepic}
            alt="Profile Photo"
          />
        </div>
      </div>
      <div className="info flex justify-center items-center my-24 flex-col gap-2">
        <div className="font-bold text-lg ">@{username}</div>
        <div className="text-slate-400">Creating a full stack Website</div>
        <div className="text-slate-400">Let's help {username} get a chai </div>
        <div className="text-slate-400">{totalPayments} Payments . {currentUser.name} has raised ₹{totalAmount}</div>
        <div className="payment flex gap-3 w-[80%] mt-11 flex-col md:flex-row">
          <div className="supporters w-full md:w-1/2 bg-slate-900 rounded-lg text-white p-10 flex flex-col justify-between min-h-[400px]">
            {/* show all supporters */}
            <h2 className="text-2xl font-bold my-5"> supporters</h2>
            <ul className="mx-5 text-lg">
              {payments.length == 0 && <li>No Payments yet</li>}
              {
                payments.map((p, i) => {
                  return <li key={p._id} className="my-4 flex gap-2 items-center">
                    <img src="/avatar.gif" width={33} />
                    <span>
                      {p.name} donated <span className="font-bold">₹{p.amount}</span> with a
                      message {p.message}
                    </span>
                  </li>
                })
              }
            </ul>
            {/* pagination */}
            <div className="flex gap-2 mt-4 justify-center items-center">
              <button
                disabled={page === 1 || totalPages === 0}
                onClick={() => setPage((prev) => prev - 1)}
                className="w-[80px] px-3 py-1 border rounded  text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:from-red-500"
              >
                Prev
              </button>
              <span className="min-w-[120px] text-center">
                {totalPages === 0
                  ? "No payments found"
                  : `Page ${page} of ${totalPages}`}
              </span>

              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((prev) => prev + 1)}
                className="w-[80px] px-3 py-1 border rounded text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:from-red-500"
              >
                Next
              </button>
            </div>

          </div>

          <div className="makePayment w-full md:w-1/2 bg-slate-900 rounded-lg text-white p-10">
            <h2 className="text-2xl font-bold my-5">Make a Payment</h2>
            <div className="flex gap-2 flex-col">
              <div>
                <input
                  onChange={handleChange}
                  value={paymentform.name}
                  type="text"
                  name="name"
                  className="w-full p-3 rounded-lg bg-slate-800"
                  placeholder="Enter Name"
                />
              </div>
              <input
                onChange={handleChange}
                value={paymentform.message}
                type="text"
                name="message"
                className="w-full p-3 rounded-lg bg-slate-800"
                placeholder="Enter Message"
              />
              <input
                onChange={handleChange}
                value={paymentform.amount}
                name="amount"
                type="text"
                className="w-full p-3 rounded-lg bg-slate-800"
                placeholder="Enter Amount"
              />
              <button
                onClick={() => pay(Number.parseInt(paymentform.amount) * 100)}
                type="number"
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:from-red-500" disabled={paymentform.name?.length < 3 || paymentform.message?.length < 4 || paymentform.amount?.length < 1}
              >
                Pay
              </button>
            </div>
            {/* or choose from these amounts */}
            <div className="flex gap-2 mt-5 flex flex-col md:flex-row">
              <button
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 p-3 disabled:from-red-500" disabled={paymentform.name?.length < 3 || paymentform.message?.length < 4}
                onClick={() => pay(1000)}
              >
                Pay ₹10
              </button>
              <button
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 p-3 disabled:from-red-500" disabled={paymentform.name?.length < 3 || paymentform.message?.length < 4}
                onClick={() => pay(2000)}
              >
                Pay ₹20
              </button>
              <button
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 p-3 disabled:from-red-500" disabled={paymentform.name?.length < 3 || paymentform.message?.length < 4}
                onClick={() => pay(3000)}
              >
                Pay ₹30
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
