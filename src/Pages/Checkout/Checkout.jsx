import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import { StoreContext } from '../../Contexts/StoreContext';
import SelectedItemSection from '../../RegisterComponents/SelectedItemSection/SelectedItemSection';
import RegistrationForm from '../../RegisterComponents/RegistrationForm/RegistrationForm';
import { toast } from 'react-toastify';
import PayButton from '../../RegisterComponents/PayButton/PayButton';
import Preloader from '../../Components/Preloader/Preloader';
import ConfirmSection from '../../RegisterComponents/ConfirmSection/ConfirmSection';

const CheckoutPage = () => {
  const { selectedEvent, setSelectedEvent, eventDatas, setAmount, amount, payNow, step, data, setStep, setData, eventRegistrations } = useContext(StoreContext);

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [confirmSection, setConfirmSection] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Spinner loading state


  const items = eventDatas.filter(event => selectedEvent.includes(event._id ?? event.id));
  
  const navigate = useNavigate();
 
  const totalAmount = items.length * 100;
  let couponDiscount = 0;

  couponDiscount = items.length === 4 ? 150
    : items.length === 3 ? 80
      : items.length === 2 ? 40
        : 0;

  const grandTotal = totalAmount - couponDiscount;

  useEffect(() => {
    setAmount(() => grandTotal)
    console.log(amount)
  }, [grandTotal]);

  // Register first for all cases; team details were collected in popup

  const isTeamEvent = (e) => {
    const size = e?.teamSize;
    if (!size) return false;
    const s = String(size).toLowerCase();
    if (s.includes('team')) return true;
    const nums = String(size).match(/\d+/g);
    return nums ? Number(nums?.[0]) > 1 : false;
  };

  // Prefill Register fields with team leader details from any selected team event (from popup)
  useEffect(() => {
    if (step !== 1) return; // only when on Register step
    const teamEventWithDetails = items.find(ev => {
      if (!isTeamEvent(ev)) return false;
      const id = ev._id ?? ev.id;
      const reg = eventRegistrations?.[id];
      return reg?.leader?.name || reg?.leader?.phone;
    });

    if (teamEventWithDetails) {
      const id = teamEventWithDetails._id ?? teamEventWithDetails.id;
      const reg = eventRegistrations?.[id];
      const leaderName = reg?.leader?.name || "";
      const leaderEmail = reg?.leader?.email || "";
      const leaderPhone = reg?.leader?.phone || "";

      setData(prev => ({
        ...prev,
        name: prev.name && prev.name.trim() ? prev.name : leaderName,
        email: prev.email && prev.email.trim() ? prev.email : leaderEmail,
        mobile: prev.mobile && String(prev.mobile).trim() ? prev.mobile : leaderPhone
      }));
    }
  }, [step, items, eventRegistrations]);

  if (selectedEvent.length == 0) {
    navigate('/events');
  }

  const handleContinue = () => {
    if (step < 2) {
      setStep(step + 1);
    }
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
    else {
      navigate('/events');
    }
  };

  const validateForm = () => {

    const resolvedCollege = data.college === "Other" ? data.Othercollege : data.college;
    const resolvedBranch = data.branch === "Other" ? data.Otherbranch : data.branch;

    if (!resolvedCollege) {
      toast.error("Please enter your college name.");
      return;
    }

    if (!resolvedBranch) {
      toast.error("Please enter your branch.");
      return;
    }

    if (!data.name || !data.email || !data.mobile) {
      toast.error("Please fill out all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(data.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Persist resolved values so they get sent correctly
    if (data.college === "Other" || data.branch === "Other") {
      setData(prev => ({
        ...prev,
        college: data.college,
        branch: data.branch,
        Othercollege: data.college === "Other" ? resolvedCollege : prev.Othercollege,
        Otherbranch: data.branch === "Other" ? resolvedBranch : prev.Otherbranch,
      }));
    }

    // No team validation here; team details are collected in the popup when adding team events

    setConfirm();

  }
  const setConfirm = () => {
    setConfirmSection(!confirmSection);
  }


  const confirmPayment = async () => {
    setIsLoading(true)
    const confirmRes = await payNow();
    setIsLoading(false)

  }




  return (
    <div className="checkout-flex">
      {/* <div className="back" onClick={handleBack}>
        <i className="fa-solid fa-circle-chevron-left fa-2xl" style={{ color: "#1038d5" }}></i>
      </div> */}
      <div className="checkout-container">
        <img className='checkout-container-img' src="Bg-reg.jpg" alt="" />
        <div className="steps">
          <div className="step">
            <div className={`circle ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-title ${step >= 1 ? 'active' : ''}`}>Register</div>
          </div>
          <div className="step">
            <div className={`circle ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step-title ${step >= 2 ? 'active' : ''}`}>Checkout</div>
          </div>
        </div>

        {step === 1 &&
          <RegistrationForm />
        }

        {step === 2 &&
          <SelectedItemSection items={items} />
        }
      </div>
      {
        confirmSection &&
        <>
         <ConfirmSection items={items} totalAmount={totalAmount} couponDiscount={couponDiscount} grandTotal={grandTotal} setConfirm={setConfirm} step={step} confirmPayment={confirmPayment}/>
        </>
       
      }

      {isLoading &&
        <div className="spinner-overlay">
          <Preloader />
        </div>
      }

      <div className="continue-panel">
        <div className="terms">
          <i onClick={handleBack} className="fa-solid fa-arrow-left fa-lg" style={{ color: "#ffffff" }}></i>
          <i onClick={() => setSelectedEvent(() => [])} className="fa-solid fa-trash" style={{ color: "#ffffff" }}></i>
        </div>

        <div className="continue-section">
          {
            step === 1 ?
              <PayButton btnFunction={handleContinue} btnText={"Continue"} step={step} /> :
              <PayButton btnFunction={validateForm} btnText={"Confirm"} />
          }
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
